console.log("Script punto2.js cargado correctamente");

// BOTONES MOSTRAR
const btnMostrarAnimales = document.getElementById("btnMostrarAnimales");
const btnMostrarCompras = document.getElementById("btnMostrarCompras");
const btnMostrarColores = document.getElementById("btnMostrarColores");

// BOTONES ELIMINAR
const btnAnimales = document.getElementById("btnAnimales");
const btnCompras = document.getElementById("btnCompras");
const btnVaciar = document.getElementById("btnVaciar");

// EVENTOS MOSTRAR
btnMostrarAnimales.addEventListener("click", mostrarAnimales);
btnMostrarCompras.addEventListener("click", mostrarCompras);
btnMostrarColores.addEventListener("click", mostrarColores);

// EVENTOS ELIMINAR
btnAnimales.addEventListener("click", eliminarAnimal);
btnCompras.addEventListener("click", quitarProducto);
btnVaciar.addEventListener("click", vaciarColores);

// 1. Array de animales
const animales = ["Perro", "Gato", "Loro", "Tortuga", "Conejo"];

function mostrarAnimales() {
  mostrar("Lista de animales:", animales);
}

function eliminarAnimal() {
  if (animales.length === 0) {
    mostrar("No quedan animales en el array.", []);
    return;
  }
  const eliminado = animales.pop();
  mostrar(`Animal eliminado: "${eliminado}". Array actual:`, animales);
}

// 2. Lista de compras
const compras = ["Leche", "Pan", "Huevos", "Manteca", "Yerba"];

function mostrarCompras() {
  mostrar("Lista de compras:", compras);
}

function quitarProducto() {
  if (compras.length === 0) {
    mostrar("La lista de compras está vacía.", []);
    return;
  }
  const eliminado = compras.pop();
  mostrar(`Producto eliminado: "${eliminado}". Lista actual:`, compras);
}

// 3. Array de colores - vaciar con while
const colores = ["Rojo", "Verde", "Azul", "Amarillo", "Naranja"];

function mostrarColores() {
  mostrar("Lista de colores:", colores);
}

function vaciarColores() {
  const vaciados = [];
  while (colores.length > 0) {
    vaciados.push(colores.pop());
  }
  mostrar("Array vaciado. Elementos eliminados:", vaciados);
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

  const liItems = items.map(item => `<li>${item}</li>`).join("");
  resDiv.innerHTML = `<strong>${mensaje}</strong><ul class="mb-0 mt-2">${liItems}</ul>`;
  console.log(mensaje, data);
}