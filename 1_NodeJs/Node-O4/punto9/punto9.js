console.log("Script punto9.js cargado correctamente");

// BOTONES MOSTRAR
const btnMostrarNombres  = document.getElementById("btnMostrarNombres");
const btnMostrarNumeros  = document.getElementById("btnMostrarNumeros");
const btnMostrarPersonas = document.getElementById("btnMostrarPersonas");

// BOTONES ACCION
const btnSaludar    = document.getElementById("btnSaludar");
const btnDoble      = document.getElementById("btnDoble");
const btnNombreEdad = document.getElementById("btnNombreEdad");

// EVENTOS MOSTRAR
btnMostrarNombres.addEventListener("click", mostrarNombres);
btnMostrarNumeros.addEventListener("click", mostrarNumeros);
btnMostrarPersonas.addEventListener("click", mostrarPersonas);

// EVENTOS ACCION
btnSaludar.addEventListener("click", saludarTodos);
btnDoble.addEventListener("click", mostrarDobles);
btnNombreEdad.addEventListener("click", mostrarNombreEdad);

// 1. Mostrar saludo para cada nombre
const nombres = ["Ana", "Carlos", "Elena", "Mario", "Sofía"];

function mostrarNombres() {
  mostrar("Array de nombres:", nombres.map(n => n));
}

function saludarTodos() {
  const saludos = [];
  nombres.forEach(nombre => {
    saludos.push(`¡Hola, ${nombre}!`);
  });
  mostrar("Saludos generados con forEach():", saludos);
}

// 2. Imprimir el doble de cada número
const numeros = [3, 7, 12, 25, 40];

function mostrarNumeros() {
  mostrar("Array de números:", numeros.map(n => n));
}

function mostrarDobles() {
  const dobles = [];
  numeros.forEach(num => {
    dobles.push(`${num} × 2 = ${num * 2}`);
  });
  mostrar("Doble de cada número con forEach():", dobles);
}

// 3. Array de objetos {nombre, edad}
const personas = [
  { nombre: "Juan", edad: 28 },
  { nombre: "María", edad: 34 },
  { nombre: "Pedro", edad: 22 },
  { nombre: "Laura", edad: 41 },
  { nombre: "Tomás", edad: 19 }
];

function mostrarPersonas() {
  const items = personas.map(p => `${p.nombre} — edad: ${p.edad}`);
  mostrar("Array de personas:", items);
}

function mostrarNombreEdad() {
  const items = [];
  personas.forEach(persona => {
    items.push(` ${persona.nombre} tiene ${persona.edad} años`);
  });
  mostrar("Nombres y edades con forEach():", items);
}

// MOSTRAR RESULTADO EN EL HTML
function mostrar(mensaje, data) {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liItems = data.map(item => `<li>${item}</li>`).join("");
  resDiv.innerHTML = `<strong>${mensaje}</strong><ul class="mb-0 mt-2">${liItems}</ul>`;
  console.log(mensaje, data);
}