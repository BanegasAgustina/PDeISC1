// ============================================================
// teclado.js - Teclado virtual en pantalla
// ============================================================
// Crea y actualiza los botones del teclado. No contiene lógica de juego.

// Alfabeto español completo (incluye ñ en su posición correcta)
const ALFABETO = 'abcdefghijklmnñopqrstuvwxyz';

// Dibuja el teclado virtual en #teclado.
// letrasUsadas: Set de letras ya utilizadas (normalizadas).
// palabraLetras: Set de letras que contiene la palabra (normalizadas).
// onLetraClick: callback(letra) que se invoca cuando el usuario presiona una tecla.
function renderizarTeclado(letrasUsadas, palabraLetras, onLetraClick) {
  const divTeclado = document.getElementById('teclado');
  if (!divTeclado) return;

  divTeclado.innerHTML = '';

  for (const letra of ALFABETO) {
    const btn = document.createElement('button');
    btn.className = 'key';
    btn.type = 'button';
    btn.textContent = letra.toUpperCase();

    const usada = letrasUsadas.has(letra);
    btn.disabled = usada;

    if (usada) {
      // Verde si acertó, rojo si falló
      btn.classList.add(palabraLetras.has(letra) ? 'key--correct' : 'key--wrong');
    }

    btn.addEventListener('click', () => onLetraClick(letra));
    divTeclado.appendChild(btn);
  }
}

function animarLetraUsada(letra) {
  const normalizada = normalizarTexto(letra);
  const btn = [...document.querySelectorAll('.key')]
    .find((el) => normalizarTexto(el.textContent) === normalizada);
  if (!btn) return;
  btn.classList.remove('key--used');
  void btn.offsetWidth;
  btn.classList.add('key--used');
}
