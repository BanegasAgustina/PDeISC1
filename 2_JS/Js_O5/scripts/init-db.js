/**
 * ============================================================
 * init-db.js — Script para crear la base de datos
 * ============================================================
 * Lee database/init.sql y lo ejecuta en MySQL local.
 *
 * Uso:  npm run init-db
 *
 * Requisitos:
 *   - MySQL corriendo (XAMPP, WAMP, servicio local, etc.)
 *   - Usuario root sin contraseña (o ajustar las credenciales abajo)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Lee el script SQL con CREATE DATABASE, CREATE TABLE e INSERTs de ejemplo
const sql = await fs.readFile(path.join(__dirname, "..", "database", "init.sql"), "utf-8");

// Conexión sin base seleccionada: init.sql hace CREATE DATABASE y USE alumnosDB
const connection = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  multipleStatements: true, // permite ejecutar varias sentencias SQL en un solo query
});

await connection.query(sql);
await connection.end();

console.log("Base de datos alumnosDB lista.");
