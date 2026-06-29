/**
 * ============================================================
 * script.js — Lógica del frontend (Js_O5)
 * ============================================================
 * Responsabilidades:
 *   1. Cargar alumnos con POST /api/alumnos { accion: "listar" }
 *   2. Mostrarlos en tabla (desktop) o tarjetas (móvil)
 *   3. Validar el formulario antes de enviar
 *   4. Crear alumnos con POST /api/alumnos { nombre, apellido, edad }
 *   5. Detectar duplicados en el cliente antes de llamar al servidor
 */

// Ruta relativa: el navegador la resuelve contra http://localhost:3005
const API_URL = "/api/alumnos";

// --- Referencias a elementos del DOM (index.html) ---

const statusBox = document.getElementById("status");           // mensaje de estado (info/success/error)
const studentsBody = document.getElementById("studentsBody");   // <tbody> de la tabla
const studentsCards = document.getElementById("studentsCards"); // contenedor de tarjetas móvil
const studentsCount = document.getElementById("studentsCount"); // número en la stat-card azul
const apiState = document.getElementById("apiState");           // "Online", "Error", etc.
const reloadBtn = document.getElementById("reloadBtn");
const studentForm = document.getElementById("studentForm");
const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");
const edadInput = document.getElementById("edad");

// Copia local de la lista actual; sirve para validar duplicados sin otra petición
let alumnosCargados = [];

// ============================================================
// Validación y utilidades de UI
// ============================================================

/**
 * Comprueba si ya hay un alumno con el mismo nombre + apellido.
 * La comparación ignora mayúsculas y espacios extra.
 */
function esDuplicado(nombre, apellido) {
  const clave = `${nombre.trim().toLowerCase()}|${apellido.trim().toLowerCase()}`;
  return alumnosCargados.some(
    (a) => `${a.nombre.trim().toLowerCase()}|${a.apellido.trim().toLowerCase()}` === clave,
  );
}

/**
 * Actualiza la caja de mensajes sobre el listado.
 * @param {string} message - Texto a mostrar
 * @param {"info"|"success"|"error"} type - Clase CSS status-*
 */
function setStatus(message, type = "info") {
  statusBox.textContent = message;
  statusBox.className = `status status-${type}`;
}

/**
 * Marca un input como válido o inválido y muestra el error debajo.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} errorEl - párrafo .field-error
 * @param {string} message - vacío = sin error
 */
function setFieldError(input, errorEl, message) {
  const hasError = message !== "";
  input.classList.toggle("is-invalid", hasError);
  errorEl.textContent = message;
  errorEl.hidden = !hasError;
}

/**
 * Impide escribir números en nombre/apellido.
 * Se ejecuta en cada keystroke y también al pegar texto.
 */
function bloquearNumeros(input) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\d/g, "");
  });
}

/** Valida que un campo de texto no esté vacío */
function validarTexto(input, errorEl, label) {
  const valor = input.value.trim();

  if (valor === "") {
    setFieldError(input, errorEl, `El ${label} es obligatorio.`);
    return false;
  }

  setFieldError(input, errorEl, "");
  return true;
}

/** Valida que la edad tenga algún valor (el input es type="number") */
function validarEdad() {
  const errorEl = document.getElementById("edadError");
  const valor = edadInput.value.trim();

  if (valor === "") {
    setFieldError(edadInput, errorEl, "La edad es obligatoria.");
    return false;
  }

  setFieldError(edadInput, errorEl, "");
  return true;
}

/** Ejecuta todas las validaciones del formulario; todas deben pasar */
function validarFormulario() {
  const nombreOk = validarTexto(nombreInput, document.getElementById("nombreError"), "nombre");
  const apellidoOk = validarTexto(apellidoInput, document.getElementById("apellidoError"), "apellido");
  const edadOk = validarEdad();
  return nombreOk && apellidoOk && edadOk;
}

// ============================================================
// Renderizado del listado
// ============================================================

/**
 * Pinta la lista de alumnos en pantalla.
 * Desktop (≥640px): tabla en #studentsBody
 * Móvil: tarjetas con iniciales en #studentsCards
 */
function renderStudents(alumnos) {
  studentsCount.textContent = alumnos.length;
  apiState.textContent = "Online";

  if (alumnos.length === 0) {
    studentsBody.innerHTML = "";
    studentsCards.innerHTML = '<p class="empty">No hay alumnos registrados.</p>';
    return;
  }

  // Filas de la tabla (visible en pantallas anchas)
  studentsBody.innerHTML = alumnos
    .map(
      (a) => `
      <tr>
        <td>${a.id}</td>
        <td>${a.nombre}</td>
        <td>${a.apellido}</td>
        <td>${a.edad}</td>
      </tr>
    `,
    )
    .join("");

  // Tarjetas con avatar de iniciales (visible en móvil)
  studentsCards.innerHTML = alumnos
    .map(
      (a) => `
      <article class="student-card">
        <span class="avatar">${a.nombre.charAt(0)}${a.apellido.charAt(0)}</span>
        <div>
          <p class="student-name">${a.nombre} ${a.apellido}</p>
          <p class="student-meta">ID ${a.id} · ${a.edad} años</p>
        </div>
      </article>
    `,
    )
    .join("");
}

// ============================================================
// Comunicación con la API
// ============================================================

/**
 * Pide la lista completa al servidor y actualiza la interfaz.
 * Usa POST con { accion: "listar" } porque la API no expone GET.
 */
async function loadStudents() {
  setStatus("Cargando alumnos desde la API...", "info");
  apiState.textContent = "Consultando";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "listar" }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const alumnos = await response.json();
    alumnosCargados = alumnos;
    renderStudents(alumnos);
    setStatus(`${alumnos.length} alumnos cargados.`, "success");
  } catch (error) {
    apiState.textContent = "Error";
    setStatus(`No se pudieron cargar los alumnos: ${error.message}`, "error");
  }
}

// ============================================================
// Eventos: validación en tiempo real
// ============================================================

bloquearNumeros(nombreInput);
bloquearNumeros(apellidoInput);

// Valida al salir del campo (evento blur)
nombreInput.addEventListener("blur", () =>
  validarTexto(nombreInput, document.getElementById("nombreError"), "nombre"),
);
apellidoInput.addEventListener("blur", () =>
  validarTexto(apellidoInput, document.getElementById("apellidoError"), "apellido"),
);
edadInput.addEventListener("blur", validarEdad);

// ============================================================
// Eventos: envío del formulario
// ============================================================

studentForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // evita recargar la página al enviar

  // Paso 1: campos obligatorios
  if (!validarFormulario()) {
    setStatus("Completá todos los campos antes de guardar.", "error");
    return;
  }

  const nombre = nombreInput.value.trim();
  const apellido = apellidoInput.value.trim();

  // Paso 2: duplicado en la lista ya cargada (validación rápida en cliente)
  if (esDuplicado(nombre, apellido)) {
    setStatus("Ya existe un alumno con ese nombre y apellido.", "error");
    return;
  }

  // Paso 3: POST al servidor (también valida duplicados en MySQL)
  try {
    setStatus("Guardando alumno...", "info");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        apellido,
        edad: Number(edadInput.value.trim()),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    // Limpia el formulario y los mensajes de error
    studentForm.reset();
    [nombreInput, apellidoInput, edadInput].forEach((input) => input.classList.remove("is-invalid"));
    ["nombreError", "apellidoError", "edadError"].forEach((id) => {
      const errorEl = document.getElementById(id);
      errorEl.textContent = "";
      errorEl.hidden = true;
    });

    // Recarga la lista para mostrar el alumno nuevo
    await loadStudents();
  } catch (error) {
    setStatus(`No se pudo guardar el alumno: ${error.message}`, "error");
  }
});

// Botón "Recargar datos" en la cabecera
reloadBtn.addEventListener("click", loadStudents);

// Carga inicial al abrir la página
loadStudents();
