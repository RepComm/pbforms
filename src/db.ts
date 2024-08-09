import Pocketbase, { AuthMethodsList, CollectionModel } from "pocketbase";
import type { pb_schema_map, TypedPocketBase } from "./schema";

export class DB {
  static ctx: TypedPocketBase;
  static init(baseUrl: string = undefined) {
    if (DB.ctx == null) {
      DB.ctx = new Pocketbase(baseUrl);
    }
  }
  static async ListForms(pageIndex: number = 1, perPage: number = 3) {
    return DB.ctx.collection("forms").getList(pageIndex, perPage);
  }
  static async GetForm(formId: string, expand: string = undefined) {
    return DB.ctx.collection("forms").getOne(formId, {
      expand,
    });
  }
  static IsLoggedIn() {
    return DB.ctx.authStore && DB.ctx.authStore.isValid;
  }
  static LoggedInEmail() {
    return DB.ctx.authStore?.model?.email;
  }
  static async ListAuthMethods() {
    return DB.ctx.collection("users").listAuthMethods();
  }
  static async GetCollectionSchema(collectionId: string) {
    // let result: CollectionModel;
    //only works for admin
    // return DB.ctx.collections.getOne(collectionId);

    //HACKY and insecure! requires a pb_hook anyways
    // const url = `${DB.ctx.baseUrl}/api/schema/${collectionId}`;
    // const res = await fetch(url);
    // const json = await res.json();

    // result = json.collection;

    //select id, schema from `_collections`
    return DB.ctx
      .collection("schemas")
      .getFirstListItem<CollectionModel>(`name="${collectionId}"`);

    // return result;
  }
  static async GetFormFields(f: pb_schema_map["forms"]) {
    const _schemas = new Map<string, CollectionModel>();

    async function getCollectionSchema(collectionId: string) {
      if (_schemas.has(collectionId)) {
        return _schemas.get(collectionId);
      } else {
        const _s = await DB.GetCollectionSchema(collectionId);
        _schemas.set(collectionId, _s);
        return _s;
      }
    }

    const field_schemas = new Map<string, SchemaField>();

    for (const field of f.expand.fields) {
      const collection = await getCollectionSchema(field.collection_id);
      for (const field_schema of collection.schema) {
        if (field_schema.name === field.field_id) {
          field_schemas.set(field.field_id, field_schema as any);
        }
      }
    }
    return field_schemas;
  }
}
