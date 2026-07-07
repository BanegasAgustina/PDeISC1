// ============================================================
// palabra.js - Renderizado de la palabra en pantalla
// ============================================================
// Dibuja los guiones y letras reveladas sin tocar otra lógica.

// Renderiza la palabra en el contenedor #palabra-oculta.
// letrasAdivinadas: Set o array de letras normalizadas ya adivinadas.
// La función recibe la palabra como array de caracteres.
function dibujarPalabra(letrasArr, letrasAdivinadas) {
  const divPalabra = document.getElementById('palabra-oculta');
  if (!divPalabra) return;

  divPalabra.innerHTML = '';

  letrasArr.forEach((letra) => {
    const span = document.createElement('span');
    span.className = 'letter';

    // Los caracteres no-letra (espacios, guiones) se muestran siempre
    if (!/[a-zA-Z\u00c0-\u017f\u00f1\u00d1]/.test(letra)) {
      span.textContent = letra;
      span.classList.add('letter--revealed');
    } else if (letrasAdivinadas.has(normalizarTexto(letra))) {
      // La letra ya fue adivinada: mostrarla en mayúscula con animación
      span.textContent = letra.toUpperCase();
      span.classList.add('letter--revealed');
    }
    // Si no: el span queda vacío (guión visual provisto por CSS)

    divPalabra.appendChild(span);
  });
}
