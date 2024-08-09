import preactLogo from "../../assets/preact.svg";
import { BrandCorner } from "../../components/BrandCorner";
import { FormList } from "../../components/formlist/FormList";
import "./style.css";

export function Home() {
  return (
    <div class="home">
      <FormList />
    </div>
  );
}
