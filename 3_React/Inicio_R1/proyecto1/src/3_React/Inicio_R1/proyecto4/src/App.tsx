import { FormEvent, useEffect, useState } from "react";
import "./App.css";

// Forma de cada tarea
type Tarea = { id: number; texto: string; completada: boolean };

// Claves para localStorage (nombres únicos para no mezclar con otros proyectos)
const CLAVE_TAREAS = "proyecto4-tareas";
const CLAVE_TEMA = "proyecto4-tema";

function App() {
  // --- ESTADOS CON VALOR INICIAL LEÍDO DESDE LOCALSTORAGE ---
  // Usamos una función como inicializador de useState para leer SOLO una vez al montar.
  // Si no hay nada guardado (primera vez), devolvemos el valor por defecto.

  // 1) Tareas: leemos JSON del storage → lo parseamos. Si falla o no existe → []
  const [tareas, setTareas] = useState<Tarea[]>(() => {
    try {
      const guardadas = localStorage.getItem(CLAVE_TAREAS);
      return guardadas ? JSON.parse(guardadas) : [];
    } catch {
      return [];
    }
  });

  // 2) Tema oscuro/claro: si el storage dice 'dark' → true, sino → false
  const [temaOscuro, setTemaOscuro] = useState<boolean>(() => {
    return localStorage.getItem(CLAVE_TEMA) === "dark";
  });

  const [texto, setTexto] = useState("");

  // Estados para el MODO EDICIÓN
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [textoEditado, setTextoEditado] = useState("");

  // --- USEEFFECT: guarda cambios AUTOMÁTICAMENTE en localStorage ---
  // useEffect ejecuta una función DESPUÉS de cada render.
  // El array de dependencias [tareas] hace que SOLO se ejecute cuando cambie "tareas".
  useEffect(() => {
    localStorage.setItem(CLAVE_TAREAS, JSON.stringify(tareas));
  }, [tareas]);

  // Lo mismo pero para el tema
  useEffect(() => {
    localStorage.setItem(CLAVE_TEMA, temaOscuro ? "dark" : "light");
  }, [temaOscuro]);

  // --- ACCIONES DEL USUARIO ---

  function agregarTarea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const textoLimpio = texto.trim();
    if (!textoLimpio) return;
    setTareas([
      ...tareas,
      { id: Date.now(), texto: textoLimpio, completada: false },
    ]);
    setTexto("");
  }

  function cambiarEstado(id: number) {
    setTareas(
      tareas.map((tarea) =>
        tarea.id === id ? { ...tarea, completada: !tarea.completada } : tarea,
      ),
    );
  }

  function eliminarTarea(id: number) {
    setTareas(tareas.filter((tarea) => tarea.id !== id));
    if (idEditando === id) {
      setIdEditando(null);
      setTextoEditado("");
    }
  }

  // Entra en modo edición
  function iniciarEdicion(tarea: Tarea) {
    setIdEditando(tarea.id);
    setTextoEditado(tarea.texto);
  }

  // Guarda cambios y sale del modo edición
  function guardarEdicion(id: number) {
    const textoLimpio = textoEditado.trim();
    if (!textoLimpio) return;
    setTareas(
      tareas.map((tarea) =>
        tarea.id === id ? { ...tarea, texto: textoLimpio } : tarea,
      ),
    );
    setIdEditando(null);
    setTextoEditado("");
  }

  // Cancela sin guardar
  function cancelarEdicion() {
    setIdEditando(null);
    setTextoEditado("");
  }

  const completadas = tareas.filter((tarea) => tarea.completada).length;

  return (
    <main className="pagina" data-theme={temaOscuro ? "dark" : "light"}>
      {/* Botón de tema con ícono Sol/Luna */}
      <button
        className="tema"
        onClick={() => setTemaOscuro(!temaOscuro)}
        aria-label={temaOscuro ? "Activar modo claro" : "Activar modo oscuro"}
      >
        {temaOscuro ? "☀️" : "🌙"}
      </button>

      <section className="panel">
        <p className="eyebrow">Arreglos y eventos</p>
        <h1>Mis tareas</h1>
        <p className="resumen">
          {tareas.length} totales · {completadas} completadas
        </p>

        <form onSubmit={agregarTarea}>
          <input
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            placeholder="¿Qué necesitás hacer?"
            aria-label="Nueva tarea"
          />
          <button>Agregar</button>
        </form>

        {tareas.length === 0 ? (
          <p className="vacio">Todavía no hay tareas. ¡Agregá la primera!</p>
        ) : (
          <ul>
            {tareas.map((tarea) => (
              <li
                key={tarea.id}
                className={tarea.completada ? "completada" : ""}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={tarea.completada}
                    onChange={() => cambiarEstado(tarea.id)}
                  />
                  {/* Renderizado condicional: input de editar o texto normal */}
                  {idEditando === tarea.id ? (
                    <input
                      className="input-editar"
                      value={textoEditado}
                      onChange={(e) => setTextoEditado(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") guardarEdicion(tarea.id);
                        if (e.key === "Escape") cancelarEdicion();
                      }}
                      autoFocus
                    />
                  ) : (
                    <span>{tarea.texto}</span>
                  )}
                </label>

                {/* Botones de acción: Editar / Guardar / Cancelar / Eliminar */}
                <div className="acciones">
                  {idEditando === tarea.id ? (
                    <>
                      <button
                        className="boton-icono guardar"
                        onClick={() => guardarEdicion(tarea.id)}
                        aria-label="Guardar cambios"
                      >
                        ✔️
                      </button>
                      <button
                        className="boton-icono cancelar"
                        onClick={cancelarEdicion}
                        aria-label="Cancelar edición"
                      >
                        ✖️
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="boton-icono editar"
                        onClick={() => iniciarEdicion(tarea)}
                        aria-label="Editar tarea"
                      >
                        ✏️
                      </button>
                      <button
                        className="boton-icono eliminar"
                        onClick={() => eliminarTarea(tarea.id)}
                        aria-label="Eliminar tarea"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
