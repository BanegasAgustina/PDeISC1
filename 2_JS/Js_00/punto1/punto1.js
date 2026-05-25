console.log("Script punto1.js cargado correctamente");

// Esperar a que cargue el DOM (seguridad extra)
document.addEventListener("DOMContentLoaded", () => {

  // BOTONES
  const btnFrutas = document.getElementById("btnFrutas");
  const btnAmigos = document.getElementById("btnAmigos");
  const btnNumeros = document.getElementById("btnNumeros");
  const btnMostrarNumeros = document.getElementById("btnMostrarNumeros");

  // ARRAYS
  const frutas = [];
  const amigos = ["Juan", "María"];
  const numeros = [10, 20, 30];

  // EVENTOS
  btnFrutas.addEventListener("click", () => {
    frutas.push("Manzana", "Banana", "Naranja", "Mandarina");
    mostrar("Frutas agregadas:", frutas);
  });

  btnAmigos.addEventListener("click", () => {
    amigos.push("Anto", "Fran", "Tomi");
    mostrar("Lista de amigos actualizada:", amigos);
  });

  btnNumeros.addEventListener("click", () => {
    const inputField = document.getElementById("inputNumero");
    const nuevoNumero = parseInt(inputField.value);

    if (isNaN(nuevoNumero)) {
      alert("Ingresá un número válido");
      return;
    }

    const ultimo = numeros[numeros.length - 1];

    if (nuevoNumero > ultimo) {
      numeros.push(nuevoNumero);
      mostrar("Número agregado:", numeros);
      inputField.value = "";
    } else {
      alert("El número no es mayor que " + ultimo);
      mostrar("Array actual:", numeros);
    }
  });

  btnMostrarNumeros.addEventListener("click", () => {
    mostrar("Lista de números:", numeros);
  });

  // FUNCIÓN MOSTRAR
  function mostrar(mensaje, data) {
    const resDiv = document.getElementById("resultado");

    const items = Array.isArray(data) ? data : [data];
    const liItems = items.map(item => `<li>${item}</li>`).join("");

    resDiv.innerHTML = `
      <strong>${mensaje}</strong>
      <ul class="mb-0 mt-2">${liItems}</ul>
    `;

    console.log(mensaje, data);
  }

});