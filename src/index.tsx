import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import { Header } from "./components/Header.jsx";
import { Home } from "./pages/Home/index.jsx";
import { NotFound } from "./pages/_404.jsx";
import "./style.css";
import { DB } from "./db.js";
import { Form } from "./pages/form/index.js";
import { Auth } from "./pages/auth/index.js";
import { CSVPage } from "./pages/csv/CsvPage.js";

export function App() {
  DB.init(`${window.location.protocol}//${window.location.hostname}:8090`);

  return (
    <LocationProvider>
      <Header />
      <main>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/form/:formId" component={Form} />
          <Route path="/auth" component={Auth} />
          <Route path="/csv" component={CSVPage} />
          <Route default component={NotFound} />
        </Router>
      </main>
    </LocationProvider>
  );
}

render(<App />, document.getElementById("app"));
