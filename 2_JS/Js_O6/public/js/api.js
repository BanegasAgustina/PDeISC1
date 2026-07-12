// ============================================================
// api.js - Comunicación con el servidor Express
// ============================================================
// Todas las llamadas fetch están acá, separadas de la lógica del juego.
// Cada función es async y lanza un Error si la respuesta HTTP no es 2xx,
// así el código que la llama puede usar try/catch para manejar el error.

// Solicita una palabra al servidor según categoría y dificultad.
// El servidor lee el JSON de /data y filtra por longitud según la dificultad.
// Retorna un objeto: { palabra, categoria, dificultad, intentos, pistas }
async function apiObtenerPalabra(categoria, dificultad) {
  // encodeURIComponent codifica caracteres especiales para la URL (ej: espacios → %20)
  const url = `/api/palabra?categoria=${encodeURIComponent(categoria)}&dificultad=${encodeURIComponent(dificultad)}`;
  const res = await fetch(url);           // Hace el GET al servidor
  const datos = await res.json();         // Parsea la respuesta JSON
  if (!res.ok) throw new Error(datos.error || 'Error al obtener palabra'); // Si HTTP 4xx/5xx, lanza error
  return datos;
}

// Consulta todos los puntajes guardados en la base de datos MySQL.
// El servidor los devuelve ya ordenados por puntos DESC, tiempo ASC.
// Retorna: array de objetos con { id, nombre, tiempo, puntos, fecha, categoria, dificultad, resultado }
async function apiObtenerScores() {
  const res = await fetch('/api/score');   // GET a la ruta del ranking
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error || 'Error al consultar scores');
  return datos;
}

// Guarda un nuevo puntaje en MySQL enviando los datos al servidor por POST.
// El parámetro body debe tener: { nombre, puntos, tiempo, fecha, categoria, dificultad, resultado }
// Retorna el mensaje de confirmación del servidor.
async function apiGuardarScore(body) {
  const res = await fetch('/api/score', {
    method: 'POST',                                         // Método POST para crear un nuevo registro
    headers: { 'Content-Type': 'application/json' },       // Le decimos al servidor que enviamos JSON
    body: JSON.stringify(body)                              // Convierte el objeto JS a string JSON
  });
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error || 'Error al guardar score');
  return datos;
}
