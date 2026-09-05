import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Directorios de subida seguros
const uploadsBase = path.resolve(__dirname, '../../uploads');
const mascotasUploads = path.join(uploadsBase, 'mascotas');
const usuariosUploads = path.join(uploadsBase, 'usuarios');

// Garantizar existencia de directorios
if (!fs.existsSync(uploadsBase)) fs.mkdirSync(uploadsBase, { recursive: true });
if (!fs.existsSync(mascotasUploads)) fs.mkdirSync(mascotasUploads, { recursive: true });
if (!fs.existsSync(usuariosUploads)) fs.mkdirSync(usuariosUploads, { recursive: true });

// Formatos permitidos estrictos
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const createStorage = (targetDir) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, targetDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = `${crypto.randomUUID()}${ext}`;
      cb(null, safeName);
    },
  });

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIMES.has(file.mimetype) || !ALLOWED_EXTS.has(ext)) {
    const error = new Error('Formato no permitido. Solo se aceptan imágenes JPG, JPEG, PNG y WEBP.');
    error.status = 400;
    error.expose = true;
    return cb(error, false);
  }
  return cb(null, true);
};

const uploadMascota = multer({
  storage: createStorage(mascotasUploads),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single('imagen');

const uploadUsuario = multer({
  storage: createStorage(usuariosUploads),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single('imagen');

const handleUpload = (uploader, subpath) => (req, res, _next) => {
  uploader(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'La imagen supera el tamaño máximo permitido de 5 MB.',
        });
      }
      return res.status(400).json({
        message: err.message || 'Error al procesar la imagen.',
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ninguna imagen.' });
    }

    if (req.file.size === 0) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
      return res.status(400).json({ message: 'El archivo de imagen está vacío.' });
    }

    const publicUrl = `/uploads/${subpath}/${req.file.filename}`;
    return res.status(201).json({
      url: publicUrl,
      filename: req.file.filename,
      message: 'Imagen subida correctamente.',
    });
  });
};

// Rutas autenticadas
router.post('/mascota', authMiddleware, handleUpload(uploadMascota, 'mascotas'));
router.post('/usuario', authMiddleware, handleUpload(uploadUsuario, 'usuarios'));

export default router;
