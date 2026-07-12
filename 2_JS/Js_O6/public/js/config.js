// ============================================================
// config.js - Constantes globales del juego
// ============================================================
// Centraliza todos los valores fijos para evitar "magic numbers"
// dispersos por el código y facilitar cambios desde un único lugar.

// Partes del cuerpo del ahorcado en el orden exacto en que aparecen.
// Error 1 → cabeza, 2 → tronco, 3 → brazo izquierdo, 4 → brazo derecho,
// 5 → pierna izquierda, 6 → pierna derecha.
// Los elementos de la horca (base, poste, viga, soga) siempre están visibles en el SVG.
const PARTES_AHORCADO = ['cabeza', 'tronco', 'brazoi', 'brazod', 'piernai', 'piernad'];

// Configuración de cada nivel de dificultad para mostrar en la UI.
// intentos: SIEMPRE 6 para que cada error revele exactamente 1 parte del muñeco.
// La dificultad real la determina la LONGITUD de la palabra (filtro del servidor)
// y la cantidad de pistas disponibles (más pistas = más fácil).
const DIFICULTADES_UI = {
  facil:   { label: 'Facil',   intentos: 6, pistas: 3, descripcion: '4 a 6 letras — 3 pistas disponibles.'  },
  media:   { label: 'Media',   intentos: 6, pistas: 1, descripcion: '6 a 9 letras — 1 pista disponible.'    },
  dificil: { label: 'Dificil', intentos: 6, pistas: 0, descripcion: 'Mas de 9 letras — sin pistas.'         }
};

// Cantidad de filas visibles por página en la tabla de posiciones del ranking.
const FILAS_POR_PAGINA = 20;
