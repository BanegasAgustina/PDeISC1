console.log("Script punto8.js cargado correctamente");

// BOTONES MOSTRAR
const btnMostrarUsuarios = document.getElementById("btnMostrarUsuarios");
const btnMostrarColores  = document.getElementById("btnMostrarColores");
const btnMostrarNumeros  = document.getElementById("btnMostrarNumeros");

// BOTONES ACCION
const btnBuscarAdmin   = document.getElementById("btnBuscarAdmin");
const btnBuscarVerde   = document.getElementById("btnBuscarVerde");
const btnAgregarNumero = document.getElementById("btnAgregarNumero");

// EVENTOS MOSTRAR
btnMostrarUsuarios.addEventListener("click", mostrarUsuarios);
btnMostrarColores.addEventListener("click", mostrarColores);
btnMostrarNumeros.addEventListener("click", mostrarNumeros);

// EVENTOS ACCION
btnBuscarAdmin.addEventListener("click", comprobarAdmin);
btnBuscarVerde.addEventListener("click", comprobarVerde);
btnAgregarNumero.addEventListener("click", verificarYAgregar);

// 1. Comprobar si el array contiene "admin"
const usuarios = ["Anto", "Fran", "admin", "Trofa", "Agus"];

function mostrarUsuarios() {
  mostrar("Array de usuarios:", usuarios);
}

function comprobarAdmin() {
  const existe = usuarios.includes("admin");
  mostrarInfo(
    `Comprobando si "admin" está en el array:`, usuarios,
    existe
      ? `"admin" está en el array.`
      : `"admin" no está en el array.`
  );
}

// 2. Indicar si existe "verde" en el array de colores
const colores = ["rojo", "azul", "amarillo", "naranja", "violeta"];

function mostrarColores() {
  mostrar("Array de colores:", colores);
}

function comprobarVerde() {
  const existe = colores.includes("verde");
  mostrarInfo(
    `Comprobando si "verde" está en el array:`, colores,
    existe
      ? `"verde" existe en el array.`
      : `"verde" no existe en el array.`
  );
}

// 3. Verificar si un número está antes de sumarlo
const numeros = [10, 20, 30, 40, 50];

function mostrarNumeros() {
  mostrar("Array de números:", numeros);
}

function verificarYAgregar() {
  const inputField = document.getElementById("inputNumero");
  const numero = parseInt(inputField.value);

  if (isNaN(numero)) {
    alert("Por favor, ingresa un número válido.");
    return;
  }

  const existe = numeros.includes(numero);

  if (existe) {
    mostrarInfo(
      `Verificando si ${numero} está en el array:`, numeros,
      `El número ${numero} ya existe. No se agregó.`
    );
  } else {
    numeros.push(numero);
    mostrarInfo(
      `Verificando si ${numero} está en el array:`, numeros,
      `El número ${numero} no estaba. ¡Agregado al array!`
    );
  }

  inputField.value = "";
}



// MOSTRAR LISTA SIMPLE
function mostrar(mensaje, data) {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liItems = data.map((item, i) => `<li><span class="text-warning">[${i}]</span> ${item}</li>`).join("");
  resDiv.innerHTML = `<strong>${mensaje}</strong><ul class="mb-0 mt-2">${liItems}</ul>`;
  console.log(mensaje, data);
}

// MOSTRAR LISTA + MENSAJE
function mostrarInfo(mensaje, data, resultado) {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liItems = data.map((item, i) => `<li><span class="text-warning">[${i}]</span> ${item}</li>`).join("");
  resDiv.innerHTML = `
    <strong>${mensaje}</strong>
    <ul class="mt-2 mb-3">${liItems}</ul>
    <p class="mb-0 fs-5">${resultado}</p>
  `;
  console.log(mensaje, data, resultado);
}