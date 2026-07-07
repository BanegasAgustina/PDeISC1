// ============================================================
// server.js - Servidor Express del Juego del Ahorcado
// ============================================================
// Sirve el frontend, expone una API propia de palabras en español
// latinoamericano y guarda/consulta puntajes en MySQL.

const fs = require('fs/promises');
const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

const CATEGORIAS = [
  'tecnologia',
  'animales',
  'deportes',
  'comida',
  'paises',
  'profesiones',
  'objetos',
  'naturaleza',
  'musica',
  'peliculas',
  'programacion',
  'general'
];

const DIFICULTADES = {
  facil:   { min: 4, max: 6,        intentos: 6, pistas: 3 },
  media:   { min: 6, max: 9,        intentos: 6, pistas: 1 },
  dificil: { min: 10, max: Infinity, intentos: 6, pistas: 0 }
};

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Normaliza texto para comparar parametros sin depender de mayusculas o acentos.
// La ñ se preserva para que no colisione con n.
function normalizarTexto(texto = '') {
  return String(texto)
    .trim()
    .toLowerCase()
    .replace(/ñ/g, '\x00ñ\x00')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\x00ñ\x00/g, 'ñ')
    .replace(/\s+/g, '_');
}

// Cuenta letras reales, ignorando espacios y guiones (incluye ñ y tildes).
function contarLetras(palabra) {
  return palabra.replace(/[^a-zA-Z\u00c0-\u017f\u00f1\u00d1]/g, '').length;
}

// Devuelve la configuracion validada de categoria y dificultad solicitada.
function obtenerFiltros(req) {
  const categoria = normalizarTexto(req.query.categoria || 'general');
  const dificultad = normalizarTexto(req.query.dificultad || 'media');

  return {
    categoria: CATEGORIAS.includes(categoria) ? categoria : 'general',
    dificultad: DIFICULTADES[dificultad] ? dificultad : 'media'
  };
}

// Lee el archivo JSON de una categoria y filtra palabras por dificultad.
async function obtenerPalabrasPorFiltro(categoria, dificultad) {
  const archivo = path.join(DATA_DIR, `${categoria}.json`);
  const contenido = await fs.readFile(archivo, 'utf8');
  const palabras = JSON.parse(contenido);
  const reglas = DIFICULTADES[dificultad];

  return palabras.filter((palabra) => {
    const longitud = contarLetras(palabra);
    return longitud >= reglas.min && longitud <= reglas.max;
  });
}

// Intenta mantener la tabla compatible con los campos nuevos sin borrar datos.
async function prepararBaseDeDatos() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS score (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        tiempo TIME NOT NULL,
        puntos INT NOT NULL,
        fecha DATE NOT NULL,
        categoria VARCHAR(40) NOT NULL DEFAULT 'General',
        dificultad VARCHAR(20) NOT NULL DEFAULT 'Media',
        resultado VARCHAR(20) NOT NULL DEFAULT 'Perdio'
      )
    `);

    const [columnas] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'score'
    `);

    const existentes = new Set(columnas.map((columna) => columna.COLUMN_NAME));
    const faltantes = [
      ['categoria', "ALTER TABLE score ADD COLUMN categoria VARCHAR(40) NOT NULL DEFAULT 'General'"],
      ['dificultad', "ALTER TABLE score ADD COLUMN dificultad VARCHAR(20) NOT NULL DEFAULT 'Media'"],
      ['resultado', "ALTER TABLE score ADD COLUMN resultado VARCHAR(20) NOT NULL DEFAULT 'Perdio'"]
    ];

    for (const [nombre, sql] of faltantes) {
      if (!existentes.has(nombre)) await db.query(sql);
    }
  } catch (error) {
    console.warn('MySQL no esta disponible o no se pudo preparar la tabla:', error.message);
  }
}

// ============================================================
// GET /api/palabra?categoria=Tecnologia&dificultad=Media
// ============================================================
app.get('/api/palabra', async (req, res) => {
  try {
    const { categoria, dificultad } = obtenerFiltros(req);
    let candidatas = await obtenerPalabrasPorFiltro(categoria, dificultad);

    if (!candidatas.length && categoria !== 'general') {
      candidatas = await obtenerPalabrasPorFiltro('general', dificultad);
    }

    if (!candidatas.length) {
      return res.status(404).json({ error: 'No hay palabras para esa combinacion.' });
    }

    const palabra = candidatas[Math.floor(Math.random() * candidatas.length)];
    const reglas = DIFICULTADES[dificultad];

    res.json({
      palabra: palabra.toLowerCase(),
      categoria,
      dificultad,
      intentos: reglas.intentos,
      pistas: reglas.pistas
    });
  } catch (error) {
    console.error('Error al obtener palabra:', error.message);
    res.status(500).json({ error: 'No se pudo obtener una palabra local.' });
  }
});

// ============================================================
// GET /api/score - Devuelve todos los puntajes guardados
// ============================================================
app.get('/api/score', async (req, res) => {
  try {
    const [filas] = await db.query(`
      SELECT id, nombre, tiempo, puntos, fecha, categoria, dificultad, resultado
      FROM score
      ORDER BY puntos DESC, tiempo ASC, fecha DESC
    `);

    res.json(filas);
  } catch (error) {
    console.error('Error al obtener scores:', error.message);
    res.status(500).json({ error: 'Error al consultar la tabla de posiciones' });
  }
});

// ============================================================
// POST /api/score - Guarda un nuevo puntaje en MySQL
// ============================================================
app.post('/api/score', async (req, res) => {
  try {
    const { nombre, puntos, tiempo, fecha, categoria, dificultad, resultado } = req.body;

    if (!nombre || puntos === undefined || !tiempo || !fecha) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    await db.query(
      `INSERT INTO score
        (nombre, tiempo, puntos, fecha, categoria, dificultad, resultado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre.trim(),
        tiempo,
        Number(puntos),
        fecha,
        categoria || 'General',
        dificultad || 'Media',
        resultado || 'Perdio'
      ]
    );

    res.json({ message: 'Puntaje guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar score:', error.message);
    res.status(500).json({ error: 'Error al guardar el puntaje en la base de datos' });
  }
});

// Inicia el servidor y usa un puerto alternativo si el 3000 esta ocupado.
function iniciarServidor(puerto) {
  const server = app.listen(puerto, () => {
    console.log(`Juego del Ahorcado -> http://localhost:${puerto}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && Number(puerto) !== 3010) {
      console.warn(`Puerto ${puerto} ocupado. Probando http://localhost:3010`);
      iniciarServidor(3010);
      return;
    }

    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  });
}

prepararBaseDeDatos().finally(() => iniciarServidor(PORT));
