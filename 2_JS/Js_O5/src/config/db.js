/**
 * ============================================================
 * db.js — Configuración de conexión a MySQL
 * ============================================================
 * Crea un "pool" de conexiones reutilizables hacia alumnosDB.
 * Un pool es más eficiente que abrir/cerrar una conexión en cada
 * petición porque reutiliza conexiones ya abiertas.
 *
 * Requisito: ejecutar antes  npm run init-db  para crear la base.
 */

import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",     // Servidor MySQL (local en desarrollo)
  user: "root",          // Usuario por defecto en XAMPP/WAMP
  password: "",          // Contraseña vacía (ajustar si la tenés configurada)
  database: "alumnosDB", // Base creada por database/init.sql
});

export default pool;
