// Se encierra el codigo para no crear variables globales innecesarias.
(function () {
  // Clave usada para recordar la preferencia de tema en el navegador.
  const storageKey = "apiActivitiesTheme";

  // Referencias al documento HTML y al boton de cambio de tema.
  const root = document.documentElement;
  const button = document.getElementById("themeToggle");

  // Aplica el tema recibido y actualiza el texto del boton.
  function applyTheme(theme) {
    root.setAttribute("data-bs-theme", theme);
    if (button) {
      button.textContent = theme === "dark" ? "Modo claro" : "Modo oscuro";
    }
  }

  // Usa el tema guardado o modo claro si todavia no hay preferencia.
  const savedTheme = localStorage.getItem(storageKey) || "light";
  applyTheme(savedTheme);

  // Cambia entre modo claro y oscuro al presionar el boton.
  if (button) {
    button.addEventListener("click", () => {
      const nextTheme = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      localStorage.setItem(storageKey, nextTheme);
      applyTheme(nextTheme);
    });
  }
})();
