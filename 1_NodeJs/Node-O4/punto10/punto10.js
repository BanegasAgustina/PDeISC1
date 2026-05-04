console.log("Script punto10.js cargado correctamente");

// BOTONES MOSTRAR
const btnMostrarNumeros = document.getElementById("btnMostrarNumeros");
const btnMostrarNombres = document.getElementById("btnMostrarNombres");
const btnMostrarPrecios = document.getElementById("btnMostrarPrecios");

// BOTONES ACCION
const btnMultiplicar = document.getElementById("btnMultiplicar");
const btnMayusculas  = document.getElementById("btnMayusculas");
const btnIVA         = document.getElementById("btnIVA");

// EVENTOS MOSTRAR
btnMostrarNumeros.addEventListener("click", mostrarNumeros);
btnMostrarNombres.addEventListener("click", mostrarNombres);
btnMostrarPrecios.addEventListener("click", mostrarPrecios);

// EVENTOS ACCION
btnMultiplicar.addEventListener("click", multiplicarPor3);
btnMayusculas.addEventListener("click", convertirMayusculas);
btnIVA.addEventListener("click", aplicarIVA);

// 1. Nuevo array con cada número multiplicado por 3
const numeros = [2, 5, 8, 10, 15];

function mostrarNumeros() {
  mostrar("Array original de números:", numeros.map(n => `${n}`));
}

function multiplicarPor3() {
  const resultado = numeros.map(n => n * 3);
  mostrar2(
    "Array original:", numeros.map(n => `${n}`),
    "Nuevo array × 3 con map():", resultado.map(n => `${n}`)
  );
}

// 2. Convertir array de nombres a mayúsculas
const nombres = ["ana", "carlos", "elena", "mario", "sofía"];

function mostrarNombres() {
  mostrar("Array original de nombres:", nombres);
}

function convertirMayusculas() {
  const resultado = nombres.map(nombre => nombre.toUpperCase());
  mostrar2(
    "Array original:", nombres,
    "Nuevo array en mayúsculas con map():", resultado
  );
}

// 3. Aplicar IVA del 21% a cada precio
const precios = [100, 250, 399, 80, 1200];

function mostrarPrecios() {
  mostrar("Array original de precios:", precios.map(p => `$${p}`));
}

function aplicarIVA() {
  const resultado = precios.map(precio => parseFloat((precio * 1.21).toFixed(2)));
  mostrar2(
    "Precios sin IVA:", precios.map(p => `$${p}`),
    "Nuevo array con IVA 21% con map():", resultado.map(p => `$${p}`)
  );
}

// MOSTRAR UNA SOLA LISTA
function mostrar(mensaje, data) {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liItems = data.map(item => `<li>${item}</li>`).join("");
  resDiv.innerHTML = `<strong>${mensaje}</strong><ul class="mb-0 mt-2">${liItems}</ul>`;
  console.log(mensaje, data);
}

// MOSTRAR DOS LISTAS: original + nuevo array
function mostrar2(msg1, data1, msg2, data2) {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const li1 = data1.map(item => `<li class="text-secondary">${item}</li>`).join("");
  const li2 = data2.map(item => `<li>${item}</li>`).join("");

  resDiv.innerHTML = `
    <strong class="text-warning">${msg1}</strong>
    <ul class="mt-2 mb-3">${li1}</ul>
    <strong class="text-success">${msg2}</strong>
    <ul class="mb-0 mt-2">${li2}</ul>
  `;
  console.log(msg1, data1);
  console.log(msg2, data2);
}