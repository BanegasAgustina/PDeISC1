import { createServer } from 'node:http';
import { sumar, restar, multiplicar, division } from './calculos.js';
const server = createServer((req, res) => {

  const suma = sumar(5, 3);
  const resta = restar(8, 6);
  const multiplicacion = multiplicar(3, 11);
  const ResultadoDivision = division(30,5);

  res.writeHead(200, { 'Content-Type': 'text/plain' });

  res.end(
`La suma de 5 + 3= ${suma}
La resta de 8 - 6 = ${resta}
La multiplicacion de 3 * 11 = ${multiplicacion}
La division de 30/5 = ${ResultadoDivision}`);
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3000');
});