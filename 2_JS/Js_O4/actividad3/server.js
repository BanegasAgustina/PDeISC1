// Importa herramientas nativas de Node.js para levantar un servidor web simple.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Define un puerto propio para esta actividad.
let PORT = process.env.PORT || 3003;

// Define la carpeta principal de la actividad y la carpeta de assets.
let currentFile = fileURLToPath(import.meta.url);
let ROOT = path.dirname(currentFile);
let ASSETS_ROOT = path.join(ROOT, "..", "assets");

// Indica el tipo de contenido que corresponde a cada extension.
let mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8"
};

// Envia una respuesta JSON para errores del servidor.
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

// Sirve un archivo estatico al navegador.
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

// Decide que archivo se debe entregar segun la URL recibida.
function resolveStaticPath(urlPath) {
  let cleanPath = decodeURIComponent(urlPath.split("?")[0]);

  if (cleanPath.startsWith("/assets/")) {
    return path.join(ASSETS_ROOT, cleanPath.replace("/assets/", ""));
  }

  let requestedPath = cleanPath === "/" ? "/index.html" : cleanPath;
  return path.join(ROOT, requestedPath);
}

// Crea el servidor unico de la actividad 3.
let server = http.createServer((req, res) => {
  let filePath = resolveStaticPath(req.url);
  sendFile(res, filePath);
});

// Inicia el servidor en un puerto independiente.
server.listen(PORT, () => {
  console.log(`Actividad 3 disponible en http://localhost:${PORT}`);
});
