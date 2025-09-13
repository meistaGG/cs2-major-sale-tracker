import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";      // see note below about filename case
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);