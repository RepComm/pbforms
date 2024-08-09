import { useEffect, useRef, useState } from "preact/hooks";
import "./styles.css";
import Pocketbase, { ListResult } from "pocketbase";
import { DB } from "../../db";
import { pb_schema_map } from "../../schema";

interface FormListProps {
  itemCount?: number;
}

export function FormList(props: FormListProps) {
  const [pageIndex, setPageIndex] = useState(1);
  const itemCount = props.itemCount || 3;

  const [list, setList] =
    useState<ListResult<pb_schema_map["forms"]>>(undefined);

  useEffect(() => {
    DB.ListForms(pageIndex, itemCount).then((v) => {
      setList(v);
    });
  }, [pageIndex, itemCount]);

  const elist = [];
  if (list != undefined) {
    for (const item of list.items) {
      elist.push(
        <FormLink
          title={item.title}
          description={item.description}
          href={"/form/" + item.id}
        />,
      );
    }
  }

  return (
    <section
      class="formlist"
      style={{
        gridTemplateRows: itemCount + 2,
      }}
    >
      <h2>Forms</h2>
      <div class="formlist-buttons">
        <button
          class="formlist-button"
          onClick={() => {
            setPageIndex(Math.max(1, pageIndex - 1));
          }}
        >
          Previous
        </button>
        <span class="formlist-pageindex">Page {pageIndex} </span>
        <button
          class="formlist-button"
          onClick={() => {
            setPageIndex(Math.max(1, pageIndex + 1));
          }}
        >
          Next
        </button>
      </div>
      {elist}
    </section>
  );
}

function FormLink(props) {
  return (
    <a class="formlist-item" href={props.href}>
      <h2>{props.title}</h2>
      <p>{props.description}</p>
    </a>
  );
}
