import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas para cada punto
app.get('/punto1', (req, res) => res.sendFile(path.join(__dirname, 'public', 'punto1', 'index.html')));
app.get('/punto2', (req, res) => res.sendFile(path.join(__dirname, 'public', 'punto2', 'index.html')));
app.get('/punto3', (req, res) => res.sendFile(path.join(__dirname, 'public', 'punto3', 'index.html')));
app.get('/punto4', (req, res) => res.sendFile(path.join(__dirname, 'public', 'punto4', 'index.html')));
app.get('/punto5', (req, res) => res.sendFile(path.join(__dirname, 'public', 'punto5', 'index.html')));
app.get('/punto6', (req, res) => res.sendFile(path.join(__dirname, 'public', 'punto6', 'index.html')));

// Levantar servidor
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});
