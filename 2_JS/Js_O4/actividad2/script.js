// URL de la API publica indicada en la consigna.
let API_URL = "https://jsonplaceholder.typicode.com/users";

// Referencias al formulario y al contenedor de respuesta.
let form = document.getElementById("userForm");
let responseBox = document.getElementById("responseBox");
let nameInput = document.getElementById("name");
let emailInput = document.getElementById("email");
let nameError = document.getElementById("nameError");
let emailError = document.getElementById("emailError");

// Expresion regular para aceptar nombres o nombres de usuario (letras, espacios, guiones, guiones bajos, puntos).
let namePattern = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s._-]+$/;
// Expresion regular para validar formato de email.
let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  let name = nameInput.value.trim();
  let isValid = true;
  let errorMsg = "";
// El nombre no puede estar vacio y solo puede contener letras, espacios, guiones, guiones bajos y puntos.
  if (name === "") {
    isValid = false;
    errorMsg = "El nombre es obligatorio.";
  } else if (!namePattern.test(name)) {
    isValid = false;
    errorMsg = "El nombre solo puede contener letras, espacios, guiones, guiones bajos y puntos.";
  }

  nameInput.classList.toggle("is-invalid", !isValid);
  nameInput.classList.toggle("is-valid", isValid);
  if (nameError) nameError.textContent = errorMsg;
  return isValid;
}

// Valida que el email tenga un formato válido.
function validateEmail() {
  let email = emailInput.value.trim();
  let isValid = true;
  let errorMsg = "";

  if (email === "") {
    isValid = false;
    errorMsg = "El email es obligatorio.";
  } else if (!emailPattern.test(email)) {
    isValid = false;
    errorMsg =
      "El email debe tener un formato válido (ej: usuario@dominio.com).";
  }

  emailInput.classList.toggle("is-invalid", !isValid);
  emailInput.classList.toggle("is-valid", isValid);
  if (emailError) emailError.textContent = errorMsg;
  return isValid;
}

// Busca el usuario en la API por nombre/username y email exactos.
async function findUserInAPI(name, email) {
  try {
    let response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    let users = await response.json();

    let foundUser = users.find(
      (user) =>
        (user.name.toLowerCase() === name.toLowerCase() ||
          user.username.toLowerCase() === name.toLowerCase()) &&
        user.email.toLowerCase() === email.toLowerCase(),
    );

    return { found: foundUser !== undefined, user: foundUser };
  } catch (error) {
    return {
      found: false,
      error: `Error al consultar la API: ${error.message}`,
    };
  }
}

// Ejecuta las validaciones mientras el usuario escribe y al perder el foco.
nameInput.addEventListener("input", validateName);
nameInput.addEventListener("blur", validateName);
emailInput.addEventListener("input", validateEmail);
emailInput.addEventListener("blur", validateEmail);

// Procesa el envio del formulario sin recargar la pagina.
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Si algun campo no pasa la validacion, se cancela el envio.
  if (!validateName() || !validateEmail()) {
    responseBox.className = "status-box text-danger";
    responseBox.textContent = "Corregí los campos marcados antes de enviar.";
    return;
  }

  let name = nameInput.value.trim();
  let email = emailInput.value.trim();

  responseBox.className = "status-box text-warning";
  responseBox.textContent = "Buscando usuario en la API...";

  // Busca el usuario en la API antes de enviar.
  let apiResult = await findUserInAPI(name, email);
  if (!apiResult.found) {
    if (apiResult.error) {
      responseBox.className = "status-box text-danger";
      responseBox.textContent = apiResult.error;
    } else {
      responseBox.className = "status-box text-danger";
      responseBox.textContent = "El nombre o email no pertenecen a la API.";
    }
    return;
  }

  // Convierte los campos del formulario en un objeto JavaScript.
  let formData = new FormData(form);
  let payload = {
    name: formData.get("name"),
    email: formData.get("email"),
  };

  responseBox.className = "status-box text-warning";
  responseBox.textContent = `Enviando datos con ${selectedMethod}...`;

  try {
    // Elige la funcion de envio segun el boton seleccionado.
    await (selectedMethod === "fetch"
      ? postWithFetch(payload)
      : postWithAxios(payload));

    // Mostrar el ID real del usuario encontrado, NO el ficticio del POST.
    responseBox.className = "status-box";
    responseBox.innerHTML = `
      <p class="mb-2">Usuario encontrado en la API.</p>
      <p class="display-6 fw-bold mb-0">ID: ${apiResult.user.id}</p>
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
  let response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

// Envia los datos con axios.post().
async function postWithAxios(payload) {
  let response = await axios.post(API_URL, payload);
  return response.data;
}
