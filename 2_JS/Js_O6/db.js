// ============================================================
// db.js — Conexión a MySQL (XAMPP)
// ============================================================
// Configura la conexión con la base de datos "Score".
// Usamos mysql2/promise para poder usar async/await en server.js.

const mysql = require('mysql2/promise');

// Pool de conexiones: reutiliza conexiones y es más eficiente
const pool = mysql.createPool({
  host: 'localhost',      // Servidor MySQL de XAMPP
  user: 'root',           // Usuario por defecto de XAMPP
  password: '',           // Sin contraseña por defecto en XAMPP
  database: 'Score',      // Base de datos del juego
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
