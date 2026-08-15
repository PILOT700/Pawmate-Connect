import { createRoot } from "react-dom/client";
import App from "./App";
import { installGlobalErrorReporting } from "./lib/report-error";
import "./index.css";

// Before rendering, so a crash during the first render is caught too.
installGlobalErrorReporting();

createRoot(document.getElementById("root")!).render(<App />);
