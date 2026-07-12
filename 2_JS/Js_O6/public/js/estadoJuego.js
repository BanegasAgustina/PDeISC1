// ============================================================
// estadoJuego.js - Estado centralizado de la partida activa
// ============================================================
// Un único objeto de estado evita tener variables globales sueltas
// y elimina la desincronización entre la lógica y la interfaz.
// Ninguna función de otro módulo modifica variables locales:
// todo pasa por los métodos públicos de este módulo.
//
// Patrón: IIFE (módulo que se ejecuta solo) para encapsular el estado privado.

const EstadoJuego = (() => {

  // Plantilla del estado "en blanco" — se usa al crear y al reiniciar.
  // Devuelve un NUEVO objeto cada vez para no compartir referencias.
  const _inicial = () => ({
    palabraCompleta:          '',        // La palabra completa (string) tal como vino de la API
    palabra:                  [],        // Array de chars de palabraCompleta (para iterar letra por letra)
    letrasUsadas:             new Set(), // Set de letras normalizadas ya intentadas (incluye las de pistas)
    letrasIncorrectas:        [],        // Array de letras incorrectas para mostrar en "Letras incorrectas"
    letrasReveladasPorPista:  new Set(), // Subconjunto de letrasUsadas: solo las reveladas por pista
    intentosMaximos:          6,         // Total de intentos permitidos (siempre 6 para emparejar con el muñeco)
    intentosRestantes:        6,         // Intentos que le quedan al jugador
    pistasRestantes:          0,         // Pistas disponibles (depende de la dificultad)
    segundos:                 0,         // Tiempo transcurrido en la partida (actualizado por el cronómetro)
    puntaje:                  0,         // Puntaje final (0 mientras juega, calculado al terminar)
    gano:                     false,     // true si el jugador ganó la partida
    terminado:                false,     // true si la partida terminó (victoria o derrota)
    categoria:                'general', // Categoría seleccionada por el usuario
    dificultad:               'media',   // Dificultad seleccionada por el usuario
    cargando:                 false      // true mientras se espera la respuesta del servidor (anti double-click)
  });

  let _estado = _inicial(); // Estado actual de la partida (privado)

  // ── LECTURA ──────────────────────────────────────────────
  // Retorna una COPIA del estado para que código externo no pueda mutarlo accidentalmente.
  // Los Sets y arrays se clonan individualmente (spread copia shallow).
  function obtener() {
    return {
      ..._estado,                                                        // Copia todas las propiedades primitivas
      palabra:                 [..._estado.palabra],                     // Copia del array de chars
      letrasUsadas:            new Set(_estado.letrasUsadas),            // Copia del Set de letras usadas
      letrasReveladasPorPista: new Set(_estado.letrasReveladasPorPista), // Copia del Set de pistas
      letrasIncorrectas:       [..._estado.letrasIncorrectas]            // Copia del array de incorrectas
    };
  }

  // ── INICIALIZACIÓN ───────────────────────────────────────
  // Carga los datos devueltos por la API en el estado interno.
  // Se llama luego del fetch exitoso, antes de dibujar la palabra.
  function iniciarDesdeApi(datos) {
    const palabraLimpia         = String(datos.palabra || '').toLowerCase().trim(); // Normaliza a minúsculas
    _estado.palabraCompleta     = palabraLimpia;
    _estado.palabra             = palabraLimpia.split('');                          // Convierte a array de chars
    _estado.intentosMaximos     = Math.max(1, Number(datos.intentos)  || 6);        // Mínimo 1 intento
    _estado.intentosRestantes   = Math.max(1, Number(datos.intentos)  || 6);
    _estado.pistasRestantes     = Math.max(0, Number(datos.pistas)    || 0);        // Mínimo 0 pistas
    _estado.categoria           = datos.categoria  || 'general';
    _estado.dificultad          = datos.dificultad || 'media';
    _estado.cargando            = false; // La carga terminó, se puede jugar
  }

  // Reinicia completamente el estado para comenzar una nueva partida.
  // Preserva la categoría y dificultad seleccionadas por el usuario en los selectores.
  function reiniciar(categoriaUI, dificultadUI) {
    _estado = _inicial();                          // Vuelve a la plantilla en blanco
    _estado.categoria  = categoriaUI  || 'general';
    _estado.dificultad = dificultadUI || 'media';
  }

  // ── JUGABILIDAD ──────────────────────────────────────────
  // Procesa un intento de letra del jugador (teclado físico o virtual).
  // Retorna un string con el resultado:
  //   'correcta'  → la letra está en la palabra
  //   'incorrecta'→ la letra NO está; se descuenta un intento
  //   'repetida'  → ya se intentó antes (no descuenta intentos)
  //   'terminado' → la partida ya terminó, se ignora el input
  function intentarLetra(letraNormalizada) {
    if (_estado.terminado)                            return 'terminado';  // Guard: partida ya finalizada
    if (_estado.letrasUsadas.has(letraNormalizada))   return 'repetida';   // Guard: letra ya intentada

    _estado.letrasUsadas.add(letraNormalizada); // Registra la letra como usada

    // Verifica si algún carácter de la palabra coincide con la letra ingresada
    const estaEnPalabra = _estado.palabra.some(
      (c) => normalizarTexto(c) === letraNormalizada // Compara sin tildes (ej: 'é' == 'e')
    );

    if (estaEnPalabra) {
      return 'correcta';
    } else {
      _estado.letrasIncorrectas.push(letraNormalizada);                        // Registra como incorrecta
      _estado.intentosRestantes = Math.max(0, _estado.intentosRestantes - 1); // Descuenta un intento (mínimo 0)
      return 'incorrecta';
    }
  }

  // Revela una letra pendiente ALEATORIA de la palabra como pista.
  // Solo funciona si quedan pistas disponibles y letras sin adivinar.
  // Retorna la letra revelada (string), o null si no se puede usar pista.
  function usarPista() {
    if (_estado.terminado || _estado.pistasRestantes <= 0) return null; // Guards

    // Filtra las letras de la palabra que todavía NO fueron adivinadas
    const pendientes = _estado.palabra
      .map((c) => normalizarTexto(c))                    // Normaliza cada carácter
      .filter((c) => /^[a-zñ]$/.test(c)                 // Solo letras (no espacios/guiones)
                  && !_estado.letrasUsadas.has(c));       // Solo las que aún no se intentaron

    if (!pendientes.length) return null; // No hay letras pendientes → no puede dar pista

    // Elige una letra pendiente al azar
    const letra = pendientes[Math.floor(Math.random() * pendientes.length)];
    _estado.letrasReveladasPorPista.add(letra); // Registra que esta letra vino de una pista
    _estado.letrasUsadas.add(letra);            // También la marca como usada (para el teclado)
    _estado.pistasRestantes--;                  // Consume una pista
    return letra;
  }

  // Verifica si el jugador ganó: todas las letras de la palabra fueron reveladas.
  // Guard con palabra vacía para evitar falso positivo al reiniciar antes del fetch.
  function verificarVictoria() {
    if (!_estado.palabra.length) return false; // Sin palabra, nunca es victoria

    const gano = _estado.palabra.every(
      // Cada carácter debe ser NO-letra (espacio/guión, que se muestra siempre)
      // O bien una letra ya presente en letrasUsadas
      (c) => !/[a-zA-Z\u00c0-\u017f\u00f1\u00d1]/.test(c) ||
             _estado.letrasUsadas.has(normalizarTexto(c))
    );

    if (gano) {
      _estado.gano      = true;  // Marca como victoria
      _estado.terminado = true;  // La partida terminó
    }
    return gano;
  }

  // Verifica si el jugador perdió: se quedó sin intentos.
  function verificarDerrota() {
    if (_estado.intentosRestantes <= 0) {
      _estado.gano      = false; // No ganó
      _estado.terminado = true;  // La partida terminó
      return true;
    }
    return false;
  }

  // ── ACTUALIZACIÓN DE ESTADO ──────────────────────────────
  // Guarda el puntaje calculado externamente por puntaje.js.
  // Se llama desde _terminarPartida() en main.js.
  function guardarPuntajeFinal(pts) {
    _estado.puntaje = Math.max(0, Number(pts) || 0); // Siempre ≥ 0
  }

  // El cronómetro llama esto cada segundo para mantener el tiempo sincronizado en el estado.
  function actualizarSegundos(s) {
    _estado.segundos = Math.max(0, Number(s) || 0);
  }

  // Guard anti-doble-clic: bloquea una segunda llamada a iniciarPartida()
  // mientras ya hay un fetch en curso.
  function marcarCargando(valor) {
    _estado.cargando = Boolean(valor);
  }

  // ── ACCESO A CONJUNTOS ───────────────────────────────────
  // Devuelve el Set INTERNO de letras usadas (incluye las reveladas por pistas).
  // Se usa para dibujar la palabra y colorear el teclado.
  // NOTA: no se clona aquí porque teclado.js y palabra.js solo LEEN el Set.
  function letrasAdivinadas() {
    return _estado.letrasUsadas;
  }

  // Devuelve un Set con todas las letras normalizadas que contiene la palabra.
  // Se usa para colorear el teclado: verde si está, rojo si no está.
  function letrasEnPalabra() {
    const set = new Set();
    _estado.palabra.forEach((c) => {
      const n = normalizarTexto(c);
      if (/^[a-zñ]$/.test(n)) set.add(n); // Solo agrega letras válidas (descarta espacios y guiones)
    });
    return set;
  }

  // Expone la interfaz pública del módulo. Todo lo demás queda privado.
  return {
    obtener,
    iniciarDesdeApi,
    reiniciar,
    intentarLetra,
    usarPista,
    verificarVictoria,
    verificarDerrota,
    guardarPuntajeFinal,
    actualizarSegundos,
    marcarCargando,
    letrasAdivinadas,
    letrasEnPalabra
  };
})();
