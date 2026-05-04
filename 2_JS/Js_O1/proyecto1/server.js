import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use("/script", express.static(path.join(__dirname, "script")));

let reservas = [
  {
    id: 1,
    nombre: "Juan Pérez",
    email: "juan@example.com",
    telefono: "+5411223344",
    habitacion: "Deluxe",
    huespedes: 2,
    checkin: "2024-06-01",
    checkout: "2024-06-04",
    noches: 3,
  },
];

// GET
app.get("/api/reservas", (req, res) => {
  res.json(reservas);
});

// POST
app.post("/api/reservas", (req, res) => {
  const {
    nombre,
    email,
    telefono,
    habitacion,
    huespedes,
    checkin,
    checkout,
    noches,
  } = req.body;

  // Validación básica en el servidor para evitar datos vacíos o corruptos
  if (
    !nombre ||
    !email ||
    !telefono ||
    !habitacion ||
    !huespedes ||
    !checkin ||
    !checkout ||
    !noches
  ) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const nueva = {
    id: Date.now(),
    nombre,
    email,
    telefono,
    habitacion,
    huespedes: parseInt(huespedes),
    checkin,
    checkout,
    noches: parseInt(noches),
  };

  reservas.push(nueva);
  res.json(nueva);
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
