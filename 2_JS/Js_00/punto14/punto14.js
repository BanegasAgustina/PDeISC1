console.log("Script punto14.js cargado correctamente");

// BOTONES MOSTRAR
const btnMostrarLetras  = document.getElementById("btnMostrarLetras");
const btnMostrarNumeros = document.getElementById("btnMostrarNumeros");
const btnMostrarTexto   = document.getElementById("btnMostrarTexto");

// BOTONES ACCION
const btnInvertirLetras  = document.getElementById("btnInvertirLetras");
const btnInvertirNumeros = document.getElementById("btnInvertirNumeros");
const btnRevertirTexto   = document.getElementById("btnRevertirTexto");

// EVENTOS MOSTRAR
btnMostrarLetras.addEventListener("click", mostrarLetras);
btnMostrarNumeros.addEventListener("click", mostrarNumeros);
btnMostrarTexto.addEventListener("click", mostrarTexto);

// EVENTOS ACCION
btnInvertirLetras.addEventListener("click", invertirLetras);
btnInvertirNumeros.addEventListener("click", invertirNumeros);
btnRevertirTexto.addEventListener("click", revertirTexto);


// 1. Invertir un array de letras
const letras = ["a", "b", "c", "d", "e", "f", "g"];

function mostrarLetras() {
  mostrar("Array de letras (original):", letras);
}

function invertirLetras() {
  const invertido = [...letras].reverse();
  mostrarInfo(
    "Invirtiendo array de letras:", letras,
    `Resultado: [${invertido.join(", ")}]`
  );
}


// 2. Invertir el orden de un array de números
const numeros = [10, 20, 30, 40, 50, 60, 70];

function mostrarNumeros() {
  mostrar("Array de números (original):", numeros);
}

function invertirNumeros() {
  const invertido = [...numeros].reverse();
  mostrarInfo(
    "Invirtiendo array de números:", numeros,
    `Resultado: [${invertido.join(", ")}]`
  );
}


// 3. Convertir un string en array y revertir el texto
const texto = "Hola Mundo";

function mostrarTexto() {
  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  // split("") convierte cada carácter en un elemento del array
  const caracteres = texto.split("");

  const liItems = caracteres.map((char, i) =>
    `<li><span class="text-warning">[${i}]</span> "${char === " " ? "espacio" : char}"</li>`
  ).join("");

  resDiv.innerHTML = `
    <strong>Texto original: "<span class="text-info">${texto}</span>"</strong>
    <p class="mt-2 mb-1">Convertido a array con split(""):</p>
    <ul class="mb-0">${liItems}</ul>
  `;
  console.log("Texto original:", texto);
  console.log("Convertido a array:", caracteres);
}

function revertirTexto() {
  // split("") → reverse() → join("") = texto al revés
  const caracteres  = texto.split("");
  const invertido   = [...caracteres].reverse();
  const textoFinal  = invertido.join("");

  const resDiv = document.getElementById("resultado");
  resDiv.classList.remove("d-none");

  const liOriginal = caracteres.map((char, i) =>
    `<li><span class="text-warning">[${i}]</span> "${char === " " ? "espacio" : char}"</li>`
  ).join("");

  const liInvertido = invertido.map((char, i) =>
    `<li><span class="text-warning">[${i}]</span> "${char === " " ? "espacio" : char}"</li>`
  ).join("");

  resDiv.innerHTML = `
    <strong>Revirtiendo el texto "<span class="text-info">${texto}</span>":</strong>

    <div class="row mt-2">
      <div class="col-6">
        <p class="mb-1">split("") — array original:</p>
        <ul class="mb-0">${liOriginal}</ul>
      </div>
      <div class="col-6">
        <p class="mb-1">reverse() — array invertido:</p>
        <ul class="mb-0">${liInvertido}</ul>
      </div>
    </div>

    <p class="mb-0 mt-3 fs-5">join("") → "<span class="text-success">${textoFinal}</span>"</p>
  `;
  console.log("Texto original:", texto);
  console.log("Array original:", caracteres);
  console.log("Array invertido:", invertido);
  console.log("Texto final:", textoFinal);
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