console.log("Script punto7.js cargado correctamente");

// BOTONES MOSTRAR
const btnMostrarAnimales = document.getElementById("btnMostrarAnimales");
const btnMostrarNumeros  = document.getElementById("btnMostrarNumeros");
const btnMostrarCiudades = document.getElementById("btnMostrarCiudades");

// BOTONES ACCION
const btnBuscarPerro  = document.getElementById("btnBuscarPerro");
const btnBuscar50     = document.getElementById("btnBuscar50");
const btnBuscarMadrid = document.getElementById("btnBuscarMadrid");

// EVENTOS MOSTRAR
btnMostrarAnimales.addEventListener("click", mostrarAnimales);
btnMostrarNumeros.addEventListener("click", mostrarNumeros);
btnMostrarCiudades.addEventListener("click", mostrarCiudades);

// EVENTOS ACCION
btnBuscarPerro.addEventListener("click", buscarPerro);
btnBuscar50.addEventListener("click", buscar50);
btnBuscarMadrid.addEventListener("click", buscarMadrid);

// 1. Encontrar la posición de "perro"
const animales = ["gato", "conejo", "perro", "loro", "tortuga"];

function mostrarAnimales() {
  mostrar("Array de animales:", animales);
}

function buscarPerro() {
  const indice = animales.indexOf("perro");
  if (indice !== -1) {
    mostrarInfo(
      `Buscando "perro" en el array:`, animales,
      `"perro" encontrado en la posición: ${indice}`
    );
  } else {
    mostrarInfo(
      `Buscando "perro" en el array:`, animales,
      `"perro" no está en el array.`
    );
  }
}

// 2. Verificar si el número 50 está y en qué posición
const numeros = [10, 30, 50, 70, 90];

function mostrarNumeros() {
  mostrar("Array de números:", numeros);
}

function buscar50() {
  const indice = numeros.indexOf(50);
  if (indice !== -1) {
    mostrarInfo(
      `Buscando el número 50 en el array:`, numeros,
      `El número 50 está en la posición: ${indice}`
    );
  } else {
    mostrarInfo(
      `Buscando el número 50 en el array:`, numeros,
      `El número 50 no está en el array.`
    );
  }
}

// 3. Buscar "Madrid" en array de ciudades
const ciudades = ["Buenos Aires", "Barcelona", "Mar del Plata", "Bogotá", "Miami"];

function mostrarCiudades() {
  mostrar("Array de ciudades:", ciudades);
}

function buscarMadrid() {
  const indice = ciudades.indexOf("Madrid");
  if (indice !== -1) {
    mostrarInfo(
      `Buscando "Madrid" en el array:`, ciudades,
      `"Madrid" encontrada en la posición: ${indice}`
    );
  } else {
    mostrarInfo(
      `Buscando "Madrid" en el array:`, ciudades,
      `"Madrid" no está en la lista de ciudades.`
    );
  }
}

// MOSTRAR LISTA 
function mostrar(mensaje, data) {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liItems = data.map((item, i) => `<li><span class="text-warning">[${i}]</span> ${item}</li>`).join("");
  resDiv.innerHTML = `<strong>${mensaje}</strong><ul class="mb-0 mt-2">${liItems}</ul>`;
  console.log(mensaje, data);
}

// MOSTRAR LISTA + MENSAJE DE RESULTADO
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