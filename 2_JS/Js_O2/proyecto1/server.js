// Importar los módulos necesarios
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";

// Configurar las rutas del proyecto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear la aplicación de Express y definir el puerto
const app = express();
const PORT = 3000;

// Configurar Express para servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));
// Permitir que Express entienda datos envíos en formato JSON
app.use(express.json());

// Definir la carpeta donde se guardarán los archivos dentro del proyecto
const carpetaProyecto = path.join(__dirname, "archivos_guardados");

// Si la carpeta no existe, crearla automáticamente
if (!fs.existsSync(carpetaProyecto)) {
  fs.mkdirSync(carpetaProyecto, { recursive: true });
}

// Función para encontrar la carpeta de Descargas en Windows (puede ser en inglés o español)
function obtenerCarpetaDescargas() {
  const home = os.homedir();
  const posiblesRutas = [
    path.join(home, "Downloads"),
    path.join(home, "Descargas"),
    path.join(home, "OneDrive", "Downloads"),
    path.join(home, "OneDrive", "Descargas"),
  ];

  // Buscar cuál de las rutas existe
  for (const ruta of posiblesRutas) {
    if (fs.existsSync(ruta)) {
      return ruta;
    }
  }

  // Si ninguna se encuentra, usar Downloads por defecto
  return path.join(home, "Downloads");
}

// Función para obtener el siguiente número de archivo (lista-numeros1, lista-numeros2, etc.)
function obtenerSiguienteNumeroArchivo() {
  try {
    const files = fs.readdirSync(carpetaProyecto);
    const numeros = [];
    files.forEach((file) => {
      const match = file.match(/^lista-numeros(\d+)\.txt$/);
      if (match) {
        numeros.push(parseInt(match[1]));
      }
    });
    if (numeros.length === 0) return 1;
    return Math.max(...numeros) + 1;
  } catch (error) {
    console.error("Error al obtener siguiente número:", error);
    return 1;
  }
}

// Endpoint para guardar los números en archivos
app.post("/save-numbers", (req, res) => {
  try {
    const { numbers } = req.body;
    const content = numbers.join("\n");

    // Generar nombre secuencial (lista-numeros1.txt, lista-numeros2.txt, etc.)
    const siguienteNumero = obtenerSiguienteNumeroArchivo();
    const nombreArchivo = `lista-numeros${siguienteNumero}.txt`;

    // Rutas donde se guardará el archivo dentro del proyecto
    const archivoProyecto = path.join(carpetaProyecto, nombreArchivo);
    // Ruta donde se guardará el archivo en Descargas
    const carpetaDescargas = obtenerCarpetaDescargas();
    const archivoDescargas = path.join(carpetaDescargas, nombreArchivo);

    console.log("Guardando en:", archivoProyecto);
    console.log("Guardando en:", archivoDescargas);

    let guardados = 0;
    const total = 2;
    let mensajeFinal = "Archivo guardado exitosamente";

    // Función para verificar si ambos archivos se guardaron
    function verificarCompletado() {
      guardados++;
      if (guardados === total) {
        res.json({
          success: true,
          message: mensajeFinal,
          paths: [archivoProyecto, archivoDescargas],
          filename: nombreArchivo,
        });
      }
    }

    // Guardar el archivo en la carpeta del proyecto
    fs.writeFile(archivoProyecto, content, (err) => {
      if (err) {
        console.error("Error al guardar en proyecto:", err);
        mensajeFinal = "Error al guardar el archivo en la carpeta del proyecto";
      }
      verificarCompletado();
    });

    // Guardar el archivo en la carpeta de Descargas
    fs.writeFile(archivoDescargas, content, (err) => {
      if (err) {
        console.error("Error al guardar en descargas:", err);
        mensajeFinal = "Archivo guardado solo en la carpeta del proyecto";
      }
      verificarCompletado();
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Endpoint para eliminar un archivo
app.delete("/delete-file/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(carpetaProyecto, filename);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "Archivo no encontrado" });
    }

    // Eliminar el archivo
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error al eliminar el archivo:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error al eliminar el archivo" });
      }
      res.json({ success: true, message: "Archivo eliminado exitosamente" });
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Endpoint para listar los archivos guardados
app.get("/list-files", (req, res) => {
  try {
    fs.readdir(carpetaProyecto, (err, files) => {
      if (err) {
        console.error("Error al leer la carpeta:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error al leer los archivos" });
      }
      // Filtrar solo archivos .txt
      const txtFiles = files.filter((file) => file.endsWith(".txt"));
      // Ordenar por fecha de modificación (más reciente primero)
      txtFiles.sort((a, b) => {
        const statA = fs.statSync(path.join(carpetaProyecto, a));
        const statB = fs.statSync(path.join(carpetaProyecto, b));
        return statB.mtime - statA.mtime;
      });
      res.json({ success: true, files: txtFiles });
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Endpoint para obtener el contenido de un archivo
app.get("/get-file/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(carpetaProyecto, filename);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "Archivo no encontrado" });
    }

    // Leer el contenido del archivo
    fs.readFile(filePath, "utf8", (err, content) => {
      if (err) {
        console.error("Error al leer el archivo:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error al leer el archivo" });
      }
      // Dividir el contenido en líneas (números)
      const numbers = content.split("\n").filter((line) => line.trim() !== "");
      res.json({ success: true, filename, numbers });
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Proyecto 6 corriendo en http://localhost:${PORT}`);
});
