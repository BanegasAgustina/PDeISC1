// ============================================================
// tema.js - Modo claro / oscuro
// ============================================================

// Alterna entre modo oscuro y claro, persiste en localStorage.
function alternarTema() {
  const html     = document.documentElement;
  const nuevoTema = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', nuevoTema);
  localStorage.setItem('tema', nuevoTema);
  _actualizarIcono(nuevoTema);
}

// Aplica el tema guardado en localStorage al cargar la página.
function cargarTema() {
  const tema = localStorage.getItem('tema') || 'light';
  document.documentElement.setAttribute('data-theme', tema);
  _actualizarIcono(tema);
}

// Cambia el ícono del botón según el tema activo.
function _actualizarIcono(tema) {
  const icono = document.getElementById('icono-tema');
  if (icono) {
    icono.textContent = tema === 'dark' ? '☀️' : '🌙';
  }
}
