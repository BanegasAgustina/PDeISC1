// Referencias a los elementos que se modifican en la pagina.
let studentsList = document.getElementById("studentsList");
let statusBox = document.getElementById("status");
let reloadBtn = document.getElementById("reloadBtn");
let studentForm = document.getElementById("studentForm");
let studentNameInput = document.getElementById("studentName");
let studentEmailInput = document.getElementById("studentEmail");

// Expresion regular para validar nombres (solo letras y espacios).
let namePattern = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
// Expresion regular para validar formato de email.
let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valida que el nombre tenga letras y no use numeros ni caracteres especiales.
function validateStudentName() {
  let name = studentNameInput.value.trim();
  let isValid = true;
  let errorMsg = "";

  if (name === "") {
    isValid = false;
    errorMsg = "El nombre es obligatorio.";
  } else if (!namePattern.test(name)) {
    isValid = false;
    errorMsg = "El nombre solo puede contener letras y espacios.";
  }

  studentNameInput.classList.toggle("is-invalid", !isValid);
  studentNameInput.classList.toggle("is-valid", isValid);
  
  // Actualizar el mensaje de error
  let nameErrorDiv = studentNameInput.nextElementSibling;
  if (nameErrorDiv && nameErrorDiv.classList.contains("invalid-feedback")) {
    nameErrorDiv.textContent = errorMsg;
  }
  
  return isValid;
}

// Valida que el email tenga un formato válido.
function validateStudentEmail() {
  let email = studentEmailInput.value.trim();
  let isValid = true;
  let errorMsg = "";

  if (email === "") {
    isValid = false;
    errorMsg = "El email es obligatorio.";
  } else if (!emailPattern.test(email)) {
    isValid = false;
    errorMsg = "El email debe tener un formato válido (ej: usuario@email.com).";
  }

  studentEmailInput.classList.toggle("is-invalid", !isValid);
  studentEmailInput.classList.toggle("is-valid", isValid);
  
  // Actualizar el mensaje de error
  let emailErrorDiv = studentEmailInput.nextElementSibling;
  if (emailErrorDiv && emailErrorDiv.classList.contains("invalid-feedback")) {
    emailErrorDiv.textContent = errorMsg;
  }
  
  return isValid;
}

// Dibuja los alumnos recibidos desde la API local.
function renderStudents(students) {
  statusBox.className = "alert alert-success status-box";
  statusBox.textContent = `${students.length} alumnos cargados desde /api/alumnos.`;
  studentsList.innerHTML = students.map((student) => `
    <article class="col-sm-6 col-lg-3">
      <div class="user-card">
        <span class="badge text-bg-success align-self-start">Alumno ${student.id}</span>
        <h2 class="h5 mb-0">${student.nombre}</h2>
        <a class="email-link" href="mailto:${student.email}">${student.email}</a>
      </div>
    </article>
  `).join("");
}

// Pide los datos al endpoint local /api/alumnos.
async function loadStudents() {
  statusBox.className = "alert alert-info status-box";
  statusBox.textContent = "Cargando alumnos...";
  studentsList.innerHTML = "";

  try {
    let response = await fetch("/api/alumnos");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    let students = await response.json();
    renderStudents(students);
  } catch (error) {
    statusBox.className = "alert alert-danger status-box";
    statusBox.textContent = `No se pudieron cargar los alumnos: ${error.message}`;
  }
}

// Envia un alumno nuevo al servidor usando POST.
async function createStudent(payload) {
  let response = await fetch("/api/alumnos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Valida en vivo los campos del formulario.
studentNameInput.addEventListener("input", validateStudentName);
studentNameInput.addEventListener("blur", validateStudentName);
studentEmailInput.addEventListener("input", validateStudentEmail);
studentEmailInput.addEventListener("blur", validateStudentEmail);

// Controla el envio del formulario y llama al POST.
studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateStudentName() || !validateStudentEmail()) {
    statusBox.className = "alert alert-danger status-box";
    statusBox.textContent = "Corregí los campos marcados antes de guardar.";
    return;
  }

  try {
    await createStudent({
      nombre: studentNameInput.value.trim(),
      email: studentEmailInput.value.trim()
    });

    studentForm.reset();
    studentNameInput.classList.remove("is-valid", "is-invalid");
    studentEmailInput.classList.remove("is-valid", "is-invalid");
    await loadStudents();
  } catch (error) {
    statusBox.className = "alert alert-danger status-box";
    statusBox.textContent = `No se pudo guardar el alumno: ${error.message}`;
  }
});

// Permite recargar los alumnos con el boton.
reloadBtn.addEventListener("click", loadStudents);

// Carga los datos automaticamente al abrir la pagina.
loadStudents();
