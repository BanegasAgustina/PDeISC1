// PUNTO 1 — Módulo propio: operaciones matemáticas

export function sumar(a, b) {
  return a + b;
}

export function restar(a, b) {
  return a - b;
}

export function multiplicar(a, b) {
  return a * b;
}

export function division(a, b) {
  if (b === 0) return 'Error: no se puede dividir por cero';
  return a / b;
}
