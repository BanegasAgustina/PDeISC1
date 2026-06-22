// Se encierra el codigo para no crear variables globales innecesarias.
(function () {
  // Clave usada para recordar la preferencia de tema en el navegador.
  let storageKey = "apiActivitiesTheme";

  // Referencias al documento HTML y al boton de cambio de tema.
  let root = document.documentElement;
  let button = document.getElementById("themeToggle");
  let scrollBtn = document.getElementById("scrollToTop");

  // Íconos para los temas (Bootstrap Icons).
  const sunIcon = `☀️`;
  const moonIcon = `🌙`;

  // Aplica el tema recibido y actualiza el ícono del boton.
  function applyTheme(theme) {
    root.setAttribute("data-bs-theme", theme);
    if (button) {
      button.innerHTML = theme === "dark" ? sunIcon : moonIcon;
    }
  }

  // Funciones para el botón de scroll to top.
  function toggleScrollButton() {
    if (window.scrollY > 300) {
      scrollBtn?.classList.add("show");
    } else {
      scrollBtn?.classList.remove("show");
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Usa el tema guardado o modo oscuro si todavia no hay preferencia.
  let savedTheme = localStorage.getItem(storageKey) || "dark";
  applyTheme(savedTheme);

  // Cambia entre modo claro y oscuro al presionar el boton.
  if (button) {
    button.addEventListener("click", () => {
      let nextTheme = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      localStorage.setItem(storageKey, nextTheme);
      applyTheme(nextTheme);
    });
  }

  // Event listeners para el botón de scroll to top.
  window.addEventListener("scroll", toggleScrollButton);
  scrollBtn?.addEventListener("click", scrollToTop);
})();
