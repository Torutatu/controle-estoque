import React from "react";
import ReactDOM from "react-dom/client";
import ControleEstoque from "./App.jsx";
import { AuthGate } from "./Auth.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthGate>
      <ControleEstoque />
    </AuthGate>
  </React.StrictMode>
);
