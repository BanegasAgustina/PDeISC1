// Script temporal para verificar que los módulos no tienen referencias rotas
const fs = require('fs');

const orden = [
  'public/js/config.js',
  'public/js/utils.js',
  'public/js/api.js',
  'public/js/cronometro.js',
  'public/js/puntaje.js',
  'public/js/ahorcado.js',
  'public/js/palabra.js',
  'public/js/teclado.js',
  'public/js/estadoJuego.js',
  'public/js/ui.js',
  'public/js/ranking.js',
  'public/js/pdf.js',
  'public/js/tema.js',
  'public/js/main.js'
];

// Mock del entorno browser
const mockBrowser = `
const document = {
  getElementById: (id) => ({
    id, textContent: '', innerHTML: '', value: 'media', disabled: false,
    classList: { add(){}, remove(){}, contains(){return false;}, toggle(){} },
    addEventListener(){}, setAttribute(){}, getAttribute(){ return 'dark'; },
    focus(){}, closest(){ return null; }
  }),
  querySelectorAll: () => [],
  addEventListener: () => {},
  documentElement: {
    setAttribute(){}, getAttribute(){ return 'dark'; }
  },
  createElement: (tag) => ({
    tag, textContent:'', className:'', innerHTML:'',
    classList:{ add(){}, remove(){}, toggle(){}, contains(){return false;} },
    appendChild(){}, addEventListener(){},
    dataset: {}
  })
};
const window = { lucide: { createIcons(){} }, jspdf: null, addEventListener(e,cb){} };
const localStorage = { getItem(){ return null; }, setItem(){} };
const fetch = async () => ({ ok: true, json: async () => ({ palabra:'test', categoria:'general', dificultad:'media', intentos:6, pistas:1 }) });
`;

let codigo = mockBrowser;
orden.forEach(f => {
  try {
    codigo += '\n// === ' + f + ' ===\n';
    codigo += fs.readFileSync(f, 'utf8') + '\n';
  } catch(e) {
    console.error('No se pudo leer', f, e.message);
  }
});

// Remover el listener DOMContentLoaded para que no ejecute
codigo = codigo.replace(/window\.addEventListener\(['"]DOMContentLoaded['"][\s\S]*?\}\s*\)\s*;/g, '/* DOMContentLoaded removido */');

try {
  new Function(codigo)();
  console.log('✔ OK - Todos los módulos se cargan sin errores de referencia');
} catch(e) {
  console.error('✘ ERROR al cargar módulos:', e.message);
  // Mostrar la línea aproximada
  const lineas = codigo.split('\n');
  const match = e.stack.match(/:(\d+):/);
  if (match) {
    const linea = parseInt(match[1]);
    console.error('Cerca de línea', linea, ':', lineas[linea - 1]);
  }
}
