export function getResultado() {
  const suma = 4 + 5;
  const resta = 3 - 6;
  const multiplicacion = 2 * 7;
  const division = 20 / 4;

  return {
    titulo: 'Ejercicio 2 ',
    operaciones: [
      { operacion: '4 + 5', resultado: suma },
      { operacion: '3 - 6', resultado: resta },
      { operacion: '2 × 7', resultado: multiplicacion },
      { operacion: '20 ÷ 4', resultado: division }
    ]
  };
}
