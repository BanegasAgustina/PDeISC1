console.log("Script punto12.js cargado correctamente");

// BOTONES MOSTRAR
const btnMostrarSuma      = document.getElementById("btnMostrarSuma");
const btnMostrarMulti     = document.getElementById("btnMostrarMulti");
const btnMostrarProductos = document.getElementById("btnMostrarProductos");

// BOTONES ACCION
const btnSumar        = document.getElementById("btnSumar");
const btnMultiplicar  = document.getElementById("btnMultiplicar");
const btnTotalPrecios = document.getElementById("btnTotalPrecios");

// EVENTOS MOSTRAR
btnMostrarSuma.addEventListener("click", mostrarNumerosSum);
btnMostrarMulti.addEventListener("click", mostrarNumerosMulti);
btnMostrarProductos.addEventListener("click", mostrarProductos);

// EVENTOS ACCION
btnSumar.addEventListener("click", sumarTodos);
btnMultiplicar.addEventListener("click", multiplicarTodos);
btnTotalPrecios.addEventListener("click", totalPrecios);


// 1. Sumar todos los elementos de un array
const numerosSum = [4, 8, 15, 16, 23, 42];

function mostrarNumerosSum() {
  mostrar("Array de números (suma):", numerosSum);
}

function sumarTodos() {
  const resultado = numerosSum.reduce((acumulador, numero) => acumulador + numero, 0);
  mostrarInfo(
    "Sumando todos los elementos:", numerosSum,
    `Resultado: ${resultado}`
  );
}


// 2. Multiplicar todos los elementos de un array de enteros
const numerosMulti = [1, 2, 3, 4, 5];

function mostrarNumerosMulti() {
  mostrar("Array de números (multiplicar):", numerosMulti);
}

function multiplicarTodos() {
  const resultado = numerosMulti.reduce((acumulador, numero) => acumulador * numero, 1);
  mostrarInfo(
    "Multiplicando todos los elementos:", numerosMulti,
    `Resultado: ${resultado}`
  );
}


// 3. Obtener el total de precios de un array de objetos
const productos = [
  { nombre: "Remera",   precio: 3500  },
  { nombre: "Zapatillas", precio: 28000 },
  { nombre: "Gorra",    precio: 1800  },
  { nombre: "Campera",  precio: 15000 },
  { nombre: "Medias",   precio: 900   },
];

function mostrarProductos() {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liItems = productos.map((p, i) =>
    `<li>
      <span class="text-warning">[${i}]</span>
      <strong>${p.nombre}</strong> —
      <span class="text-success">$${p.precio.toLocaleString("es-AR")}</span>
    </li>`
  ).join("");

  resDiv.innerHTML = `<strong>Array de productos:</strong><ul class="mb-0 mt-2">${liItems}</ul>`;
  console.log("Array de productos:", productos);
}

function totalPrecios() {
  const total = productos.reduce((acumulador, producto) => acumulador + producto.precio, 0);

  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liItems = productos.map((p, i) =>
    `<li>
      <span class="text-warning">[${i}]</span>
      <strong>${p.nombre}</strong> —
      <span class="text-success">$${p.precio.toLocaleString("es-AR")}</span>
    </li>`
  ).join("");

  resDiv.innerHTML = `
    <strong>Calculando total de precios:</strong>
    <ul class="mt-2 mb-3">${liItems}</ul>
    <p class="mb-0 fs-5">Total: <span class="text-success">$${total.toLocaleString("es-AR")}</span></p>
  `;
  console.log("Total de precios:", total);
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