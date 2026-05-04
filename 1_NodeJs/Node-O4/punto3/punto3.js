console.log("Script punto3.js cargado correctamente");

// BOTONES MOSTRAR
const btnMostrarColores = document.getElementById("btnMostrarColores");
const btnMostrarTareas = document.getElementById("btnMostrarTareas");
const btnMostrarUsuarios = document.getElementById("btnMostrarUsuarios");

// BOTONES AGREGAR
const btnColores = document.getElementById("btnColores");
const btnTarea = document.getElementById("btnTarea");
const btnUsuario = document.getElementById("btnUsuario");

// EVENTOS MOSTRAR
btnMostrarColores.addEventListener("click", mostrarColores);
btnMostrarTareas.addEventListener("click", mostrarTareas);
btnMostrarUsuarios.addEventListener("click", mostrarUsuarios);

// EVENTOS AGREGAR
btnColores.addEventListener("click", agregarColores);
btnTarea.addEventListener("click", agregarTarea);
btnUsuario.addEventListener("click", agregarUsuario);

// 1. Array vacío - agregar tres colores al principio con unshift()
const colores = [];

function mostrarColores() {
  mostrar("Lista de colores:", colores);
}

function agregarColores() {
  colores.unshift("Rojo");
  colores.unshift("Violeta");
  colores.unshift("Azul");
  mostrar("Colores agregados al principio:", colores);
}

// 2. Array de tareas - agregar tarea urgente al principio
const tareas = ["Estudiar", "Hacer ejercicio", "Leer", "Cocinar"];

function mostrarTareas() {
  mostrar("Lista de tareas:", tareas);
}

function agregarTarea() {
  const inputField = document.getElementById("inputTarea");
  const nuevaTarea = inputField.value.trim();

  if (nuevaTarea === "") {
    alert("Por favor, ingresa el nombre de la tarea urgente.");
    return;
  }

  tareas.unshift("📍" + nuevaTarea);
  mostrar("Tarea urgente agregada al principio:", tareas);
  inputField.value = "";
}

// 3. Array de usuarios conectados - insertar nuevo usuario al principio
const usuarios = ["Anto", "Tomi", "Trofa"];

function mostrarUsuarios() {
  mostrar("Usuarios conectados:", usuarios);
}

function agregarUsuario() {
  const inputField = document.getElementById("inputUsuario");
  const nuevoUsuario = inputField.value.trim();

  if (nuevoUsuario === "") {
    alert("Por favor, ingresa el nombre del usuario.");
    return;
  }

  usuarios.unshift(nuevoUsuario);
  mostrar(`"${nuevoUsuario}" se conectó. Usuarios activos:`, usuarios);
  inputField.value = "";
}

// MOSTRAR RESULTADO EN EL HTML
function mostrar(mensaje, data) {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const items = Array.isArray(data) ? data : [data];

  if (items.length === 0) {
    resDiv.innerHTML = `<strong>${mensaje}</strong><p class="mb-0 mt-2 text-warning">[ array vacío ]</p>`;
    return;
  }

  const liItems = items.map((item) => `<li>${item}</li>`).join("");
  resDiv.innerHTML = `<strong>${mensaje}</strong><ul class="mb-0 mt-2">${liItems}</ul>`;
  console.log(mensaje, data);
}
