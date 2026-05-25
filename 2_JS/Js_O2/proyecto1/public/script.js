// Array para guardar los números
let numeros = [];
const MIN = 10;
const MAX = 20;

// Variables para los elementos HTML
let inputNumero;
let agregarBtn;
let guardarBtn;
let reiniciarBtn;
let contador;
let numbersListMobile;
let message;
let confirmacionModal;
let confirmarSiBtn;
let confirmarNoBtn;
let archivosList;
let nombreArchivoSeleccionado;
let numerosArchivoList;
let volverArribaBtn;

// Cuando la página cargue
window.onload = function () {
  // Obtener los elementos
  inputNumero = document.getElementById("numero");
  agregarBtn = document.getElementById("agregarBtn");
  guardarBtn = document.getElementById("guardarBtn");
  reiniciarBtn = document.getElementById("reiniciarBtn");
  contador = document.getElementById("contador");
  numbersListMobile = document.getElementById("numbersListMobile");
  message = document.getElementById("message");
  confirmacionModal = document.getElementById("confirmacionModal");
  confirmarSiBtn = document.getElementById("confirmarSiBtn");
  confirmarNoBtn = document.getElementById("confirmarNoBtn");
  archivosList = document.getElementById("archivosList");
  nombreArchivoSeleccionado = document.getElementById(
    "nombreArchivoSeleccionado",
  );
  numerosArchivoList = document.getElementById("numerosArchivoList");
  volverArribaBtn = document.getElementById("volverArribaBtn");

  // Evento para el botón volver arriba
  volverArribaBtn.onclick = function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mostrar/ocultar botón según scroll
  window.onscroll = function () {
    if (window.scrollY > 300) {
      volverArribaBtn.style.display = "flex";
    } else {
      volverArribaBtn.style.display = "none";
    }
  };

  // Bloquear letras en tiempo real
  inputNumero.oninput = function () {
    this.value = this.value.replace(/[^0-9\-]/g, "");
  };

  inputNumero.onkeydown = function (e) {
    const permitidas = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Enter"
    ];
    if (!/[0-9]/.test(e.key) && !permitidas.includes(e.key)) {
      e.preventDefault();
    }
  };

  // Asignar eventos
  agregarBtn.onclick = agregarNumero;
  inputNumero.onkeypress = function (e) {
    if (e.key === "Enter") {
      agregarNumero();
    }
  };
  guardarBtn.onclick = guardar;
  reiniciarBtn.onclick = mostrarConfirmacion;
  confirmarSiBtn.onclick = confirmarReinicio;
  confirmarNoBtn.onclick = ocultarConfirmacion;
  confirmacionModal.onclick = function (e) {
    if (e.target === confirmacionModal) {
      ocultarConfirmacion();
    }
  };

  // Actualizar la pantalla al inicio
  actualizarDisplay();
  // Cargar la lista de archivos al inicio
  cargarArchivos();
};

// Función para cargar la lista de archivos
async function cargarArchivos() {
  try {
    let response = await fetch("/list-files");
    let data = await response.json();
    if (data.success) {
      actualizarListaArchivos(data.files);
    }
  } catch (error) {
    console.error("Error al cargar archivos:", error);
  }
}

// Función para actualizar la lista de archivos en la UI
function actualizarListaArchivos(files) {
  archivosList.innerHTML = "";
  if (files.length === 0) {
    let li = document.createElement("li");
    li.textContent = "No hay archivos guardados";
    li.style.color = "var(--texto-secundario)";
    archivosList.appendChild(li);
    return;
  }
  files.forEach((file) => {
    let li = document.createElement("li");
    li.className = "archivo-item";

    // Texto del nombre del archivo
    let spanTexto = document.createElement("span");
    spanTexto.textContent = file;
    spanTexto.className = "archivo-texto";

    // Botón de eliminar
    let btnEliminar = document.createElement("button");
    btnEliminar.textContent = "✕";
    btnEliminar.className = "eliminar-archivo-btn";
    btnEliminar.onclick = function (e) {
      e.stopPropagation();
      eliminarArchivo(file);
    };

    // Agregar todo al li
    li.appendChild(spanTexto);
    li.appendChild(btnEliminar);

    // Evento para seleccionar el archivo
    li.onclick = function () {
      seleccionarArchivo(file);
    };

    archivosList.appendChild(li);
  });
}

// Función para eliminar un archivo
async function eliminarArchivo(filename) {
  try {
    let response = await fetch(`/delete-file/${filename}`, {
      method: "DELETE",
    });
    let data = await response.json();
    if (data.success) {
      // Limpiar la vista si el archivo eliminado era el seleccionado
      if (nombreArchivoSeleccionado.textContent === filename) {
        nombreArchivoSeleccionado.textContent = "Selecciona un archivo";
        numerosArchivoList.innerHTML = "";
      }
      // Actualizar la lista
      cargarArchivos();
    }
  } catch (error) {
    console.error("Error al eliminar el archivo:", error);
  }
}

// Función para seleccionar un archivo y mostrar su contenido
async function seleccionarArchivo(filename) {
  try {
    let response = await fetch(`/get-file/${filename}`);
    let data = await response.json();
    if (data.success) {
      nombreArchivoSeleccionado.textContent = data.filename;
      actualizarNumerosArchivo(data.numbers);
      // Marcar el archivo seleccionado
      let items = document.querySelectorAll(".archivo-item");
      items.forEach((item) => {
        item.classList.remove("seleccionado");
        let texto = item.querySelector(".archivo-texto");
        if (texto && texto.textContent === filename) {
          item.classList.add("seleccionado");
        }
      });
    }
  } catch (error) {
    console.error("Error al cargar el archivo:", error);
  }
}

// Función para actualizar la lista de números del archivo seleccionado
function actualizarNumerosArchivo(numbers) {
  numerosArchivoList.innerHTML = "";
  if (numbers.length === 0) {
    let li = document.createElement("li");
    li.textContent = "El archivo está vacío";
    li.style.color = "var(--texto-secundario)";
    numerosArchivoList.appendChild(li);
    return;
  }
  numbers.forEach((num, index) => {
    let li = document.createElement("li");
    li.textContent = `${index + 1}) ${num}`;
    numerosArchivoList.appendChild(li);
  });
}

// Función para agregar un número (usa push!)
function agregarNumero() {
  let valor = inputNumero.value.trim();

  // Validar que no esté vacío
  if (valor === "") {
    mostrarMensaje("Por favor, ingrese un número", "error");
    return;
  }

  let numero = parseFloat(valor);

  // Validar que sea un número
  if (isNaN(numero)) {
    mostrarMensaje("Por favor, ingrese un número válido", "error");
    return;
  }

  // Validar que no supere el máximo
  if (numeros.length >= MAX) {
    mostrarMensaje("Ya ingresaste el máximo de " + MAX + " números", "error");
    return;
  }

  // Agregar el número al array
  numeros.push(numero);

  // Actualizar la pantalla
  actualizarDisplay();

  // Limpiar el input
  inputNumero.value = "";
  inputNumero.focus();
  ocultarMensaje();
}

// Función para eliminar un número por su posición
function eliminarNumero(indice) {
  numeros.splice(indice, 1);
  actualizarDisplay();
}

// Función para crear un item de lista
function crearItemLista(indice) {
  let li = document.createElement("li");

  // Texto del número
  let spanTexto = document.createElement("span");
  spanTexto.textContent = indice + 1 + ") " + numeros[indice];
  spanTexto.className = "numero-texto";
  spanTexto.style.color = "var(--texto-principal)";

  // Botón de eliminar (cruz)
  let btnEliminar = document.createElement("button");
  btnEliminar.textContent = "✕";
  btnEliminar.className = "eliminar-btn";
  btnEliminar.onclick = function () {
    eliminarNumero(indice);
  };

  // Agregar todo al li
  li.appendChild(spanTexto);
  li.appendChild(btnEliminar);

  return li;
}

// Función para actualizar lo que se ve en pantalla
function actualizarDisplay() {
  // Actualizar contador
  contador.textContent = numeros.length;

  // Limpiar y actualizar la lista móvil
  numbersListMobile.innerHTML = "";
  for (let i = 0; i < numeros.length; i++) {
    let liMobile = crearItemLista(i);
    numbersListMobile.appendChild(liMobile);
  }

  // Habilitar/deshabilitar botón guardar
  if (numeros.length >= MIN) {
    guardarBtn.disabled = false;
  } else {
    guardarBtn.disabled = true;
  }

  // Cambiar color del contador
  let status = contador.parentElement;
  if (numeros.length >= MIN && numeros.length < MAX) {
    status.style.borderLeft = "4px solid #4CAF50";
  } else if (numeros.length >= MAX) {
    status.style.borderLeft = "4px solid #FFC107";
  } else {
    status.style.borderLeft = "4px solid #2196F3";
  }
}

// Función para descargar el archivo
function descargarArchivo(contenido, nombre) {
  let blob = new Blob([contenido], { type: "text/plain" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Función para guardar los números
async function guardar() {
  if (numeros.length < MIN) {
    mostrarMensaje("Necesitas al menos " + MIN + " números", "error");
    return;
  }

  // Crear el contenido del archivo
  let contenido = "";
  for (let i = 0; i < numeros.length; i++) {
    contenido += numeros[i] + "\n";
  }

  // Enviar al servidor primero para obtener el nombre del archivo
  try {
    let response = await fetch("/save-numbers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ numbers: numeros }),
    });

    let data = await response.json();
    // Descargar con el nombre del servidor (txt1.txt, txt2.txt, etc.)
    descargarArchivo(contenido, data.filename);
    mostrarMensaje("Archivo descargado exitosamente", "success");
    // Actualizar la lista de archivos
    cargarArchivos();
  } catch (error) {
    // Si falla la conexión con el servidor, descargar con un nombre genérico
    descargarArchivo(contenido, "numeros_guardados.txt");
    mostrarMensaje("Archivo descargado exitosamente", "success");
  }
}

// Funciones para el modal de confirmación
function mostrarConfirmacion() {
  if (numeros.length === 0) {
    reiniciarDirecto();
    return;
  }
  confirmacionModal.classList.add("activo");
}

function ocultarConfirmacion() {
  confirmacionModal.classList.remove("activo");
}

function confirmarReinicio() {
  ocultarConfirmacion();
  reiniciarDirecto();
}

function reiniciarDirecto() {
  numeros = [];
  actualizarDisplay();
  inputNumero.value = "";
  inputNumero.focus();
  mostrarMensaje("Formulario reiniciado", "success");
  setTimeout(ocultarMensaje, 2000);
}

// Funciones para mostrar mensajes
function mostrarMensaje(texto, tipo) {
  message.textContent = texto;
  message.className = "message " + tipo;
}

function ocultarMensaje() {
  message.className = "message";
}
