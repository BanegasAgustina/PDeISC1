// App.tsx - Componente principal
import { useState } from "react";

import TarjetaPresentacion from "./Components/TarjetaPresentacion";
import "./App.css";
// Imagen importada como módulo
import fotoPerfil from "./assets/images.jfif";

function App() {
  // Estado para alternar tema claro/oscuro (empieza en claro = false)
  const [temaOscuro, setTemaOscuro] = useState(false);

  return (
    // data-theme usa el valor del estado para cambiar los colores CSS
    <main className="pagina" data-theme={temaOscuro ? "dark" : "light"}>
      {/* Botón toggle: ! invierte el booleano */}
      <button
        className="tema"
        onClick={() => setTemaOscuro(!temaOscuro)}
        aria-label={temaOscuro ? "Activar modo claro" : "Activar modo oscuro"}
      >
        {temaOscuro ? "☀️" : "🌙"}
      </button>

      {/* Paso datos al componente hijo mediante props */}
      <TarjetaPresentacion
        nombre="Juan"
        apellido="Perez"
        profesion="Desarrollador web"
        imagen={fotoPerfil}
      />
    </main>
  );
}

export default App;
