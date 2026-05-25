// Módulo para manejar el cambio entre modo claro y oscuro
const TemaContext = (function () {
  // Obtener el tema guardado en localStorage, o usar 'claro' por defecto
  let temaActual = localStorage.getItem("tema") || "claro";

  // Función para aplicar un tema específico
  function aplicarTema(tema) {
    const body = document.body;
    const temaIcono = document.getElementById("temaIcono");

    if (tema === "oscuro") {
      // Aplicar modo oscuro
      body.classList.add("tema-oscuro");
      body.classList.remove("tema-claro");
      temaIcono.textContent = "☀️";
    } else {
      // Aplicar modo claro
      body.classList.add("tema-claro");
      body.classList.remove("tema-oscuro");
      temaIcono.textContent = "🌙";
    }

    // Guardar el tema actual
    temaActual = tema;
    localStorage.setItem("tema", tema);
  }

  // Función para cambiar entre modo claro y oscuro
  function toggleTema() {
    const nuevoTema = temaActual === "claro" ? "oscuro" : "claro";
    aplicarTema(nuevoTema);
  }

  // Función para inicializar el tema al cargar la página
  function init() {
    aplicarTema(temaActual);

    // Asignar el evento al botón de cambio de tema
    const toggleBtn = document.getElementById("toggleTemaBtn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", toggleTema);
    }
  }

  // Exportar las funciones públicas
  return {
    init,
    aplicarTema,
    toggleTema,
    getTema: () => temaActual,
  };
})();

// Inicializar el módulo cuando la página cargue
document.addEventListener("DOMContentLoaded", TemaContext.init);
