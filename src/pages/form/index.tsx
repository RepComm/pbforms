import { useEffect, useState } from "preact/hooks";
import "./style.css";
import { DB } from "../../db";
import { pb_schema_map } from "../../schema";
import { JSX } from "preact/jsx-runtime";
import { createRef } from "preact";

interface FormProps {
  formId: string;
}

export function Form(props: FormProps) {
  let [f, setF] = useState<pb_schema_map["forms"]>(undefined);
  let [fieldSchemas, setFieldSchemas] = useState<Map<string, SchemaField>>();

  let df: JSX.Element;

  //schedule a form load
  useEffect(() => {
    DB.GetForm(props.formId, "fields").then((_f) => {
      setF(_f);
    });
  }, [
    props.formId, //when formId is new/different
  ]);

  if (f === undefined) {
    if (props.formId === "" || props.formId === undefined) {
      df = <span>Invalid or non-present formId, nothing to load</span>;
    } else {
      df = <span>Loading (this should take less than 1s..)</span>;
    }
  } else {
    let fields = [];

    useEffect(() => {
      DB.GetFormFields(f)
        .then(setFieldSchemas)
        .catch((reason) => {
          console.warn(reason);
        });
    }, [f]);

    if (f.expand?.fields && fieldSchemas) {
      for (const field of f.expand.fields) {
        const sch = fieldSchemas.get(field.field_id);
        if (!sch) {
          continue;
        }
        let e: JSX.Element;

        switch (sch.type) {
          case "file":
            {
              const inputRef = createRef<HTMLInputElement>();
              e = (
                <div class="file_input_wrapper">
                  <button
                    class="field_file_button_proxy"
                    onClick={(e) => {
                      inputRef.current.click();
                    }}
                  >
                    Upload
                  </button>
                  <input type="file" ref={inputRef}></input>
                </div>
              );
            }
            break;
          case "select":
            {
              const values = [];
              for (const v of sch.options.values) {
                values.push(<option>{v}</option>);
              }
              e = (
                <select
                  max={sch.options.maxSelect || 1}
                  min={sch.options.minSelect || 0}
                >
                  {values}
                </select>
              );
            }
            break;
          case "text":
          default:
            e = <input></input>;
            break;
        }

        fields.push(
          <div class="form-field">
            <span>{field.display_name}</span>
            {e}
          </div>,
        );
      }
    }
    df = (
      <div class="form-content">
        <h2>{f.title}</h2>
        <h4>{f.description}</h4>
        {fields}
      </div>
    );
  }
  return <div class="form">{df}</div>;
}
