// Importa modulos nativos de Node.js para crear el servidor y leer archivos.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Define un puerto propio para esta actividad.
let PORT = process.env.PORT || 3001;

// Guarda la ruta de esta carpeta y la ruta de los recursos compartidos.
let currentFile = fileURLToPath(import.meta.url);
let ROOT = path.dirname(currentFile);
let ASSETS_ROOT = path.join(ROOT, "..", "assets");

// Relaciona extensiones de archivo con su tipo de contenido.
let mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8"
};

// Envia respuestas JSON para errores simples.
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

// Lee un archivo del disco y lo envia al navegador.
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

// Convierte una URL del navegador en una ruta de archivo permitida.
function resolveStaticPath(urlPath) {
  let cleanPath = decodeURIComponent(urlPath.split("?")[0]);

  // Permite cargar los estilos y el cambio de tema desde /assets.
  if (cleanPath.startsWith("/assets/")) {
    return path.join(ASSETS_ROOT, cleanPath.replace("/assets/", ""));
  }

  // Si entran a la raiz del servidor, muestra la pagina unica de esta actividad.
  let requestedPath = cleanPath === "/" ? "/index.html" : cleanPath;
  return path.join(ROOT, requestedPath);
}

// Crea el servidor HTTP de esta actividad.
let server = http.createServer((req, res) => {
  let filePath = resolveStaticPath(req.url);
  sendFile(res, filePath);
});

// Inicia el servidor y muestra la URL para abrir la pagina.
server.listen(PORT, () => {
  console.log(`Actividad 1 disponible en http://localhost:${PORT}`);
});
