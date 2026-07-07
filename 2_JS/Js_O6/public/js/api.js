// ============================================================
// api.js - Comunicación con el servidor Express
// ============================================================
// Todas las llamadas fetch quedan aquí, separadas de la lógica de juego.
// Cada función es async y lanza un Error si la respuesta no es OK.

// Solicita una palabra al servidor según categoría y dificultad.
// Retorna: { palabra, categoria, dificultad, intentos, pistas }
async function apiObtenerPalabra(categoria, dificultad) {
  const url = `/api/palabra?categoria=${encodeURIComponent(categoria)}&dificultad=${encodeURIComponent(dificultad)}`;
  const res = await fetch(url);
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error || 'Error al obtener palabra');
  return datos;
}

// Consulta todos los puntajes guardados.
// Retorna: array de registros ordenados por el servidor.
async function apiObtenerScores() {
  const res = await fetch('/api/score');
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error || 'Error al consultar scores');
  return datos;
}

// Guarda un nuevo puntaje en la base de datos.
// Parámetro body: { nombre, puntos, tiempo, fecha, categoria, dificultad, resultado }
async function apiGuardarScore(body) {
  const res = await fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error || 'Error al guardar score');
  return datos;
}
