/**
 * ============================================================
 * theme.js — Modo claro / oscuro y botón volver arriba
 * ============================================================
 * - Cambia el atributo data-theme en <html> (CSS reacciona con [data-theme])
 * - Guarda la preferencia en localStorage para recordarla al recargar
 * - Muestra el botón #scrollToTop cuando el usuario baja más de 300px
 *
 * Se envuelve en una IIFE para no contaminar el scope global.
 */

(function () {
  const storageKey = "alumnosTheme"; // clave en localStorage
  const root = document.documentElement; // elemento <html>
  const button = document.getElementById("themeToggle");
  const scrollBtn = document.getElementById("scrollToTop");

  /**
   * Aplica el tema elegido y actualiza el ícono del botón.
   * @param {"dark"|"light"} theme
   */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);

    if (button) {
      button.textContent = theme === "dark" ? "☀️" : "🌙";
      button.setAttribute(
        "aria-label",
        theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
      );
    }
  }

  /** Muestra u oculta el botón flotante según la posición del scroll */
  function toggleScrollButton() {
    scrollBtn?.classList.toggle("show", window.scrollY > 300);
  }

  // Al cargar: usa el tema guardado o "dark" por defecto
  const savedTheme = localStorage.getItem(storageKey) || "dark";
  applyTheme(savedTheme);

  // Click en el botón: alterna entre dark y light
  button?.addEventListener("click", () => {
    const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  });

  // Escucha el scroll para mostrar/ocultar "volver arriba"
  window.addEventListener("scroll", toggleScrollButton);

  // Scroll suave hacia el inicio de la página
  scrollBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
