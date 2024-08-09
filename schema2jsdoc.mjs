#!/usr/bin/env node

import { readFileSync } from "fs";
import { exit } from "process";
function log(...msgs) {
  console.log("//", ...msgs);
}
function warn(...msgs) {
  log("WARN:", ...msgs);
}
log(
  "schema2jsdoc - https://gist.github.com/RepComm/c1a2f1d8d8dc52d954eb01ab88866153",
);

function error(...msgs) {
  console.error("//ERROR: ", ...msgs);
}

let schemaData = "";
try {
  //read stdin (aka 0 in the first arg) fully to text instead of an actual file
  //https://stackoverflow.com/a/56012724/8112809
  schemaData = readFileSync(0, { encoding: "utf-8" });
} catch (ex) {
  error(
    "couldn't read schema from standard input, try: cat pb_schema.json | ./schema2jsdoc.mjs",
    ex,
  );
  exit(2);
}

/**@typedef {import("./schema2jsdoc").pb_schema} pb_schema*/

/**@type {pb_schema}*/
let schemaJson = {};
try {
  schemaJson = JSON.parse(schemaData);
} catch (ex) {
  error(
    "couldn't parse schema json, try: cat pb_schema.json | ./schema2jsdoc.mjs",
    ex,
  );
  exit(3);
}

if (!Array.isArray(schemaJson)) {
  error("schema root is not an array");
  exit(4);
}

if (schemaJson.length < 1) {
  error("schema root array length < 1");
  exit(5);
}

function fieldToPropType(field_type) {
  switch (field_type) {
    case "text":
      return "string";
    case "number":
      return "number";
    case "relation":
      return "string";
    case "editor":
      return "string";
    case "file":
      return "string";
    case "select":
      return "string";
    case "bool":
      return "boolean";
    default:
      warn(`unknown field type '${field_type}' using 'any' as a catch-all`);
      return "any";
  }
}

/** May be incomplete, but should handle many cases
 * Used as a reference
 * https://www.w3schools.com/js/js_reserved.asp
 */
const JS_RESERVED_WORDS = new Set([
  "arguments",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "eval",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "native",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "throws",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

function resolveName(field_name) {
  if (JS_RESERVED_WORDS.has(field_name)) {
    return `__${field_name}`;
  } else {
    return field_name;
  }
}

let output = "";

output +=
  'declare import PocketBaseImport, {RecordService,RecordModel} from "pocketbase";\n';

const collectionToInterfaceNameMap = new Map();
const collectionNameToIdMap = new Map();

for (const entry of schemaJson) {
  //not all strings are valid typescript interface names, quell some common issues here
  const ifname = resolveName(entry.name);

  //track collection id - used for relation mapping of 'expand' property in typescript definition output
  collectionNameToIdMap.set(ifname, entry.id);

  //save the remapping for later for output type pb_schema_map
  collectionToInterfaceNameMap.set(entry.name, ifname);

  //begin writing the interface
  output += `interface ${ifname} extends RecordModel {\n`;

  const fieldNameToRelationIdMap = new Map();
  const fieldNameToRelationExpandIsArray = new Map();
  //output props of collection types
  for (const field of entry.schema) {
    if (field.type === "relation") {
      fieldNameToRelationIdMap.set(field.name, field.options.collectionId);
      output += ` /**relation id, use .expand property*/\n`;
    }
    if (!field.options.maxSelect || field.options.maxSelect !== 1) {
      fieldNameToRelationExpandIsArray.set(field.name, true);
    }
    const ft = fieldToPropType(field.type);
    output += ` ${field.name}: ${ft};\n`;
  }

  //output expand prop if necessary
  if (fieldNameToRelationIdMap.size > 1) {
    output += ` expand?: {\n`;
    for (const [name, collectionId] of fieldNameToRelationIdMap) {
      //use the relation collection id to avoid extra looping thru schema for lookups
      //typescript definitions are good at this anyways, plus it looks cool
      if (fieldNameToRelationExpandIsArray.get(name) === true) {
        output += `  ${name}: CollectionIdNameMap["${collectionId}"][];\n`;
      } else {
        output += `  ${name}: CollectionIdNameMap["${collectionId}"];\n`;
      }
    }
    output += " }\n";
  }

  //end the interface
  output += "}\n";
}

//output pb_schema_map for mapping collection names to interface names
output += "export interface pb_schema_map {\n";
for (const [k, v] of collectionToInterfaceNameMap) {
  output += ` "${k}": ${v};\n`;
}
output += "}\n";

//output TypedPocketBase
output += "export interface TypedPocketBase extends PocketBaseImport {\n";
output += " collection(idOrName: string): RecordService;\n";
for (const [k, v] of collectionToInterfaceNameMap) {
  output += ` collection(idOrName: "${k}"): RecordService<${v}>;\n`;
}
output += "}\n";

//output CollectionIdNameMap for mapping collection ids to interfaces
output += "interface CollectionIdNameMap {\n";
for (const [name, id] of collectionNameToIdMap) {
  output += ` "${id}": ${name};\n`;
}
output += "}\n";

//output result
console.log(output);
