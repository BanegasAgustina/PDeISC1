// ============================================================
// db.js — Conexión a MySQL (XAMPP)
// ============================================================
// Configura el pool de conexiones con la base de datos "Score".
// Usamos mysql2/promise para poder usar async/await en server.js.

// Importamos el módulo mysql2 con soporte de Promesas (async/await)
const mysql = require('mysql2/promise');

// Pool de conexiones: en lugar de abrir y cerrar una conexión cada vez,
// el pool mantiene varias conexiones abiertas y las reutiliza.
// Esto es más eficiente y evita errores por demasiadas conexiones simultáneas.
const pool = mysql.createPool({
  host: 'localhost',      // Servidor MySQL (XAMPP corre en la misma máquina)
  user: 'root',           // Usuario por defecto de XAMPP (sin contraseña)
  password: '',           // Sin contraseña por defecto en XAMPP
  database: 'Score',      // Base de datos del juego (debe existir en MySQL)
  waitForConnections: true, // Si todas las conexiones están ocupadas, espera en lugar de lanzar error
  connectionLimit: 10       // Máximo de conexiones simultáneas en el pool
});

// Exportamos el pool para que server.js pueda llamar pool.query(...)
module.exports = pool;
