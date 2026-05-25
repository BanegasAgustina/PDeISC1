import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3006;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Crear carpeta para guardar archivos si no existe
const carpetaProyecto = path.join(__dirname, 'archivos_filtrados');

if (!fs.existsSync(carpetaProyecto)) {
  fs.mkdirSync(carpetaProyecto, { recursive: true });
}

// Función para obtener la carpeta de Descargas
function obtenerCarpetaDescargas() {
  const home = os.homedir();
  const posiblesRutas = [
    path.join(home, 'Downloads'),
    path.join(home, 'Descargas'),
    path.join(home, 'OneDrive', 'Downloads'),
    path.join(home, 'OneDrive', 'Descargas'),
  ];

  for (const ruta of posiblesRutas) {
    if (fs.existsSync(ruta)) {
      return ruta;
    }
  }

  return path.join(home, 'Downloads');
}

// Endpoint para guardar los números filtrados
app.post('/save-filtered', (req, res) => {
  try {
    const { numbers } = req.body;
    const content = numbers.join('\n');

    const archivoProyecto = path.join(carpetaProyecto, 'numeros_filtrados.txt');
    const carpetaDescargas = obtenerCarpetaDescargas();
    const archivoDescargas = path.join(carpetaDescargas, 'numeros_filtrados.txt');

    console.log('Guardando filtrados en:', archivoProyecto);
    console.log('Guardando filtrados en:', archivoDescargas);

    let guardados = 0;
    const total = 2;
    let mensajeFinal = 'Archivo guardado exitosamente';

    function verificarCompletado() {
      guardados++;
      if (guardados === total) {
        res.json({
          success: true,
          message: mensajeFinal,
          paths: [archivoProyecto, archivoDescargas],
        });
      }
    }

    fs.writeFile(archivoProyecto, content, (err) => {
      if (err) {
        console.error('Error al guardar en proyecto:', err);
        mensajeFinal = 'Error al guardar el archivo en la carpeta del proyecto';
      }
      verificarCompletado();
    });

    fs.writeFile(archivoDescargas, content, (err) => {
      if (err) {
        console.error('Error al guardar en descargas:', err);
        mensajeFinal = 'Archivo guardado solo en la carpeta del proyecto';
      }
      verificarCompletado();
    });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
    console.log(`Proyecto 2 corriendo en http://localhost:${PORT}`);
});
