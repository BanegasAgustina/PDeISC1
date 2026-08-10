import { useState } from "react";
import "./App.css";
// Importamos la imagen hero.png de assets para usarla en el layout horizontal
import heroImg from "./assets/hero.png";

// Componente principal
function App() {
  // Estado para alternar tema claro/oscuro
  const [temaOscuro, setTemaOscuro] = useState(false);

  return (
    <main className="pagina" data-theme={temaOscuro ? "dark" : "light"}>
      <button
        className="tema"
        onClick={() => setTemaOscuro(!temaOscuro)}
        aria-label={temaOscuro ? "Activar modo claro" : "Activar modo oscuro"}
      >
        {temaOscuro ? "☀️" : "🌙"}
      </button>

      {/* Tarjeta con layout HORIZONTAL en PC (imagen + texto), vertical en móvil */}
      <section className="tarjeta" aria-labelledby="titulo">
        {/* Columna izquierda: imagen ilustrativa */}
        <div className="tarjeta__imagen">
          <img src={heroImg} alt="Ilustración decorativa" />
        </div>

        {/* Columna derecha: texto y contenido */}
        <div className="tarjeta__texto">
          <span className="etiqueta">React + Vite</span>
          <h1 id="titulo">Hola, mundo!</h1>
          <p>Mi primer componente React con una interfaz cuidada.</p>
        </div>
      </section>
    </main>
  );
}

export default App;
