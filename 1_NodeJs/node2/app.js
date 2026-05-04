// ══════════════════════════════════════════════════════
//  app.js — Servidor principal
//  Integra: http · fs · url · módulos propios · NPM
// ══════════════════════════════════════════════════════

import { createServer }   from 'node:http';
import { readFile }       from 'node:fs';
import { URL }            from 'node:url';
import { upperCase }      from 'upper-case';            // PUNTO 4 — NPM

import { sumar, restar, multiplicar, division } from './modulos/calculos.js'; // PUNTO 1
import { hora, fecha }                          from './modulos/hora.js';     // PUNTO 1
import { climaAleatorio, temperatura }          from './modulos/tiempo.js';  // PUNTO 1
import { paginaHTML }                           from './modulos/menu.js';     // PUNTO 5

const PORT = 3000;

// ── Función auxiliar: leer archivo con fs y responder ──────────────────────
// PUNTO 2: uso del módulo fs
function servirHTML(res, rutaArchivo, titulo, paginaActiva) {
  readFile(rutaArchivo, 'utf8', (err, fragmento) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Error leyendo archivo: ${err.message}`);
      return;
    }
    const html = paginaHTML(titulo, fragmento, paginaActiva);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
}

// ── Función auxiliar: responder con HTML dinámico ─────────────────────────
function servirDinamico(res, titulo, contenido, paginaActiva) {
  const html = paginaHTML(titulo, contenido, paginaActiva);
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

// ══════════════════════════════════════════════════════
//  SERVIDOR HTTP — PUNTO 2
// ══════════════════════════════════════════════════════
const server = createServer((req, res) => {

  // ── PUNTO 3: módulo URL ─────────────────────────────
  const baseURL = `http://localhost:${PORT}`;
  const urlObj  = new URL(req.url, baseURL);
  const ruta    = urlObj.pathname;

  // Log en consola de los datos del módulo URL
  console.log('──────────────────────────────');
  console.log('📌 Módulo URL — Nueva petición');
  console.log(`   host:     ${urlObj.host}`);
  console.log(`   pathname: ${urlObj.pathname}`);
  console.log(`   search:   ${urlObj.search || '(ninguna)'}`);
  console.log(`   href:     ${urlObj.href}`);
  console.log('──────────────────────────────');

  // ── CSS estático ──────────────────────────────────
  if (ruta === '/estilos.css') {
    readFile('./public/css/estilos.css', 'utf8', (err, data) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // ── PÁGINA: Inicio — usa fs para leer el HTML ─────
  // PUNTO 2
  if (ruta === '/') {
    servirHTML(res, './paginas/inicio.html', 'Inicio', '/');
    return;
  }

  // ── PÁGINA: Calculadora — módulos propios ─────────
  // PUNTO 1
  if (ruta === '/calculadora') {
    const contenido = `
      <div class="grid-2">
        <div class="tarjeta">
          <h3>➕ Suma</h3>
          <p>5 + 3</p>
          <div class="resultado">${sumar(5, 3)}</div>
        </div>
        <div class="tarjeta">
          <h3>➖ Resta</h3>
          <p>8 - 6</p>
          <div class="resultado">${restar(8, 6)}</div>
        </div>
        <div class="tarjeta">
          <h3>✖️ Multiplicación</h3>
          <p>3 × 11</p>
          <div class="resultado">${multiplicar(3, 11)}</div>
        </div>
        <div class="tarjeta">
          <h3>➗ División</h3>
          <p>30 ÷ 5</p>
          <div class="resultado">${division(30, 5)}</div>
        </div>
      </div>
      <div class="tarjeta">
        <h3>📦 Módulo usado</h3>
        <p>Importado desde <strong>modulos/calculos.js</strong> — módulo propio (ES Module)</p>
        <p><code>import { sumar, restar, multiplicar, division } from './modulos/calculos.js'</code></p>
      </div>`;
    servirDinamico(res, 'Calculadora', contenido, '/calculadora');
    return;
  }

  // ── PÁGINA: Reloj — módulo hora ───────────────────
  if (ruta === '/reloj') {
    const contenido = `
      <div class="grid-2">
        <div class="tarjeta">
          <h3>🕐 Hora actual</h3>
          <div class="resultado">${hora()}</div>
        </div>
        <div class="tarjeta">
          <h3>📅 Fecha actual</h3>
          <div class="resultado">${fecha()}</div>
        </div>
      </div>
      <div class="tarjeta">
        <h3>📦 Módulo usado</h3>
        <p>Importado desde <strong>modulos/hora.js</strong> — módulo propio (ES Module)</p>
        <p>Recargá la página para actualizar la hora.</p>
      </div>`;
    servirDinamico(res, 'Reloj', contenido, '/reloj');
    return;
  }

  // ── PÁGINA: Clima — módulo tiempo ─────────────────
  if (ruta === '/clima') {
    const contenido = `
      <div class="grid-2">
        <div class="tarjeta">
          <h3>🌡️ Clima de hoy</h3>
          <div class="resultado">${climaAleatorio()}</div>
        </div>
        <div class="tarjeta">
          <h3>🌡️ Temperatura</h3>
          <div class="resultado">${temperatura()}°C</div>
        </div>
      </div>
      <div class="tarjeta">
        <h3>📦 Módulo usado</h3>
        <p>Importado desde <strong>modulos/tiempo.js</strong> — módulo propio (ES Module)</p>
      </div>`;
    servirDinamico(res, 'Clima', contenido, '/clima');
    return;
  }

  // ── PÁGINA: Info URL — módulo url ─────────────────
  // PUNTO 3
  if (ruta === '/url-info') {
    const ejemploURL = new URL('https://miapp.com:8080/productos?categoria=ropa&pagina=2#ofertas');
    const contenido = `
      <div class="tarjeta">
        <h3>🔗 URL analizada</h3>
        <p><strong>URL:</strong> <code>https://miapp.com:8080/productos?categoria=ropa&amp;pagina=2#ofertas</code></p>
        <br>
        <div class="grid-2">
          <p>🏠 <strong>host:</strong></p>      <div class="resultado">${ejemploURL.host}</div>
          <p>🔒 <strong>protocol:</strong></p>  <div class="resultado">${ejemploURL.protocol}</div>
          <p>📂 <strong>pathname:</strong></p>  <div class="resultado">${ejemploURL.pathname}</div>
          <p>🔍 <strong>search:</strong></p>    <div class="resultado">${ejemploURL.search}</div>
          <p>#️⃣ <strong>hash:</strong></p>      <div class="resultado">${ejemploURL.hash}</div>
          <p>🔌 <strong>port:</strong></p>      <div class="resultado">${ejemploURL.port}</div>
        </div>
      </div>
      <div class="tarjeta">
        <h3>📡 Tu petición actual</h3>
        <div class="grid-2">
          <p><strong>host:</strong></p>     <div class="resultado">${urlObj.host}</div>
          <p><strong>pathname:</strong></p> <div class="resultado">${urlObj.pathname}</div>
          <p><strong>href:</strong></p>     <div class="resultado">${urlObj.href}</div>
        </div>
      </div>
      <div class="tarjeta">
        <h3>📦 Módulo usado</h3>
        <p>Módulo nativo de Node.js: <strong>node:url</strong></p>
        <p><code>import { URL } from 'node:url'</code></p>
        <p>También se imprimen los datos por consola en cada request.</p>
      </div>`;
    servirDinamico(res, 'Info URL', contenido, '/url-info');
    return;
  }

  // ── PÁGINA: Upper Case — NPM ──────────────────────
  // PUNTO 4
  if (ruta === '/upper-case') {
    const frases = [
      'hola mundo desde node.js',
      'módulos npm son muy útiles',
      'aprendiendo backend con javascript',
    ];
    const items = frases.map(f => `
      <div class="tarjeta">
        <p>Original: <strong>${f}</strong></p>
        <div class="resultado">${upperCase(f)}</div>
      </div>`).join('');

    const contenido = `
      ${items}
      <div class="tarjeta">
        <h3>📦 Paquete NPM usado</h3>
        <p>Instalado con: <code>npm install upper-case</code></p>
        <p>Importado con: <code>import { upperCase } from 'upper-case'</code></p>
        <p>Convierte cualquier texto a MAYÚSCULAS.</p>
      </div>`;
    servirDinamico(res, 'Upper Case (NPM)', contenido, '/upper-case');
    return;
  }

  // ── 404 ───────────────────────────────────────────
  const contenido404 = `
    <div class="tarjeta">
      <h3>😕 Página no encontrada</h3>
      <p>La ruta <strong>${ruta}</strong> no existe.</p>
      <p><a href="/">← Volver al inicio</a></p>
    </div>`;
  servirDinamico(res, '404 — No encontrado', contenido404, '');
  res.statusCode = 404;
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log('📄 Páginas disponibles:');
  console.log('   /             → Inicio (lee inicio.html con fs)');
  console.log('   /calculadora  → Módulos propios: calculos.js');
  console.log('   /reloj        → Módulos propios: hora.js');
  console.log('   /clima        → Módulos propios: tiempo.js');
  console.log('   /url-info     → Módulo nativo: node:url');
  console.log('   /upper-case   → Paquete NPM: upper-case');
});
