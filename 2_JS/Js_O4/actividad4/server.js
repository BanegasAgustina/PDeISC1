// Importa modulos nativos de Node.js para crear una API y servir la pagina.
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Define un puerto propio para la actividad 4.
let PORT = process.env.PORT || 3004;

// Define las rutas de la carpeta actual y de los recursos compartidos.
let currentFile = fileURLToPath(import.meta.url);
let ROOT = path.dirname(currentFile);
let ASSETS_ROOT = path.join(ROOT, "..", "assets");
let ALUMNOS_FILE = path.join(ROOT, "alumnos.json");

// Relaciona extensiones de archivo con tipos MIME.
let mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

// Envia datos en formato JSON.
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data));
}

// Lee un archivo estatico y lo devuelve al navegador.
async function sendFile(res, filePath) {
  try {
    let content = await fs.readFile(filePath);
    let extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
    });
    res.end(content);
  } catch (error) {
    sendJson(res, 404, { error: "Archivo no encontrado" });
  }
}

// Convierte la URL solicitada en un archivo permitido.
function resolveStaticPath(urlPath) {
  let cleanPath = decodeURIComponent(urlPath.split("?")[0]);

  if (cleanPath.startsWith("/assets/")) {
    return path.join(ASSETS_ROOT, cleanPath.replace("/assets/", ""));
  }

  let requestedPath = cleanPath === "/" ? "/index.html" : cleanPath;
  return path.join(ROOT, requestedPath);
}

// Lee el cuerpo JSON que llega en un POST.
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

// Lee los alumnos desde el archivo JSON.
async function readAlumnosFromFile() {
  try {
    let data = await fs.readFile(ALUMNOS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe, devolvemos un array vacío
    return [];
  }
}

// Guarda los alumnos en el archivo JSON.
async function writeAlumnosToFile(alumnos) {
  await fs.writeFile(ALUMNOS_FILE, JSON.stringify(alumnos, null, 2), "utf-8");
}

// Crea el servidor unico de la actividad 4.
let server = http.createServer(async (req, res) => {
  // Responde la API local cuando el navegador pide /api/alumnos.
  if (req.url.startsWith("/api/alumnos")) {
    if (req.method === "GET") {
      let alumnos = await readAlumnosFromFile();
      sendJson(res, 200, alumnos);
      return;
    }

    if (req.method === "POST") {
      try {
        let data = await readJsonBody(req);

        // Validar que nombre y email existan
        if (!data.nombre || !data.email) {
          sendJson(res, 400, { error: "Nombre y email son obligatorios" });
          return;
        }

        let alumnos = await readAlumnosFromFile();

        // Verificar si el alumno ya existe por email (solo email)
        let alumnoExistente = alumnos.find(
          (a) => a.email.toLowerCase() === data.email.toLowerCase(),
        );

        if (alumnoExistente) {
          sendJson(res, 409, { error: "El email ya está registrado" });
          return;
        }

        // Generar ID incremental
        let maxId =
          alumnos.length > 0 ? Math.max(...alumnos.map((a) => a.id)) : 0;
        let nuevoAlumno = {
          id: maxId + 1,
          nombre: data.nombre,
          email: data.email,
        };

        alumnos.push(nuevoAlumno);
        await writeAlumnosToFile(alumnos);
        sendJson(res, 201, nuevoAlumno);
      } catch (error) {
        sendJson(res, 400, { error: "JSON invalido" });
      }

      return;
    }

    if (req.method !== "GET" && req.method !== "POST") {
      sendJson(res, 405, { error: "Metodo no permitido" });
      return;
    }
  }

  // Si no es una ruta de API, entrega archivos de la pagina.
  let filePath = resolveStaticPath(req.url);
  await sendFile(res, filePath);
});

// Levanta el servidor en el puerto independiente de esta actividad.
server.listen(PORT, () => {
  console.log(`Actividad 4 disponible en http://localhost:${PORT}`);
  console.log(`Datos persistidos en: ${ALUMNOS_FILE}`);
});
