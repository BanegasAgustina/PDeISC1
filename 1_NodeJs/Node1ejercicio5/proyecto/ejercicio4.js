import { sumar, restar, multiplicar, division } from './calculos.js';

export function getResultado() {
  return {
    titulo: 'Ejercicio 4 — Módulo Externo calculos.js',
    operaciones: [
      { operacion: '5 + 3', resultado: sumar(5, 3) },
      { operacion: '8 - 6', resultado: restar(8, 6) },
      { operacion: '3 × 11', resultado: multiplicar(3, 11) },
      { operacion: '30 ÷ 5', resultado: division(30, 5) }
    ]
  };
}
