import { useLocation } from "preact-iso";
import { BrandCorner } from "./BrandCorner";

export function Header() {
  const { url } = useLocation();

  return (
    <header>
      <BrandCorner />
      <nav>
        <a href="/" class={url == "/" && "active"}>
          Home
        </a>
        <a href="/csv" class={url == "/csv" && "active"}>
          CSV
        </a>
        <a href="/auth" class={url == "/auth" && "active"}>
          Auth
        </a>
      </nav>
    </header>
  );
}
