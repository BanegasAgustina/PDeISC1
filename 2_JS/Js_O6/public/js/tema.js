// ============================================================
// tema.js - Modo claro / oscuro
// ============================================================
// Maneja el tema visual de la app. Persiste la elección del usuario
// en localStorage para que se recuerde entre sesiones del navegador.

// Alterna entre modo oscuro y claro cada vez que el usuario presiona el botón.
// Lee el tema actual del atributo data-theme del <html>,
// lo invierte y lo guarda en localStorage.
function alternarTema() {
  const html      = document.documentElement;                        // Elemento <html> raíz
  const nuevoTema = html.getAttribute('data-theme') === 'dark'       // Si está en dark...
    ? 'light'                                                         // ...cambia a light
    : 'dark';                                                         // ...si no, cambia a dark
  html.setAttribute('data-theme', nuevoTema);                        // Aplica el nuevo tema al <html>
  localStorage.setItem('tema', nuevoTema);                           // Lo guarda para la próxima visita
  _actualizarIcono(nuevoTema);                                       // Cambia el ícono del botón
}

// Lee el tema guardado en localStorage y lo aplica al cargar la página.
// Si no hay nada guardado, usa 'light' como valor por defecto.
function cargarTema() {
  const tema = localStorage.getItem('tema') || 'light'; // Lee o usa 'light' por defecto
  document.documentElement.setAttribute('data-theme', tema); // Aplica al <html>
  _actualizarIcono(tema);                                     // Sincroniza el ícono
}

// Cambia el ícono del botón de tema según el modo activo.
// En modo oscuro muestra ☀️ (para ofrecer volver a claro).
// En modo claro muestra 🌙 (para ofrecer pasar a oscuro).
function _actualizarIcono(tema) {
  const icono = document.getElementById('icono-tema'); // Botón del header
  if (icono) {
    icono.textContent = tema === 'dark' ? '☀️' : '🌙'; // Emoji según el tema actual
  }
}
