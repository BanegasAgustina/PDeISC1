// PUNTO 5 — Módulo propio: menú de navegación
// Se importa en app.js para generar el HTML del menú en todas las páginas

export function menuHTML(paginaActiva = '') {
  const links = [
    { href: '/',             label: 'Inicio'       },
    { href: '/calculadora',  label: 'Calculadora'  },
    { href: '/reloj',        label: 'Reloj'        },
    { href: '/clima',        label: 'Clima'        },
    { href: '/url-info',     label: 'Info URL'     },
    { href: '/upper-case',   label: 'Upper Case'   },
  ];

  const items = links.map(({ href, label }) => {
    const activo = href === paginaActiva ? ' class="activo"' : '';
    return `<li><a href="${href}"${activo}>${label}</a></li>`;
  }).join('\n        ');

  return `<nav>
      <ul>
        ${items}
      </ul>
    </nav>`;
}

// Genera el HTML completo de una página envolviendo el contenido con layout base
export function paginaHTML(titulo, contenido, paginaActiva = '') {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo} — Node.js Demo</title>
  <link rel="stylesheet" href="/estilos.css">
</head>
<body>
  <header>
    <h1>Node.js Demo</h1>
    ${menuHTML(paginaActiva)}
  </header>
  <main>
    <h2>${titulo}</h2>
    ${contenido}
  </main>
  <footer>
    <p>Proyecto Node.js — Módulos HTTP · FS · URL · NPM</p>
  </footer>
</body>
</html>`;
}
