import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3100;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use("/script", express.static(path.join(__dirname, "script")));

// Ruta raíz (evita "Cannot GET /")
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index2.html"));
});

// Base de datos en memoria
let inventario = [
  {
    id: 1,
    producto: "Pelota de Fútbol",
    categoria: "Deportes",
    proveedor: "Nike",
    precio: 25000,
    cantidad: 50,
    codigo: "DEP-001",
    fechaIngreso: "2024-05-01",
    descripcion: "Pelota profesional reglamentaria",
  },
];

// Rutas API
app.get("/api/stock", (req, res) => {
  res.json(inventario);
});

app.post("/api/stock", (req, res) => {
  const {
    producto,
    categoria,
    proveedor,
    precio,
    cantidad,
    codigo,
    fechaIngreso,
    descripcion,
    metodoGuardado,
  } = req.body;

  // Validación básica en servidor
  if (!producto || !categoria || !precio || !cantidad || !codigo) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios para el stock" });
  }

  // VALIDACIÓN DE DUPLICADOS (Usando include para demostrar)
  const nombresProductos = inventario.map((item) =>
    item.producto.toLowerCase(),
  );

  if (nombresProductos.includes(producto.toLowerCase())) {
    return res.status(400).json({
      error: "El producto ya existe en el stock. No se permiten duplicados.",
    });
  }

  const nuevoItem = {
    id: Date.now(),
    producto,
    categoria,
    proveedor: proveedor || "Sin proveedor",
    precio: parseFloat(precio),
    cantidad: parseInt(cantidad),
    codigo,
    fechaIngreso: fechaIngreso || new Date().toISOString().split("T")[0],
    descripcion: descripcion || "",
  };

  // DEMOSTRACIÓN DE DIFERENTES MÉTODOS DE ALMACENAJE EN ARRAY
  console.log(
    `Guardando usando método: ${metodoGuardado || "por defecto (push)"}`,
  );

  switch (metodoGuardado) {
    case "unshift":
      // Agrega al inicio del array
      inventario.unshift(nuevoItem);
      break;
    case "spread":
      // Inmutabilidad usando Spread Operator (Crea un nuevo array)
      inventario = [nuevoItem, ...inventario];
      break;
    case "splice":
      // Agrega en una posición específica (ej: la segunda posición)
      inventario.splice(1, 0, nuevoItem);
      break;
    case "push":
    default:
      // Método clásico: Agrega al final
      inventario.push(nuevoItem);
      break;
  }

  res.json({
    success: true,
    item: nuevoItem,
    metodoUsado: metodoGuardado || "push",
  });
});

// Servidor
app.listen(PORT, () => {
  console.log(`Proyecto 2 (Stock) activo en http://localhost:${PORT}`);
});
