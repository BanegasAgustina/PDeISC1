// ============================================================
// teclado.js - Teclado virtual en pantalla
// ============================================================
// Crea y actualiza los botones del teclado en #teclado.
// No tiene lógica de juego: solo renderiza y delega los clicks al callback.

// Las 27 letras del alfabeto español, con la ñ en su posición correcta.
const ALFABETO = 'abcdefghijklmnñopqrstuvwxyz';

// Dibuja (o redibuja) el teclado virtual en el elemento #teclado.
// Se llama al inicio de cada partida y después de cada letra ingresada
// para actualizar los colores de los botones.
//
// Parámetros:
//   letrasUsadas  → Set con las letras ya utilizadas (normalizadas). Ej: Set{'a','e','s'}
//   palabraLetras → Set con las letras que contiene la palabra. Se usa para colorear verde/rojo.
//   onLetraClick  → Callback que se llama con la letra cuando el usuario presiona un botón.
function renderizarTeclado(letrasUsadas, palabraLetras, onLetraClick) {
  const divTeclado = document.getElementById('teclado');
  if (!divTeclado) return; // Sale si el contenedor no existe en el DOM

  divTeclado.innerHTML = ''; // Limpia el teclado anterior (redibuja desde cero)

  for (const letra of ALFABETO) {
    const btn = document.createElement('button');
    btn.className = 'key';         // Clase CSS base para todos los botones
    btn.type = 'button';           // Evita que el button haga submit de un form accidentalmente
    btn.textContent = letra.toUpperCase(); // Muestra la letra en mayúscula

    const usada = letrasUsadas.has(letra); // ¿Ya se usó esta letra?
    btn.disabled = usada;                  // Si ya se usó, deshabilita el botón

    if (usada) {
      // Verde si la letra ESTÁ en la palabra; rojo si NO está (error)
      btn.classList.add(palabraLetras.has(letra) ? 'key--correct' : 'key--wrong');
    }

    // Al hacer click, llama al callback con la letra presionada
    btn.addEventListener('click', () => onLetraClick(letra));
    divTeclado.appendChild(btn); // Agrega el botón al contenedor del teclado
  }
}

// Anima brevemente un botón que el jugador intentó usar pero ya estaba deshabilitado.
// Busca el botón cuyo texto coincide con la letra y le aplica la clase key--used,
// que ejecuta la animación de "sacudida" definida en style.css.
function animarLetraUsada(letra) {
  const normalizada = normalizarTexto(letra); // Normaliza para comparar sin tildes ni mayúsculas
  const btn = [...document.querySelectorAll('.key')]
    .find((el) => normalizarTexto(el.textContent) === normalizada); // Busca el botón correcto
  if (!btn) return;

  btn.classList.remove('key--used'); // Remueve primero para reiniciar la animación
  void btn.offsetWidth;              // Fuerza un reflow del navegador (truco para reiniciar CSS animation)
  btn.classList.add('key--used');    // Agrega la clase que dispara la animación de sacudida
}
