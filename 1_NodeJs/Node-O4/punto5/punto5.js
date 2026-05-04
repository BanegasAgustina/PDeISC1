console.log("Script punto5.js cargado correctamente");

// BOTONES MOSTRAR
const btnMostrarLetras = document.getElementById("btnMostrarLetras");
const btnMostrarNombres = document.getElementById("btnMostrarNombres");
const btnMostrarProductos = document.getElementById("btnMostrarProductos");

// BOTONES ACCION
const btnEliminarLetras = document.getElementById("btnEliminarLetras");
const btnInsertarNombre = document.getElementById("btnInsertarNombre");
const btnReemplazar = document.getElementById("btnReemplazar");

// EVENTOS MOSTRAR
btnMostrarLetras.addEventListener("click", mostrarLetras);
btnMostrarNombres.addEventListener("click", mostrarNombres);
btnMostrarProductos.addEventListener("click", mostrarProductos);

// EVENTOS ACCION
btnEliminarLetras.addEventListener("click", eliminarLetras);
btnInsertarNombre.addEventListener("click", insertarNombre);
btnReemplazar.addEventListener("click", reemplazarProductos);

// 1. Eliminar 2 elementos desde la posición 1
const letras = ["A", "B", "C", "D", "E", "F"];

function mostrarLetras() {
  mostrar("Lista de letras:", letras);
}

function eliminarLetras() {
  if (letras.length < 2) {
    mostrar("No hay suficientes elementos para eliminar.", letras);
    return;
  }
  const eliminados = letras.splice(1, 2);
  mostrar(
    `Elementos eliminados desde pos. 1: [${eliminados.join(", ")}]. Array actual:`,
    letras,
  );
}

// 2. Insertar nombre en la segunda posición sin eliminar nada
const nombres = ["Anto", "Fran", "Tomi", "Trofa"];

function mostrarNombres() {
  mostrar("Lista de nombres:", nombres);
}

function insertarNombre() {
  const inputField = document.getElementById("inputNombre");
  const nuevoNombre = inputField.value.trim();

  if (nuevoNombre === "") {
    alert("Por favor, ingresa un nombre.");
    return;
  }

  nombres.splice(1, 0, nuevoNombre);
  mostrar(`"${nuevoNombre}" insertado en posición 2. Array actual:`, nombres);
  inputField.value = "";
}

// 3. Reemplazar 2 elementos desde una posición determinada
const productos = ["Compu", "Mouse", "Teclado", "cable", "Auriculares"];

function mostrarProductos() {
  mostrar("Lista de productos:", productos);
}

function reemplazarProductos() {
  const inputField = document.getElementById("inputPosicion");
  const posicion = parseInt(inputField.value);

  if (isNaN(posicion) || posicion < 0 || posicion >= productos.length) {
    alert(`Ingresá una posición válida entre 0 y ${productos.length - 1}.`);
    return;
  }

  if (posicion + 2 > productos.length) {
    alert(`No hay 2 elementos desde la posición ${posicion} para reemplazar.`);
    return;
  }

  const reemplazados = productos.splice(
    posicion,
    2,
    "Producto Nuevo A",
    "Producto Nuevo B",
  );
  mostrar(
    `Reemplazados [${reemplazados.join(", ")}] desde pos. ${posicion}. Array actual:`,
    productos,
  );
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
