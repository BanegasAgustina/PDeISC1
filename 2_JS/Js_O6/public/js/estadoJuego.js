// ============================================================
// estadoJuego.js - Estado centralizado de la partida activa
// ============================================================
// Un único objeto de estado evita variables globales sueltas
// y elimina la desincronización entre lógica e interfaz.
// Ninguna función de otro módulo lee variables locales: todo pasa por aquí.

const EstadoJuego = (() => {

  // Plantilla del estado vacío (se usa al crear y al reiniciar).
  const _inicial = () => ({
    palabraCompleta:          '',
    palabra:                  [],        // array de chars de palabraCompleta
    letrasUsadas:             new Set(), // letras normalizadas ya intentadas (incluye pistas)
    letrasIncorrectas:        [],        // letras incorrectas para mostrar en UI
    letrasReveladasPorPista:  new Set(), // subconjunto de letrasUsadas reveladas por pista
    intentosMaximos:          6,
    intentosRestantes:        6,
    pistasRestantes:          0,
    segundos:                 0,
    puntaje:                  0,
    gano:                     false,
    terminado:                false,
    categoria:                'general',
    dificultad:               'media',
    cargando:                 false
  });

  let _estado = _inicial();

  // ── LECTURA ──────────────────────────────────────────────
  // Retorna una copia del estado. Los Sets y arrays se clonan
  // para evitar mutaciones accidentales desde fuera del módulo.
  function obtener() {
    return {
      ..._estado,
      palabra:                 [..._estado.palabra],
      letrasUsadas:            new Set(_estado.letrasUsadas),
      letrasReveladasPorPista: new Set(_estado.letrasReveladasPorPista),
      letrasIncorrectas:       [..._estado.letrasIncorrectas]
    };
  }

  // ── INICIALIZACIÓN ───────────────────────────────────────
  // Carga los datos de la API en el estado. Se llama tras el fetch exitoso.
  function iniciarDesdeApi(datos) {
    const palabraLimpia         = String(datos.palabra || '').toLowerCase().trim();
    _estado.palabraCompleta     = palabraLimpia;
    _estado.palabra             = palabraLimpia.split('');
    _estado.intentosMaximos     = Math.max(1, Number(datos.intentos)  || 6);
    _estado.intentosRestantes   = Math.max(1, Number(datos.intentos)  || 6);
    _estado.pistasRestantes     = Math.max(0, Number(datos.pistas)    || 0);
    _estado.categoria           = datos.categoria  || 'general';
    _estado.dificultad          = datos.dificultad || 'media';
    _estado.cargando            = false;
  }

  // Reinicia completamente el estado para una nueva partida.
  function reiniciar(categoriaUI, dificultadUI) {
    _estado = _inicial();
    _estado.categoria  = categoriaUI  || 'general';
    _estado.dificultad = dificultadUI || 'media';
  }

  // ── JUGABILIDAD ──────────────────────────────────────────
  // Registra un intento de letra.
  // Retorna: 'correcta' | 'incorrecta' | 'repetida' | 'terminado'
  function intentarLetra(letraNormalizada) {
    if (_estado.terminado)                            return 'terminado';
    if (_estado.letrasUsadas.has(letraNormalizada))   return 'repetida';

    _estado.letrasUsadas.add(letraNormalizada);

    const estaEnPalabra = _estado.palabra.some(
      (c) => normalizarTexto(c) === letraNormalizada
    );

    if (estaEnPalabra) {
      return 'correcta';
    } else {
      _estado.letrasIncorrectas.push(letraNormalizada);
      _estado.intentosRestantes = Math.max(0, _estado.intentosRestantes - 1);
      return 'incorrecta';
    }
  }

  // Revela una letra pendiente aleatoria como pista.
  // Retorna la letra revelada, o null si no hay pistas ni letras disponibles.
  function usarPista() {
    if (_estado.terminado || _estado.pistasRestantes <= 0) return null;

    // Letras que existen en la palabra pero todavía no fueron adivinadas
    const pendientes = _estado.palabra
      .map((c) => normalizarTexto(c))
      .filter((c) => /^[a-zñ]$/.test(c) && !_estado.letrasUsadas.has(c));

    if (!pendientes.length) return null;

    const letra = pendientes[Math.floor(Math.random() * pendientes.length)];
    _estado.letrasReveladasPorPista.add(letra);
    _estado.letrasUsadas.add(letra); // también va a usadas para el teclado
    _estado.pistasRestantes--;
    return letra;
  }

  // Verifica victoria: todas las letras de la palabra fueron reveladas.
  // Guard: con palabra vacía nunca hay victoria (evita false positive al reiniciar).
  function verificarVictoria() {
    if (!_estado.palabra.length) return false;
    const gano = _estado.palabra.every(
      (c) => !/[a-zA-Z\u00c0-\u017f\u00f1\u00d1]/.test(c) ||
             _estado.letrasUsadas.has(normalizarTexto(c))
    );
    if (gano) {
      _estado.gano      = true;
      _estado.terminado = true;
    }
    return gano;
  }

  // Verifica derrota: sin intentos restantes.
  function verificarDerrota() {
    if (_estado.intentosRestantes <= 0) {
      _estado.gano      = false;
      _estado.terminado = true;
      return true;
    }
    return false;
  }

  // ── ACTUALIZACIÓN DE ESTADO ──────────────────────────────
  // Almacena el puntaje calculado externamente (por puntaje.js).
  function guardarPuntajeFinal(pts) {
    _estado.puntaje = Math.max(0, Number(pts) || 0);
  }

  // El cronómetro llama esto cada segundo.
  function actualizarSegundos(s) {
    _estado.segundos = Math.max(0, Number(s) || 0);
  }

  // Guard anti-doble-clic: evita iniciar dos partidas en paralelo.
  function marcarCargando(valor) {
    _estado.cargando = Boolean(valor);
  }

  // ── ACCESO A CONJUNTOS ───────────────────────────────────
  // Devuelve el Set interno de letras usadas (incluye pistas).
  // Se usa para dibujar la palabra y el teclado. NO clonar aquí
  // ya que teclado.js y palabra.js solo leen, no mutando.
  function letrasAdivinadas() {
    return _estado.letrasUsadas;
  }

  // Devuelve un Set con las letras normalizadas que contiene la palabra.
  // Se usa para colorear el teclado (verde = correcta, rojo = incorrecta).
  function letrasEnPalabra() {
    const set = new Set();
    _estado.palabra.forEach((c) => {
      const n = normalizarTexto(c);
      if (/^[a-zñ]$/.test(n)) set.add(n);
    });
    return set;
  }

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
