function sumar(a, b) { return a + b; }
function restar(a, b) { return a - b; }
function multiplicar(a, b) { return a * b; }

export function getResultado() {
  return {
    titulo: 'Ejercicio 3',
    operaciones: [
      { operacion: '4 + 5', resultado: sumar(4, 5) },
      { operacion: '3 - 6', resultado: restar(3, 6) },
      { operacion: '2 × 7', resultado: multiplicar(2, 7) }
    ]
  };
}
