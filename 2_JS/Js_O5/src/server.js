/**
 * ============================================================
 * server.js — Punto de entrada del backend (Js_O5)
 * ============================================================
 * Este archivo crea el servidor Express y conecta:
 *   - La API REST (POST /api/alumnos)
 *   - Los archivos estáticos del frontend (carpeta public/)
 *
 * Para iniciarlo: npm start  →  http://localhost:3005
 */

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import alumnosRouter from "./routes/alumnos.js";

// En módulos ES no existe __dirname; se obtiene a partir de import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Puerto donde escucha el servidor (debe coincidir con el que uses en el navegador)
const PORT = 3005;

// Instancia principal de Express
const app = express();

// --- Middlewares globales ---

// Permite leer el cuerpo de las peticiones POST como JSON (req.body)
app.use(express.json());

// Sirve archivos estáticos: index.html, css/styles.css, js/script.js, etc.
// La ruta ".." sube desde src/ hasta la raíz del proyecto y entra en public/
app.use(express.static(path.join(__dirname, "..", "public")));

// --- Rutas de la API ---

// Todas las operaciones de alumnos van bajo /api/alumnos
// Ejemplo: POST http://localhost:3005/api/alumnos
app.use("/api/alumnos", alumnosRouter);

// --- Arranque del servidor ---

app.listen(PORT, () => {
  console.log(`Servidor: http://localhost:${PORT}`);
  console.log(`API:      http://localhost:${PORT}/api/alumnos`);
  console.log(`JSON:     data/alumnos.json`);
});
