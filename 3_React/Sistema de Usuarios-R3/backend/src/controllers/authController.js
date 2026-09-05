// bcrypt compara y crea hashes seguros de contraseñas.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { publicUser } from '../utils/sanitize.js';
import { clearLoginAttempts } from '../middleware/rateLimit.js';

const BCRYPT_ROUNDS = 12;

// POST /api/auth/register: crea un usuario con el rol Cliente y su perfil cliente.
export async function register(req, res, next) {
  try {
    const { nombre, apellido, email, password, telefono, direccion } = req.body;

    const [exists] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (exists.length) {
      return res.status(409).json({ message: 'Ese email ya está registrado.' });
    }

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const [result] = await pool.query(
      'INSERT INTO usuarios(nombre, apellido, email, password_hash, rol_id) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, email, hash, 3],
    );

    await pool.query(
      'INSERT INTO clientes(usuario_id, telefono, direccion) VALUES (?, ?, ?)',
      [result.insertId, telefono || null, direccion || null],
    );

    return res.status(201).json({ message: 'Cuenta creada correctamente.' });
  } catch (error) {
    return next(error);
  }
}

// POST /api/auth/login: valida credenciales y entrega el token de sesión.
export async function login(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, r.nombre AS rol
       FROM usuarios u JOIN roles r ON r.id = u.rol_id
       WHERE u.email = ? AND u.estado_id = 1`,
      [req.body.email],
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
      return res.status(401).json({ message: 'El email o la contraseña son incorrectos.' });
    }

    clearLoginAttempts(req);

    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    return res.json({ token, usuario: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

// GET /api/auth/me: recupera el usuario actual a partir del JWT.
export async function me(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, roles.nombre AS rol, c.telefono
       FROM usuarios u
       JOIN roles ON roles.id = u.rol_id
       LEFT JOIN clientes c ON c.usuario_id = u.id
       WHERE u.id = ?`,
      [req.user.id],
    );
    if (!rows[0]) return res.status(404).json({ message: 'Usuario no encontrado.' });
    return res.json(publicUser(rows[0]));
  } catch (error) {
    return next(error);
  }
}

// PUT /api/auth/me: actualiza datos personales del usuario autenticado (nombre, apellido, teléfono, foto).
export async function updateMe(req, res, next) {
  try {
    const { nombre, apellido, telefono, foto_url } = req.body;
    const userFields = [];
    const userParams = [];

    if (nombre !== undefined) {
      userFields.push('nombre = ?');
      userParams.push(nombre.trim());
    }
    if (apellido !== undefined) {
      userFields.push('apellido = ?');
      userParams.push(apellido.trim());
    }
    if (foto_url !== undefined) {
      userFields.push('foto_url = ?');
      userParams.push(foto_url || null);
    }

    if (userFields.length > 0) {
      userParams.push(req.user.id);
      await pool.query(`UPDATE usuarios SET ${userFields.join(', ')} WHERE id = ?`, userParams);
    }

    if (telefono !== undefined) {
      const cleanPhone = telefono ? telefono.trim() : null;
      const [clientRows] = await pool.query('SELECT id FROM clientes WHERE usuario_id = ?', [req.user.id]);
      if (clientRows.length > 0) {
        await pool.query('UPDATE clientes SET telefono = ? WHERE usuario_id = ?', [cleanPhone, req.user.id]);
      } else {
        await pool.query('INSERT INTO clientes (usuario_id, telefono) VALUES (?, ?)', [req.user.id, cleanPhone]);
      }
    }

    const [rows] = await pool.query(
      `SELECT u.*, roles.nombre AS rol, c.telefono
       FROM usuarios u
       JOIN roles ON roles.id = u.rol_id
       LEFT JOIN clientes c ON c.usuario_id = u.id
       WHERE u.id = ?`,
      [req.user.id],
    );

    return res.json({
      message: 'Perfil actualizado correctamente.',
      usuario: publicUser(rows[0]),
    });
  } catch (error) {
    return next(error);
  }
}

export const logout = (_req, res) => res.status(204).end();
