// Importa modulos nativos de Node.js para crear el servidor y servir archivos.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Define un puerto propio para esta actividad.
let PORT = process.env.PORT || 3002;

// Guarda rutas necesarias: la carpeta actual y los recursos compartidos.
let currentFile = fileURLToPath(import.meta.url);
let ROOT = path.dirname(currentFile);
let ASSETS_ROOT = path.join(ROOT, "..", "assets");

// Define tipos MIME para que el navegador interprete correctamente cada archivo.
let mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8"
};

// Devuelve errores en formato JSON.
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

// Lee y responde un archivo estatico.
function sendFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { error: "Archivo no encontrado" });
      return;
    }

    let extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[extension] || "application/octet-stream" });
    res.end(content);
  });
}

// Resuelve las rutas de la pagina y de los assets compartidos.
function resolveStaticPath(urlPath) {
  let cleanPath = decodeURIComponent(urlPath.split("?")[0]);

  if (cleanPath.startsWith("/assets/")) {
    return path.join(ASSETS_ROOT, cleanPath.replace("/assets/", ""));
  }

  let requestedPath = cleanPath === "/" ? "/index.html" : cleanPath;
  return path.join(ROOT, requestedPath);
}

// Crea el servidor unico de la actividad 2.
let server = http.createServer((req, res) => {
  let filePath = resolveStaticPath(req.url);
  sendFile(res, filePath);
});

// Levanta el servidor en su puerto independiente.
server.listen(PORT, () => {
  console.log(`Actividad 2 disponible en http://localhost:${PORT}`);
});
