// schema2jsdoc - https://gist.github.com/RepComm/c1a2f1d8d8dc52d954eb01ab88866153
declare import PocketBaseImport, {RecordService,RecordModel} from "pocketbase";
interface users extends RecordModel {
 name: string;
 avatar: string;
}
interface form_fields extends RecordModel {
 collection_id: string;
 display_name: string;
 field_id: string;
}
interface forms extends RecordModel {
 title: string;
 description: string;
 submit_rule: string;
 /**relation id, use .expand property*/
 editors: string;
 /**relation id, use .expand property*/
 submit_domains: string;
 /**relation id, use .expand property*/
 fields: string;
 /**relation id, use .expand property*/
 owner: string;
 expand?: {
  editors: CollectionIdNameMap["_pb_users_auth_"][];
  submit_domains: CollectionIdNameMap["5c1sbtfbk0k4n84"][];
  fields: CollectionIdNameMap["428sipu3d1pysqn"][];
  owner: CollectionIdNameMap["_pb_users_auth_"];
 }
}
interface forms_domains extends RecordModel {
 domain_name: string;
}
export interface pb_schema_map {
 "users": users;
 "form_fields": form_fields;
 "forms": forms;
 "forms_domains": forms_domains;
}
export interface TypedPocketBase extends PocketBaseImport {
 collection(idOrName: string): RecordService;
 collection(idOrName: "users"): RecordService<users>;
 collection(idOrName: "form_fields"): RecordService<form_fields>;
 collection(idOrName: "forms"): RecordService<forms>;
 collection(idOrName: "forms_domains"): RecordService<forms_domains>;
}
interface CollectionIdNameMap {
 "_pb_users_auth_": users;
 "428sipu3d1pysqn": form_fields;
 "tx6dlf3fjzj1abp": forms;
 "5c1sbtfbk0k4n84": forms_domains;
}

