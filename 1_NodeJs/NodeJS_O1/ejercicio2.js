import { createServer } from 'node:http';

const server = createServer((req, res) => {

    const suma = 4 + 5;
    const resta = 3 - 6;
    const multiplicacion = 2 * 7;
    const division=20/4;

    res.writeHead(200, { 'Content-Type': 'text/plain' });

    res.end(
`La suma de 4 + 5 = ${suma}
La resta de 3 - 6 = ${resta}
La multiplicacion de 2 * 7 = ${multiplicacion}
La division de 20/4 = ${division}`
    );
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3000');
});