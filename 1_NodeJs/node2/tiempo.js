// PUNTO 1 — Módulo propio: clima

export function climaAleatorio() {
  const climas = ['Soleado', 'Nublado', 'Lluvioso', 'Tormenta', 'Parcialmente nublado'];
  const index = new Date().getDate() % climas.length;
  return climas[index];
}

export function temperatura() {
  const base = 18;
  const variacion = new Date().getHours() % 10;
  return base + variacion;
}
