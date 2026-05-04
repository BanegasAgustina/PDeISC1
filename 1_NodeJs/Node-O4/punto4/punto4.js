console.log("Script punto4.js cargado correctamente");

// BOTONES MOSTRAR
const btnMostrarNumeros  = document.getElementById("btnMostrarNumeros");
const btnMostrarMensajes = document.getElementById("btnMostrarMensajes");
const btnMostrarCola     = document.getElementById("btnMostrarCola");

// BOTONES ELIMINAR
const btnNumeros  = document.getElementById("btnNumeros");
const btnMensajes = document.getElementById("btnMensajes");
const btnAtender  = document.getElementById("btnAtender");

// EVENTOS MOSTRAR
btnMostrarNumeros.addEventListener("click", mostrarNumeros);
btnMostrarMensajes.addEventListener("click", mostrarMensajes);
btnMostrarCola.addEventListener("click", mostrarCola);

// EVENTOS ELIMINAR
btnNumeros.addEventListener("click", quitarPrimerNumero);
btnMensajes.addEventListener("click", eliminarPrimerMensaje);
btnAtender.addEventListener("click", atenderCliente);

// 1. Quitar el primer número de un array de enteros
const numeros = [10, 20, 30, 40, 50];

function mostrarNumeros() {
  mostrar("Lista de números:", numeros);
}

function quitarPrimerNumero() {
  if (numeros.length === 0) {
    mostrar("No quedan números en el array.", []);
    return;
  }
  const eliminado = numeros.shift();
  mostrar(`Número eliminado: "${eliminado}". Array actual:`, numeros);
}

// 2. Eliminar el primer mensaje de un array de mensajes de chat
const mensajes = [
  "Hola, ¿cómo estás?",
  "¿Cuándo nos juntamos?",
  "El jueves",
  "Genial, nos vemos entonces.",
  "Hasta luego!"
];

function mostrarMensajes() {
  mostrar("Mensajes de chat:", mensajes);
}

function eliminarPrimerMensaje() {
  if (mensajes.length === 0) {
    mostrar("No quedan mensajes.", []);
    return;
  }
  const eliminado = mensajes.shift();
  mostrar(`Mensaje eliminado: "${eliminado}". Mensajes restantes:`, mensajes);
}

// 3. Simular una cola de atención al cliente con shift()
const cola = [
  "Cliente 1 - Juan",
  "Cliente 2 - Trofa",
  "Cliente 3 - Anto",
  "Cliente 4 - Sofi",
  "Cliente 5 - Lucas"
];

function mostrarCola() {
  mostrar("Cola de atención:", cola);
}

function atenderCliente() {
  if (cola.length === 0) {
    mostrar("No hay más clientes en la cola.", []);
    return;
  }
  const atendido = cola.shift();
  mostrar(`Atendiendo a: "${atendido}". Clientes en espera:`, cola);
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