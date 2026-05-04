import { createServer } from 'node:http';
import { getResultado as getEj1 } from './proyecto/ejercicio1.js';
import { getResultado as getEj2 } from './proyecto/ejercicio2.js';
import { getResultado as getEj3 } from './proyecto/ejercicio3.js';
import { getResultado as getEj4 } from './proyecto/ejercicio4.js';
import { sumar, restar, multiplicar, division } from './proyecto/calculos.js';

const server = createServer((req, res) => {

  // Resultados propios del ejercicio 5
  const ej5 = {
    titulo: 'Ejercicio 5',
    operaciones: [
      { operacion: '5 + 3', resultado: sumar(5, 3) },
      { operacion: '8 - 6', resultado: restar(8, 6) },
      { operacion: '3 × 11', resultado: multiplicar(2, 7) },
      { operacion: '30 ÷ 5', resultado: division(30, 5) }
    ]
  };

  // Todos los ejercicios juntos
  const ejercicios = [getEj1(), getEj2(), getEj3(), getEj4(), ej5];

  // Genera las secciones de la tabla por cada ejercicio
  const filasHTML = ejercicios.map(ej => `
    <tr class="table-secondary">
      <td colspan="2" class="fw-bold text-start">${ej.titulo}</td>
    </tr>
    ${ej.operaciones.map(op => `
    <tr>
      <td>${op.operacion}</td>
      <td>${op.resultado}</td>
    </tr>`).join('')}
  `).join('');

  res.writeHead(200, { 'Content-Type': 'text/html' });

  res.end(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Calculadora</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body class="bg-light">
      <div class="container py-5">
        <h1 class="text-center mb-4">Resultados de Todos los Ejercicios</h1>

        <div class="table-responsive">
          <table class="table table-bordered table-hover text-center shadow">

            <thead class="table-danger">
              <tr>
                <th>Operación</th>
                <th>Resultado</th>
              </tr>
            </thead>

            <tbody>
              ${filasHTML}
            </tbody>

          </table>
        </div>
      </div>
    </body>
    </html>
  `);
});

server.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});
