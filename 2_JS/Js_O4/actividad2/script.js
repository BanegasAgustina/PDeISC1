// URL de la API publica indicada en la consigna.
const API_URL = "https://jsonplaceholder.typicode.com/users?authuser=0";

// Referencias al formulario y al contenedor de respuesta.
const form = document.getElementById("userForm");
const responseBox = document.getElementById("responseBox");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");

// Expresion regular para aceptar letras y espacios, pero rechazar numeros, comas y puntos.
const namePattern = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/;

// Metodo por defecto para enviar el formulario.
let selectedMethod = "axios";

// Detecta que boton se presiono antes del submit.
form.addEventListener("click", (event) => {
  if (event.target.matches("button[data-method]")) {
    selectedMethod = event.target.dataset.method;
  }
});

// Valida el campo nombre con JavaScript.
function validateName() {
  const name = nameInput.value.trim();
  const isValid = name !== "" && namePattern.test(name);

  nameInput.classList.toggle("is-invalid", !isValid);
  nameInput.classList.toggle("is-valid", isValid);
  return isValid;
}

// Valida que el email no este vacio y contenga un @.
function validateEmail() {
  const email = emailInput.value.trim();
  const isValid = email !== "" && email.includes("@");

  emailInput.classList.toggle("is-invalid", !isValid);
  emailInput.classList.toggle("is-valid", isValid);
  return isValid;
}

// Ejecuta las validaciones mientras el usuario escribe.
nameInput.addEventListener("input", validateName);
emailInput.addEventListener("input", validateEmail);

// Procesa el envio del formulario sin recargar la pagina.
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Si algun campo no pasa la validacion, se cancela el envio.
  if (!validateName() || !validateEmail()) {
    responseBox.className = "status-box text-danger";
    responseBox.textContent = "Corregi los campos marcados antes de enviar.";
    return;
  }

  // Convierte los campos del formulario en un objeto JavaScript.
  const formData = new FormData(form);
  const payload = {
    name: formData.get("name"),
    email: formData.get("email")
  };

  responseBox.className = "status-box text-warning";
  responseBox.textContent = `Enviando datos con ${selectedMethod}...`;

  try {
    // Elige la funcion de envio segun el boton seleccionado.
    const data = selectedMethod === "fetch"
      ? await postWithFetch(payload)
      : await postWithAxios(payload);

    // JSONPlaceholder responde un ID, que se muestra en pantalla.
    responseBox.className = "status-box";
    responseBox.innerHTML = `
      <p class="mb-2">La API respondio correctamente.</p>
      <p class="display-6 fw-bold mb-0">ID: ${data.id}</p>
    `;
    form.reset();
    nameInput.classList.remove("is-valid", "is-invalid");
    emailInput.classList.remove("is-valid", "is-invalid");
  } catch (error) {
    responseBox.className = "status-box text-danger";
    responseBox.textContent = `Error al enviar: ${error.message}`;
  }
});

// Envia los datos con fetch usando metodo POST.
async function postWithFetch(payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

// Envia los datos con axios.post().
async function postWithAxios(payload) {
  const response = await axios.post(API_URL, payload);
  return response.data;
}
