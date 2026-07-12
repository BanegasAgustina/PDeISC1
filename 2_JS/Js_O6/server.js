// ============================================================
// server.js - Servidor Express del Juego del Ahorcado
// ============================================================
// Responsabilidades:
//  1. Servir los archivos estáticos del frontend (public/)
//  2. Exponer la API de palabras (/api/palabra) leyendo JSON locales
//  3. Guardar y consultar puntajes en MySQL (/api/score)

// ── Importaciones ────────────────────────────────────────────
const fs      = require('fs/promises'); // Sistema de archivos con soporte async/await
const path    = require('path');        // Manejo de rutas de archivos compatible con todos los SO
const express = require('express');     // Framework web para crear la API y servir estáticos
const cors    = require('cors');        // Permite que el navegador haga fetch desde otros orígenes
const db      = require('./db');        // Pool de conexiones a MySQL (ver db.js)

const app  = express();
const PORT = process.env.PORT || 3000; // Puerto configurable por variable de entorno, default 3000
const DATA_DIR = path.join(__dirname, 'data'); // Ruta absoluta a la carpeta /data con los JSON

// ── Categorías disponibles ───────────────────────────────────
// Debe coincidir con los nombres de los archivos en /data (sin extensión).
const CATEGORIAS = [
  'tecnologia', 'animales',   'deportes', 'comida',
  'paises',     'profesiones','objetos',  'naturaleza',
  'musica',     'peliculas',  'programacion', 'general'
];

// ── Reglas de dificultad ─────────────────────────────────────
// min/max: longitud de letras reales de la palabra (sin espacios ni guiones).
// intentos: siempre 6 para que coincida con las 6 partes del muñeco SVG.
// pistas: cuántas pistas puede usar el jugador (más pistas = más fácil).
const DIFICULTADES = {
  facil:   { min: 4,  max: 6,        intentos: 6, pistas: 3 },
  media:   { min: 6,  max: 9,        intentos: 6, pistas: 1 },
  dificil: { min: 10, max: Infinity, intentos: 6, pistas: 0 }
};

// ── Middlewares globales ─────────────────────────────────────
app.use(cors());                   // Habilita CORS para todos los orígenes
app.use(express.json());           // Parsea el body de las requests con Content-Type: application/json
app.use(express.static('public')); // Sirve todos los archivos de /public como estáticos (HTML, CSS, JS)

// ── Funciones auxiliares ─────────────────────────────────────

// Normaliza texto para comparar parámetros de la URL sin depender de
// mayúsculas, tildes ni espacios. La ñ se preserva para no colisionar con n.
// Ejemplo: "Tecnología" → "tecnologia", "Fácil" → "facil"
function normalizarTexto(texto = '') {
  return String(texto)
    .trim()
    .toLowerCase()
    .replace(/ñ/g, '\x00ñ\x00')           // Protege la ñ antes de normalizar
    .normalize('NFD')                       // Descompone vocales acentuadas
    .replace(/[\u0300-\u036f]/g, '')        // Elimina los diacríticos
    .replace(/\x00ñ\x00/g, 'ñ')            // Restaura la ñ
    .replace(/\s+/g, '_');                 // Reemplaza espacios con guiones bajos
}

// Cuenta las letras reales de una palabra, ignorando espacios y guiones.
// Se usa para filtrar palabras por longitud según la dificultad.
// Incluye letras latinas extendidas (ñ, vocales con tilde, etc.).
function contarLetras(palabra) {
  return palabra.replace(/[^a-zA-Z\u00c0-\u017f\u00f1\u00d1]/g, '').length;
}

// Lee y valida los parámetros ?categoria= y ?dificultad= de la query string.
// Si el valor no es válido, devuelve el default correspondiente.
function obtenerFiltros(req) {
  const categoria  = normalizarTexto(req.query.categoria  || 'general');
  const dificultad = normalizarTexto(req.query.dificultad || 'media');

  return {
    categoria:  CATEGORIAS.includes(categoria)    ? categoria  : 'general',
    dificultad: DIFICULTADES[dificultad]           ? dificultad : 'media'
  };
}

// Lee el JSON de una categoría y filtra las palabras según la dificultad.
// Retorna el array de palabras que cumplen los requisitos de longitud.
async function obtenerPalabrasPorFiltro(categoria, dificultad) {
  const archivo  = path.join(DATA_DIR, `${categoria}.json`); // Ruta al archivo de palabras
  const contenido = await fs.readFile(archivo, 'utf8');       // Lee el archivo como texto
  const palabras  = JSON.parse(contenido);                    // Convierte el JSON a array
  const reglas    = DIFICULTADES[dificultad];

  // Filtra: solo las palabras cuya longitud real esté en el rango de la dificultad
  return palabras.filter((palabra) => {
    const longitud = contarLetras(palabra);
    return longitud >= reglas.min && longitud <= reglas.max;
  });
}

// ── Preparación de la base de datos ─────────────────────────

// Crea la tabla si no existe y agrega columnas nuevas si faltan.
// Este enfoque permite actualizar el esquema sin borrar datos existentes.
async function prepararBaseDeDatos() {
  try {
    // Crea la tabla con todas las columnas necesarias si no existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS score (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        nombre     VARCHAR(100) NOT NULL,
        tiempo     TIME         NOT NULL,
        puntos     INT          NOT NULL,
        fecha      DATE         NOT NULL,
        categoria  VARCHAR(40)  NOT NULL DEFAULT 'General',
        dificultad VARCHAR(20)  NOT NULL DEFAULT 'Media',
        resultado  VARCHAR(20)  NOT NULL DEFAULT 'Perdio'
      )
    `);

    // Consulta las columnas que ya existen en la tabla
    const [columnas] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'score'
    `);

    const existentes = new Set(columnas.map((columna) => columna.COLUMN_NAME));

    // Lista de columnas que pueden faltar en tablas creadas antes de esta versión
    const faltantes = [
      ['categoria',  "ALTER TABLE score ADD COLUMN categoria  VARCHAR(40) NOT NULL DEFAULT 'General'"],
      ['dificultad', "ALTER TABLE score ADD COLUMN dificultad VARCHAR(20) NOT NULL DEFAULT 'Media'"],
      ['resultado',  "ALTER TABLE score ADD COLUMN resultado  VARCHAR(20) NOT NULL DEFAULT 'Perdio'"]
    ];

    // Agrega solo las columnas que no existen (migración no destructiva)
    for (const [nombre, sql] of faltantes) {
      if (!existentes.has(nombre)) await db.query(sql);
    }
  } catch (error) {
    // Si MySQL no está disponible al iniciar, el servidor igual arranca
    // pero las rutas de score darán error 500 hasta que MySQL esté activo.
    console.warn('MySQL no esta disponible o no se pudo preparar la tabla:', error.message);
  }
}

// ── Rutas de la API ──────────────────────────────────────────

// GET /api/palabra?categoria=Tecnologia&dificultad=Media
// Devuelve una palabra aleatoria que cumple los filtros, junto con las reglas de la partida.
app.get('/api/palabra', async (req, res) => {
  try {
    const { categoria, dificultad } = obtenerFiltros(req);
    let candidatas = await obtenerPalabrasPorFiltro(categoria, dificultad);

    // Si la categoría específica no tiene palabras para esa dificultad,
    // intenta con la categoría "general" como fallback
    if (!candidatas.length && categoria !== 'general') {
      candidatas = await obtenerPalabrasPorFiltro('general', dificultad);
    }

    // Si tampoco "general" tiene candidatas, responde con 404
    if (!candidatas.length) {
      return res.status(404).json({ error: 'No hay palabras para esa combinacion.' });
    }

    // Selecciona una palabra aleatoria del array de candidatas
    const palabra = candidatas[Math.floor(Math.random() * candidatas.length)];
    const reglas  = DIFICULTADES[dificultad];

    // Devuelve la palabra y las reglas de la partida al frontend
    res.json({
      palabra:    palabra.toLowerCase(), // Siempre en minúsculas para comparaciones
      categoria,
      dificultad,
      intentos:   reglas.intentos,       // 6 siempre
      pistas:     reglas.pistas          // 0, 1 o 3 según dificultad
    });
  } catch (error) {
    console.error('Error al obtener palabra:', error.message);
    res.status(500).json({ error: 'No se pudo obtener una palabra local.' });
  }
});

// GET /api/score
// Devuelve todos los puntajes guardados ordenados por puntos DESC, tiempo ASC.
app.get('/api/score', async (req, res) => {
  try {
    const [filas] = await db.query(`
      SELECT id, nombre, tiempo, puntos, fecha, categoria, dificultad, resultado
      FROM score
      ORDER BY puntos DESC, tiempo ASC, fecha DESC
    `);
    // puntos DESC: más puntos primero (mejor rendimiento)
    // tiempo ASC: a igual puntos, menos tiempo es mejor
    // fecha DESC: a igual todo, el más reciente primero
    res.json(filas);
  } catch (error) {
    console.error('Error al obtener scores:', error.message);
    res.status(500).json({ error: 'Error al consultar la tabla de posiciones' });
  }
});

// POST /api/score
// Guarda un nuevo puntaje en la base de datos MySQL.
// Body esperado: { nombre, puntos, tiempo, fecha, categoria, dificultad, resultado }
app.post('/api/score', async (req, res) => {
  try {
    const { nombre, puntos, tiempo, fecha, categoria, dificultad, resultado } = req.body;

    // Valida los campos obligatorios antes de insertar
    if (!nombre || puntos === undefined || !tiempo || !fecha) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Usa query parametrizada (?) para evitar SQL Injection
    await db.query(
      `INSERT INTO score
        (nombre, tiempo, puntos, fecha, categoria, dificultad, resultado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre.trim(),         // Elimina espacios al inicio y final del nombre
        tiempo,                // "HH:MM:SS"
        Number(puntos),        // Asegura que sea número entero
        fecha,                 // "YYYY-MM-DD"
        categoria  || 'General',
        dificultad || 'Media',
        resultado  || 'Perdio'
      ]
    );

    res.json({ message: 'Puntaje guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar score:', error.message);
    res.status(500).json({ error: 'Error al guardar el puntaje en la base de datos' });
  }
});

// ── Inicio del servidor ──────────────────────────────────────

// Intenta iniciar en el puerto configurado.
// Si ese puerto está ocupado (EADDRINUSE), prueba automáticamente con el 3010.
function iniciarServidor(puerto) {
  const server = app.listen(puerto, () => {
    console.log(`Juego del Ahorcado -> http://localhost:${puerto}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && Number(puerto) !== 3010) {
      // El puerto está en uso (ej: otro proceso lo tiene ocupado)
      console.warn(`Puerto ${puerto} ocupado. Probando http://localhost:3010`);
      iniciarServidor(3010); // Reintenta con el puerto alternativo
      return;
    }
    // Cualquier otro error de servidor es fatal
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1); // Termina el proceso con código de error
  });
}

// Prepara la base de datos y luego inicia el servidor.
// .finally() garantiza que el servidor arranque incluso si MySQL falla.
prepararBaseDeDatos().finally(() => iniciarServidor(PORT));
