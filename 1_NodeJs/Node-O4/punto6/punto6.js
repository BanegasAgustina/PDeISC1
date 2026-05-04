console.log("Script punto6.js cargado correctamente");

// BOTONES MOSTRAR
const btnMostrarNumeros   = document.getElementById("btnMostrarNumeros");
const btnMostrarPeliculas = document.getElementById("btnMostrarPeliculas");
const btnMostrarFrutas    = document.getElementById("btnMostrarFrutas");

// BOTONES ACCION
const btnPrimeros3        = document.getElementById("btnPrimeros3");
const btnParcialPeliculas = document.getElementById("btnParcialPeliculas");
const btnUltimos3         = document.getElementById("btnUltimos3");

// EVENTOS MOSTRAR
btnMostrarNumeros.addEventListener("click", mostrarNumeros);
btnMostrarPeliculas.addEventListener("click", mostrarPeliculas);
btnMostrarFrutas.addEventListener("click", mostrarFrutas);

// EVENTOS ACCION
btnPrimeros3.addEventListener("click", copiarPrimeros3);
btnParcialPeliculas.addEventListener("click", copiarParcialPeliculas);
btnUltimos3.addEventListener("click", copiarUltimos3);

// 1. Copiar los primeros 3 elementos de un array de números
const numeros = [10, 20, 30, 40, 50, 60, 70];

function mostrarNumeros() {
  mostrar("Array original de números:", numeros);
}

function copiarPrimeros3() {
  const copia = numeros.slice(0, 3);
  mostrar2(
    `slice(0, 3) — Primeros 3 elementos copiados:`, copia,
    `Array original sin modificar:`, numeros
  );
}

// 2. Copia parcial desde posición 2 hasta la 4
const peliculas = [
  "El Padrino",
  "Titanic",
  "Inception",
  "Interstellar",
  "Matrix",
  "Gladiador"
];

function mostrarPeliculas() {
  mostrar("Array original de películas:", peliculas);
}

function copiarParcialPeliculas() {
  const copia = peliculas.slice(2, 5);
  mostrar2(
    `slice(2, 5) — Copia parcial desde pos. 2 hasta 4:`, copia,
    `Array original sin modificar:`, peliculas
  );
}

// 3. Array nuevo con los últimos 3 elementos
const frutas = ["Manzana", "Banana", "Naranja", "Kiwi", "Frutilla", "Sandía"];

function mostrarFrutas() {
  mostrar("Array original de frutas:", frutas);
}

function copiarUltimos3() {
  const copia = frutas.slice(-3);
  mostrar2(
    `slice(-3) — Últimos 3 elementos copiados:`, copia,
    `Array original sin modificar:`, frutas
  );
}

// MOSTRAR UN SOLO RESULTADO
function mostrar(mensaje, data) {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const items = Array.isArray(data) ? data : [data];
  const liItems = items.map(item => `<li>${item}</li>`).join("");
  resDiv.innerHTML = `<strong>${mensaje}</strong><ul class="mb-0 mt-2">${liItems}</ul>`;
  console.log(mensaje, data);
}

// MOSTRAR DOS LISTAS: copia + original
function mostrar2(msg1, data1, msg2, data2) {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const li1 = data1.map(item => `<li>${item}</li>`).join("");
  const li2 = data2.map(item => `<li class="text-secondary">${item}</li>`).join("");

  resDiv.innerHTML = `
    <strong class="text-success">${msg1}</strong>
    <ul class="mb-3 mt-2">${li1}</ul>
    <strong class="text-warning">${msg2}</strong>
    <ul class="mb-0 mt-2">${li2}</ul>
  `;
  console.log(msg1, data1);
  console.log(msg2, data2);
}