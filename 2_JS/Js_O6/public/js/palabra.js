// ============================================================
// palabra.js - Renderizado de la palabra en pantalla
// ============================================================
// Dibuja los guiones y letras reveladas en el contenedor #palabra-oculta.
// No toca el estado del juego ni hace ningún fetch.

// Renderiza la palabra letra por letra en el contenedor #palabra-oculta.
// Parámetros:
//   letrasArr        → Array de caracteres de la palabra (ej: ['p','e','r','r','o'])
//   letrasAdivinadas → Set con las letras normalizadas ya adivinadas (ej: Set{'p','e'})
function dibujarPalabra(letrasArr, letrasAdivinadas) {
  const divPalabra = document.getElementById('palabra-oculta');
  if (!divPalabra) return; // Si el contenedor no existe, no hace nada

  divPalabra.innerHTML = ''; // Borra el contenido anterior para redibujar desde cero

  letrasArr.forEach((letra) => {
    const span = document.createElement('span'); // Crea un <span> por cada carácter
    span.className = 'letter';                   // Clase CSS que da el estilo de guión

    if (!/[a-zA-Z\u00c0-\u017f\u00f1\u00d1]/.test(letra)) {
      // ── Carácter no alfabético (espacio, guión, etc.) ──
      // Se muestra siempre visible, ya que no es una letra a adivinar.
      span.textContent = letra;
      span.classList.add('letter--revealed'); // Clase que anima la aparición

    } else if (letrasAdivinadas.has(normalizarTexto(letra))) {
      // ── Letra que ya fue adivinada ──
      // Se muestra en MAYÚSCULA con la animación de "escribir".
      // normalizarTexto compara sin importar tildes (ej: 'é' == 'e').
      span.textContent = letra.toUpperCase();
      span.classList.add('letter--revealed');

    }
    // Si no cae en ningún caso: el span queda vacío y el CSS muestra el guión visual (::after).

    divPalabra.appendChild(span); // Agrega el span al contenedor
  });
}
