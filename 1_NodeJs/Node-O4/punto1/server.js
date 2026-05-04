import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir todo desde la carpeta actual
app.use(express.static(__dirname));

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});