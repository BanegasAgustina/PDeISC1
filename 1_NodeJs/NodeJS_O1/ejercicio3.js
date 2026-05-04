import { createServer } from 'node:http';

function sumar(a, b) {
  return a + b;
}

function restar(a, b) {
  return a - b;
}

function multiplicar(a, b) {
  return a * b;
}

function division(a, b) {
  return a / b;
}

const server = createServer((req, res) => {

  const suma = sumar(4, 5);
  const resta = restar(3, 6);
  const multiplicacion = multiplicar(2, 7);
   const division = division(20, 4);
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  res.end(
`La suma de 4 + 5 = ${suma}
La resta de 3 - 6 = ${resta}
La multiplicacion de 2 * 7 = ${multiplicacion}
La division de 20 / 4=${division}`
  );
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3000');
});