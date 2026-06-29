/**
 * ============================================================
 * alumnos.js — Rutas de la API (solo POST)
 * ============================================================
 * Un único endpoint maneja dos acciones según el cuerpo JSON:
 *
 *   { "accion": "listar" }
 *     → Devuelve todos los alumnos y sincroniza data/alumnos.json
 *
 *   { "nombre": "...", "apellido": "...", "edad": 20 }
 *     → Crea un alumno nuevo, valida duplicados y sincroniza el JSON
 */

import { Router } from "express";
import pool from "../config/db.js";
import { writeAlumnosToJson } from "../utils/jsonStore.js";

// Router de Express para agrupar las rutas de este módulo
const router = Router();

/**
 * Lee todos los alumnos de MySQL y guarda una copia en data/alumnos.json.
 * Se ejecuta después de listar o insertar para mantener el respaldo actualizado.
 *
 * @returns {Array} Lista de alumnos ordenados por id
 */
async function syncJsonFromDb() {
  const [rows] = await pool.query(
    "SELECT id, nombre, apellido, edad FROM alumnos ORDER BY id",
  );
  await writeAlumnosToJson(rows);
  return rows;
}

/**
 * POST /api/alumnos
 * Punto único de la API: listar o crear alumnos según req.body
 */
router.post("/", async (req, res) => {
  try {
    const { accion, nombre, apellido, edad } = req.body;

    // --- Acción: listar todos los alumnos ---
    if (accion === "listar") {
      const alumnos = await syncJsonFromDb();
      res.json(alumnos);
      return;
    }

    // --- Acción: crear un alumno nuevo ---

    // Validación básica: los tres campos son obligatorios
    if (!nombre?.trim() || !apellido?.trim() || edad === undefined || edad === "") {
      res.status(400).json({ error: "Nombre, apellido y edad son obligatorios." });
      return;
    }

    // Evita duplicados: mismo nombre + apellido (sin importar mayúsculas/minúsculas)
    const [existentes] = await pool.query(
      `SELECT id FROM alumnos
       WHERE LOWER(TRIM(nombre)) = LOWER(?)
         AND LOWER(TRIM(apellido)) = LOWER(?)`,
      [nombre.trim(), apellido.trim()],
    );

    if (existentes.length > 0) {
      res.status(409).json({ error: "Ya existe un alumno con ese nombre y apellido." });
      return;
    }

    // Inserta el registro en MySQL; los ? evitan inyección SQL
    const [result] = await pool.query(
      "INSERT INTO alumnos (nombre, apellido, edad) VALUES (?, ?, ?)",
      [nombre.trim(), apellido.trim(), edad],
    );

    // Actualiza el archivo JSON con la lista completa actualizada
    await syncJsonFromDb();

    // Responde con el alumno recién creado (201 = Created)
    res.status(201).json({
      id: result.insertId,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      edad: Number(edad),
    });
  } catch (error) {
    // Error inesperado (MySQL caído, disco lleno, etc.)
    res.status(500).json({ error: "Error en la API.", detail: error.message });
  }
});

export default router;
