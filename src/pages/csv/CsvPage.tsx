import { useEffect, useState } from "preact/hooks";
import { DB } from "../../db";
import "./styles.css";
import { CollectionModel } from "pocketbase";
import { createRef, JSX } from "preact";

interface CSVPageProps {}

export function CSVPage(props: CSVPageProps) {
  const [schemasState, setSchemasState] = useState<{
    schemas: CollectionModel[];
    asOptions: JSX.Element[];
  }>({
    schemas: undefined,
    asOptions: [],
  });

  useEffect(() => {
    DB.GetCollectionSchemas().then((schemas) => {
      const asOptions = schemas.map((sch, idx) => <option>{sch.name}</option>);
      setSchemasState({
        schemas,
        asOptions,
      });
    });
  }, []);

  const exportSelectorRef = createRef<HTMLSelectElement>();

  return (
    <div class="csv_page">
      <div class="export">
        <h2>Export</h2>
        <button
          class="import_export_button"
          onClick={async () => {
            const opt = exportSelectorRef.current.selectedOptions[0];
            DB.ctx
              .collection(opt.value)
              .getFullList()
              .then((records) => {
                if (!records || records.length < 1) {
                  alert("records undefined or length < 1");
                  return;
                }
                const first = records[0];
                const keys = Object.keys(first);
                let result = '"' + keys.join('","') + '"\n';
                for (const r of records) {
                  for (let i = 0; i < keys.length; i++) {
                    const k = keys[i];
                    if (i === keys.length - 1) {
                      result += `"${r[k]}"\n`;
                    } else {
                      result += `"${r[k]}",`;
                    }
                  }
                }
                const dl = document.createElement("a");
                dl.download = `${first.collectionName}.csv`;
                dl.href = URL.createObjectURL(
                  new Blob([result], { type: "text/plain" }),
                );
                dl.click();
              });
          }}
        >
          Export
        </button>
        <div class="row space-around">
          <label for="collection_selector">Collection</label>
          <select id="collection_selector" ref={exportSelectorRef}>
            {schemasState.asOptions}
          </select>
        </div>
      </div>
      <div class="import">
        <h2>Import</h2>
        <button class="import_export_button">Import</button>
        <input type="file" id="csv_import_file"></input>
      </div>
    </div>
  );
}
