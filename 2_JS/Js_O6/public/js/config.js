// ============================================================
// config.js - Constantes globales del juego
// ============================================================
// Centraliza todos los valores fijos para evitar magic numbers
// dispersos por el código y facilitar cambios futuros.

// Partes del cuerpo del ahorcado en orden estricto de aparición.
// Error 1→cabeza, 2→tronco, 3→brazoi, 4→brazod, 5→piernai, 6→piernad.
// La horca (base, poste, viga, soga) siempre está visible en el SVG.
const PARTES_AHORCADO = ['cabeza', 'tronco', 'brazoi', 'brazod', 'piernai', 'piernad'];

// Configuración de dificultad visible en la UI.
// intentos: SIEMPRE 6 para que cada error dibuje exactamente 1 parte del muñeco.
// La dificultad real la determina la longitud de la palabra (filtro del servidor)
// y la cantidad de pistas disponibles.
const DIFICULTADES_UI = {
  facil:   { label: 'Facil',   intentos: 6, pistas: 3, descripcion: '4 a 6 letras — 3 pistas disponibles.'  },
  media:   { label: 'Media',   intentos: 6, pistas: 1, descripcion: '6 a 9 letras — 1 pista disponible.'    },
  dificil: { label: 'Dificil', intentos: 6, pistas: 0, descripcion: 'Mas de 9 letras — sin pistas.'         }
};

// Filas visibles por página en la tabla de posiciones.
const FILAS_POR_PAGINA = 20;
