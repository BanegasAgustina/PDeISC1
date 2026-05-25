console.log("Script punto13.js cargado correctamente");

// BOTONES MOSTRAR
const btnMostrarNumeros  = document.getElementById("btnMostrarNumeros");
const btnMostrarPalabras = document.getElementById("btnMostrarPalabras");
const btnMostrarPersonas = document.getElementById("btnMostrarPersonas");

// BOTONES ACCION
const btnOrdenarNumeros  = document.getElementById("btnOrdenarNumeros");
const btnOrdenarPalabras = document.getElementById("btnOrdenarPalabras");
const btnOrdenarEdad     = document.getElementById("btnOrdenarEdad");

// EVENTOS MOSTRAR
btnMostrarNumeros.addEventListener("click", mostrarNumeros);
btnMostrarPalabras.addEventListener("click", mostrarPalabras);
btnMostrarPersonas.addEventListener("click", mostrarPersonas);

// EVENTOS ACCION
btnOrdenarNumeros.addEventListener("click", ordenarNumeros);
btnOrdenarPalabras.addEventListener("click", ordenarPalabras);
btnOrdenarEdad.addEventListener("click", ordenarPorEdad);


// 1. Ordenar un array de números de menor a mayor
const numeros = [34, 7, 92, 15, 3, 68, 41, 26];

function mostrarNumeros() {
  mostrar("Array de números (sin ordenar):", numeros);
}

function ordenarNumeros() {
  // Usamos [...numeros] para no modificar el array original
  const ordenado = [...numeros].sort((a, b) => a - b);
  mostrarInfo(
    "Ordenando números de menor a mayor:", numeros,
    `Resultado: [${ordenado.join(", ")}]`
  );
}


// 2. Ordenar un array de palabras alfabéticamente
const palabras = ["Zapato", "Manzana", "Banana", "Elefante", "Árbol", "Casa", "Delfín"];

function mostrarPalabras() {
  mostrar("Array de palabras (sin ordenar):", palabras);
}

function ordenarPalabras() {
  // localeCompare respeta el español (tildes, ñ, etc.)
  const ordenado = [...palabras].sort((a, b) => a.localeCompare(b, "es"));
  mostrarInfo(
    "Ordenando palabras alfabéticamente:", palabras,
    `Resultado: [${ordenado.join(", ")}]`
  );
}


// 3. Ordenar un array de objetos {nombre, edad} por edad
const personas = [
  { nombre: "Lucía",   edad: 34 },
  { nombre: "Marcos",  edad: 19 },
  { nombre: "Sofía",   edad: 27 },
  { nombre: "Carlos",  edad: 45 },
  { nombre: "Valentina", edad: 22 },
];

function mostrarPersonas() {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liItems = personas.map((p, i) =>
    `<li>
      <span class="text-warning">[${i}]</span>
      <strong>${p.nombre}</strong> —
      <span class="text-info">${p.edad} años</span>
    </li>`
  ).join("");

  resDiv.innerHTML = `<strong>Array de personas (sin ordenar):</strong><ul class="mb-0 mt-2">${liItems}</ul>`;
  console.log("Array de personas:", personas);
}

function ordenarPorEdad() {
  const ordenado = [...personas].sort((a, b) => a.edad - b.edad);

  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liOriginal = personas.map((p, i) =>
    `<li>
      <span class="text-warning">[${i}]</span>
      <strong>${p.nombre}</strong> —
      <span class="text-info">${p.edad} años</span>
    </li>`
  ).join("");

  const liOrdenado = ordenado.map((p, i) =>
    `<li>
      <span class="text-warning">[${i}]</span>
      <strong>${p.nombre}</strong> —
      <span class="text-info">${p.edad} años</span>
    </li>`
  ).join("");

  resDiv.innerHTML = `
    <strong>Ordenando personas por edad:</strong>
    <ul class="mt-2 mb-3">${liOriginal}</ul>
    <p class="mb-1 fs-5">Resultado ordenado:</p>
    <ul class="mb-0">${liOrdenado}</ul>
  `;
  console.log("Personas ordenadas por edad:", ordenado);
}


// MOSTRAR LISTA SIMPLE
function mostrar(mensaje, data) {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liItems = data.map((item, i) =>
    `<li><span class="text-warning">[${i}]</span> ${item}</li>`
  ).join("");

  resDiv.innerHTML = `<strong>${mensaje}</strong><ul class="mb-0 mt-2">${liItems}</ul>`;
  console.log(mensaje, data);
}

// MOSTRAR LISTA + MENSAJE DE RESULTADO
function mostrarInfo(mensaje, data, resultado) {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liItems = data.map((item, i) =>
    `<li><span class="text-warning">[${i}]</span> ${item}</li>`
  ).join("");

  resDiv.innerHTML = `
    <strong>${mensaje}</strong>
    <ul class="mt-2 mb-3">${liItems}</ul>
    <p class="mb-0 fs-5">${resultado}</p>
  `;
  console.log(mensaje, data, resultado);
}