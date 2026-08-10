// main.tsx - Punto de entrada: conecta React con el HTML
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Busca <div id="root"> en index.html y renderiza <App /> dentro
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
