// PUNTO 1 — Módulo propio: hora actual

export function hora() {
  return new Date().toLocaleTimeString('es-AR');
}

export function fecha() {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
