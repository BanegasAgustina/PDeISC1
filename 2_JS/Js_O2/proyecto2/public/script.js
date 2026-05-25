// Variables globales
let numerosTotales = [];
let numerosUtiles = [];
let archivosSubidos = [];
let archivoSeleccionado = null;

// Variables para elementos HTML
let archivoInput;
let cargarBtn;
let guardarBtn;
let totalContador;
let utilesContador;
let noUtilesContador;
let porcentajeTexto;
let porcentajeBarra;
let resultadosLista;
let message;
let volverArribaBtn;
let archivosLista;
let contenidoArchivo;

// Cuando la página cargue
window.onload = function () {
  // Obtener elementos
  archivoInput = document.getElementById("archivoInput");
  cargarBtn = document.getElementById("cargarBtn");
  guardarBtn = document.getElementById("guardarBtn");
  totalContador = document.getElementById("totalContador");
  utilesContador = document.getElementById("utilesContador");
  noUtilesContador = document.getElementById("noUtilesContador");
  porcentajeTexto = document.getElementById("porcentajeTexto");
  porcentajeBarra = document.getElementById("porcentajeBarra");
  resultadosLista = document.getElementById("resultadosLista");
  message = document.getElementById("message");
  volverArribaBtn = document.getElementById("volverArribaBtn");
  archivosLista = document.getElementById("archivosLista");
  contenidoArchivo = document.getElementById("contenidoArchivo");

  // Asignar eventos
  archivoInput.onchange = function () {
    if (archivoInput.files.length > 0) {
      cargarBtn.disabled = false;
    } else {
      cargarBtn.disabled = true;
    }
  };

  cargarBtn.onclick = cargarYFiltrar;
  guardarBtn.onclick = guardarResultados;

  // Evento para el botón de volver arriba
  volverArribaBtn.onclick = function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Evento de scroll para mostrar/ocultar el botón
  window.onscroll = function () {
    if (window.scrollY > 300) {
      volverArribaBtn.classList.add("visible");
    } else {
      volverArribaBtn.classList.remove("visible");
    }
  };
};

// Función para verificar si un número empieza y termina con el mismo dígito
function esNumeroUtil(numero) {
  let strNumero = numero.toString().trim();

  // Eliminar signo negativo si existe
  if (strNumero.startsWith("-")) {
    strNumero = strNumero.substring(1);
  }

  // Eliminar punto decimal si existe (solo consideramos la parte entera)
  if (strNumero.includes(".")) {
    strNumero = strNumero.split(".")[0];
  }

  // Si es un solo dígito, sí es útil
  if (strNumero.length === 1) {
    return true;
  }

  let primerDigito = strNumero.charAt(0);
  let ultimoDigito = strNumero.charAt(strNumero.length - 1);

  return primerDigito === ultimoDigito;
}

// Función para cargar y filtrar el archivo
function cargarYFiltrar() {
  let archivo = archivoInput.files[0];

  if (!archivo) {
    mostrarMensaje("Por favor, selecciona un archivo", "error");
    return;
  }

  let lector = new FileReader();

  lector.onload = function (e) {
    let contenido = e.target.result;
    // Agregar el archivo a la lista
    agregarArchivoALista(archivo.name, contenido);
    procesarContenido(contenido);
  };

  lector.readAsText(archivo);
}

// Función para agregar un archivo a la lista de subidos
function agregarArchivoALista(nombre, contenido) {
  let nuevoArchivo = {
    id: Date.now(),
    nombre: nombre,
    contenido: contenido,
  };
  archivosSubidos.push(nuevoArchivo);
  actualizarListaArchivos();
}

// Función para actualizar la lista de archivos en la interfaz
function actualizarListaArchivos() {
  archivosLista.innerHTML = "";

  if (archivosSubidos.length === 0) {
    archivosLista.innerHTML =
      '<p class="text-muted text-center">No hay archivos subidos</p>';
    return;
  }

  for (let i = 0; i < archivosSubidos.length; i++) {
    let archivo = archivosSubidos[i];
    let div = document.createElement("div");
    div.className = "archivo-item";
    if (archivoSeleccionado && archivoSeleccionado.id === archivo.id) {
      div.classList.add("seleccionado");
    }
    div.textContent = archivo.nombre;
    div.onclick = function () {
      seleccionarArchivo(archivo);
    };
    archivosLista.appendChild(div);
  }
}

// Función para seleccionar un archivo y mostrar su contenido
function seleccionarArchivo(archivo) {
  archivoSeleccionado = archivo;
  actualizarListaArchivos();
  mostrarContenidoArchivo(archivo.contenido);
  procesarContenido(archivo.contenido);
}

// Función para mostrar el contenido del archivo seleccionado
function mostrarContenidoArchivo(contenido) {
  contenidoArchivo.innerHTML = "";
  let pre = document.createElement("pre");
  pre.className = "contenido-texto";
  pre.textContent = contenido;
  contenidoArchivo.appendChild(pre);
}

// Función para procesar el contenido del archivo
function procesarContenido(contenido) {
  // Reiniciar arrays
  numerosTotales = [];
  numerosUtiles = [];

  // Dividir el contenido por líneas
  let lineas = contenido.split("\n");

  // Procesar cada línea
  for (let i = 0; i < lineas.length; i++) {
    let linea = lineas[i].trim();

    if (linea !== "") {
      let numero = parseFloat(linea);

      if (!isNaN(numero)) {
        numerosTotales.push(numero);

        if (esNumeroUtil(numero)) {
          numerosUtiles.push(numero);
        }
      }
    }
  }

  // Ordenar números útiles ascendente
  numerosUtiles.sort(function (a, b) {
    return a - b;
  });

  // Actualizar la interfaz
  actualizarEstadisticas();
  mostrarResultados();

  if (numerosTotales.length > 0) {
    guardarBtn.disabled = false;
    mostrarMensaje("Archivo procesado exitosamente!", "success");
  } else {
    mostrarMensaje("No se encontraron números válidos en el archivo", "error");
  }
}

// Función para actualizar las estadísticas
function actualizarEstadisticas() {
  let total = numerosTotales.length;
  let utiles = numerosUtiles.length;
  let noUtiles = total - utiles;

  totalContador.textContent = total;
  utilesContador.textContent = utiles;
  noUtilesContador.textContent = noUtiles;

  // Calcular porcentaje
  if (total > 0) {
    let porcentaje = (utiles / total) * 100;
    porcentajeTexto.textContent = porcentaje.toFixed(1) + "%";
    porcentajeBarra.style.width = porcentaje + "%";

    // Cambiar color de la barra según el porcentaje
    if (porcentaje >= 70) {
      porcentajeBarra.className =
        "progress-bar progress-bar-striped progress-bar-animated bg-success";
    } else if (porcentaje >= 40) {
      porcentajeBarra.className =
        "progress-bar progress-bar-striped progress-bar-animated bg-warning";
    } else {
      porcentajeBarra.className =
        "progress-bar progress-bar-striped progress-bar-animated bg-danger";
    }
  } else {
    porcentajeTexto.textContent = "0%";
    porcentajeBarra.style.width = "0%";
  }
}

// Función para mostrar los resultados en pantalla
function mostrarResultados() {
  resultadosLista.innerHTML = "";

  if (numerosUtiles.length === 0) {
    resultadosLista.innerHTML =
      '<p class="text-muted text-center">No hay números útiles</p>';
    return;
  }

  for (let i = 0; i < numerosUtiles.length; i++) {
    let div = document.createElement("div");
    div.className = "resultado-item";
    div.textContent = i + 1 + ". " + numerosUtiles[i];
    resultadosLista.appendChild(div);
  }
}

// Función para descargar el archivo con resultados
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

// Función para guardar los resultados
async function guardarResultados() {
  if (numerosUtiles.length === 0) {
    mostrarMensaje("No hay resultados para guardar", "error");
    return;
  }

  let contenido = "";
  for (let i = 0; i < numerosUtiles.length; i++) {
    contenido += numerosUtiles[i] + "\n";
  }

  // Descargar directamente desde el navegador (siempre funciona)
  descargarArchivo(contenido, "numeros_filtrados.txt");

  // También enviar al servidor para guardar en la carpeta del proyecto
  try {
    let response = await fetch("/save-filtered", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ numbers: numerosUtiles }),
    });

    let data = await response.json();
    mostrarMensaje("Resultados guardados exitosamente!", "success");
  } catch (error) {
    console.error("Error al guardar en servidor:", error);
    mostrarMensaje("Resultados descargados exitosamente!", "success");
  }
}

// Funciones para mostrar mensajes
function mostrarMensaje(texto, tipo) {
  message.textContent = texto;
  message.className = "message " + tipo;

  // Ocultar mensaje después de 3 segundos
  setTimeout(function () {
    ocultarMensaje();
  }, 3000);
}

function ocultarMensaje() {
  message.className = "message";
}
