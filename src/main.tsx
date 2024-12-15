import { createRoot } from "react-dom/client";
import App from "./App";
import SecondApp from "./SecondApp";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <SecondApp />
  </>
);
