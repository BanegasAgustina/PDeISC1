/**
 * ============================================================
 * jsonStore.js — Respaldo en archivo JSON
 * ============================================================
 * Guarda una copia de los alumnos en data/alumnos.json cada vez
 * que se listan o se crea un registro. MySQL sigue siendo la fuente
 * principal; el JSON es un respaldo legible en disco.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Ruta absoluta al archivo de respaldo: Js_O5/data/alumnos.json */
export const ALUMNOS_FILE = path.join(__dirname, "..", "..", "data", "alumnos.json");

/**
 * Sobrescribe data/alumnos.json con el array de alumnos recibido.
 *
 * @param {Array<{id: number, nombre: string, apellido: string, edad: number}>} alumnos
 */
export async function writeAlumnosToJson(alumnos) {
  // JSON.stringify con indentación (null, 2) para que el archivo sea legible
  await fs.writeFile(ALUMNOS_FILE, JSON.stringify(alumnos, null, 2), "utf-8");
}
