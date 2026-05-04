console.log("Script punto11.js cargado correctamente");

// BOTONES MOSTRAR
const btnMostrarNumeros  = document.getElementById("btnMostrarNumeros");
const btnMostrarPalabras = document.getElementById("btnMostrarPalabras");
const btnMostrarUsuarios = document.getElementById("btnMostrarUsuarios");

// BOTONES ACCION
const btnFiltrarMayores10      = document.getElementById("btnFiltrarMayores10");
const btnFiltrarPalabrasLargas = document.getElementById("btnFiltrarPalabrasLargas");
const btnFiltrarActivos        = document.getElementById("btnFiltrarActivos");

// EVENTOS MOSTRAR
btnMostrarNumeros.addEventListener("click", mostrarNumeros);
btnMostrarPalabras.addEventListener("click", mostrarPalabras);
btnMostrarUsuarios.addEventListener("click", mostrarUsuarios);

// EVENTOS ACCION
btnFiltrarMayores10.addEventListener("click", filtrarMayores10);
btnFiltrarPalabrasLargas.addEventListener("click", filtrarPalabrasLargas);
btnFiltrarActivos.addEventListener("click", filtrarActivos);


// 1. Filtrar números mayores a 10
const numeros = [3, 15, 7, 42, 10, 28, 1, 19];

function mostrarNumeros() {
  mostrar("Array de números:", numeros);
}

function filtrarMayores10() {
  const resultado = numeros.filter(n => n > 10);
  mostrarInfo(
    "Filtrando números mayores a 10:", numeros,
    `Resultado: [${resultado.join(", ")}]`
  );
}


// 2. Filtrar palabras con más de 5 letras
const palabras = ["sol", "montaña", "río", "estrella", "mar", "universo", "flor", "cielo"];

function mostrarPalabras() {
  mostrar("Array de palabras:", palabras);
}

function filtrarPalabrasLargas() {
  const resultado = palabras.filter(p => p.length > 5);
  mostrarInfo(
    "Filtrando palabras con más de 5 letras:", palabras,
    `Resultado: [${resultado.join(", ")}]`
  );
}


// 3. Filtrar usuarios activos de un array de objetos
const usuarios = [
  { nombre: "Ana",    activo: true  },
  { nombre: "Carlos", activo: false },
  { nombre: "Lucía",  activo: true  },
  { nombre: "Marcos", activo: false },
  { nombre: "Sofía",  activo: true  },
];

function mostrarUsuarios() {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liItems = usuarios.map((u, i) =>
    `<li>
      <span class="text-warning">[${i}]</span>
      <strong>${u.nombre}</strong> —
      <span class="${u.activo ? "text-success" : "text-danger"}">
        ${u.activo ? "activo" : "inactivo"}
      </span>
    </li>`
  ).join("");

  resDiv.innerHTML = `<strong>Array de usuarios:</strong><ul class="mb-0 mt-2">${liItems}</ul>`;
  console.log("Array de usuarios:", usuarios);
}

function filtrarActivos() {
  const resultado = usuarios.filter(u => u.activo);
  const nombresActivos = resultado.map(u => u.nombre);

  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liTodos = usuarios.map((u, i) =>
    `<li>
      <span class="text-warning">[${i}]</span>
      <strong>${u.nombre}</strong> —
      <span class="${u.activo ? "text-success" : "text-danger"}">
        ${u.activo ? "activo" : "inactivo"}
      </span>
    </li>`
  ).join("");

  resDiv.innerHTML = `
    <strong>Filtrando usuarios activos:</strong>
    <ul class="mt-2 mb-3">${liTodos}</ul>
    <p class="mb-0 fs-5">Resultado: [${nombresActivos.join(", ")}]</p>
  `;
  console.log("Usuarios activos:", resultado);
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