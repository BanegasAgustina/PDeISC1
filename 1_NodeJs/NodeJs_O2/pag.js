import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import { fileURLToPath } from "node:url";

import { menuPag } from "./modulos/menu.js";
import { sumar, restar, multiplicar, division } from "./modulos/calculos.js";
import { reloj } from "./modulos/hora.js";
import { clima } from "./modulos/tiempo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_FILE = path.join(__dirname, "pag.html");

const server = http.createServer((req, res) => {
  const urlInfo = new URL(req.url, "http://localhost:3000");
  let contenido = "";

  switch (urlInfo.pathname) {
    case "/":
      contenido = `
                <h1>Esto es Node</h1>
                <p>Archivo servido con los módulos <strong>http</strong> y <strong>fs</strong> de Node.js</p>
            `;
      break;

    case "/calculadora":
      const a = 10;
      const b = 5;
      contenido = `
                <h1>Calculadora</h1>
                <p>Suma 10+ 5: ${sumar(a, b)}</p>
                <p>Resta  10 - 5: ${restar(a, b)}</p>
                <p>Multiplicación 10* 5: ${multiplicar(a, b)}</p>
                <p>División 10/5: ${division(a, b)}</p>
            `;
      break;

    case "/reloj":
      contenido = reloj();
      break;

    case "/clima":
      contenido = clima();
      break;

    case "/acerca":
      contenido = `
                <h1>Acerca de</h1>
                <p>Proyecto desarrollado con módulos de Node.js.</p>
            `;
      break;

    default:
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>404 - Página no encontrada</h1>");
      return;
  }

  fs.readFile(HTML_FILE, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Error al cargar la plantilla");
      return;
    }

    const html = data
      .replace("{{MENU}}", menuPag())
      .replace("{{CONTENIDO}}", contenido);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  });
});

server.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
