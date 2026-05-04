import { createServer } from 'node:http';
import { clima} from './modulos/tiempo.js';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`El clima de hoy es: ${clima()}`);
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3000');
});