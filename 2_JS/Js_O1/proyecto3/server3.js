import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use("/script", express.static(path.join(__dirname, "script")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index3.html"));
});

app.listen(PORT, () => {
  console.log(`Proyecto 3 (Personas) activo en http://localhost:${PORT}`);
});
