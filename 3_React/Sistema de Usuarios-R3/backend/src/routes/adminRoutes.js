import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { pool } from '../config/database.js';
import { authMiddleware, allowRoles } from '../middleware/auth.js';
import { publicUser } from '../utils/sanitize.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  return errors.isEmpty() ? next() : res.status(400).json({ message: errors.array()[0].msg });
};

router.use(authMiddleware, allowRoles('Administrador'));

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// GET /api/admin/usuarios — listado con búsqueda y filtros reales.
router.get(
  '/usuarios',
  [
    query('q').optional().trim(),
    query('rol').optional().trim(),
    query('estado').optional().trim(),
    query('mascotas').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      let sql = `SELECT u.id, u.nombre, u.apellido, u.email, u.foto_url, u.estado_id, u.fecha_creacion,
                        r.nombre AS rol,
                        CASE WHEN u.estado_id = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
                        GROUP_CONCAT(m.nombre ORDER BY m.nombre SEPARATOR ', ') AS mascotas_str,
                        COUNT(m.id) AS total_mascotas
                 FROM usuarios u
                 JOIN roles r ON r.id = u.rol_id
                 LEFT JOIN clientes c ON c.usuario_id = u.id
                 LEFT JOIN mascotas m ON m.cliente_id = c.id
                 WHERE 1=1`;
      const params = [];

      if (req.query.q) {
        sql += ' AND (u.nombre LIKE ? OR u.apellido LIKE ? OR u.email LIKE ?)';
        const term = `%${req.query.q}%`;
        params.push(term, term, term);
      }
      if (req.query.rol) {
        sql += ' AND r.nombre = ?';
        params.push(req.query.rol);
      }
      if (req.query.estado) {
        const estadoId = req.query.estado === 'Activo' ? 1 : 2;
        sql += ' AND u.estado_id = ?';
        params.push(estadoId);
      }

      sql += ' GROUP BY u.id';

      if (req.query.mascotas === 'con') {
        sql += ' HAVING total_mascotas > 0';
      } else if (req.query.mascotas === 'sin') {
        sql += ' HAVING total_mascotas = 0';
      }

      sql += ' ORDER BY u.id DESC';
      const [rows] = await pool.query(sql, params);
      return res.json(rows.map(publicUser));
    } catch (error) {
      return next(error);
    }
  },
);

// GET /api/admin/usuarios/:id
router.get('/usuarios/:id', [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, r.nombre AS rol,
              CASE WHEN u.estado_id = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
              GROUP_CONCAT(m.nombre ORDER BY m.nombre SEPARATOR ', ') AS mascotas_str,
              COUNT(m.id) AS total_mascotas
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       LEFT JOIN clientes c ON c.usuario_id = u.id
       LEFT JOIN mascotas m ON m.cliente_id = c.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ message: 'Usuario no encontrado.' });
    return res.json(publicUser(rows[0]));
  } catch (error) {
    return next(error);
  }
});

// PUT /api/admin/usuarios/:id — edición de datos administrativos con validaciones estrictas.
router.put(
  '/usuarios/:id',
  [
    param('id').isInt(),
    body('nombre')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('El nombre no puede estar vacío.')
      .custom((value) => {
        if (/\d/.test(value)) throw new Error('El nombre no puede contener números.');
        if (!NAME_REGEX.test(value)) throw new Error('El nombre solo puede contener letras y espacios.');
        return true;
      }),
    body('apellido')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('El apellido no puede estar vacío.')
      .custom((value) => {
        if (/\d/.test(value)) throw new Error('El apellido no puede contener números.');
        if (!NAME_REGEX.test(value)) throw new Error('El apellido solo puede contener letras y espacios.');
        return true;
      }),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Ingresá un email válido.')
      .normalizeEmail()
      .custom((value) => {
        if (!EMAIL_REGEX.test(value)) throw new Error('Ingresá un email con un dominio completo válido.');
        return true;
      }),
    body('rol_id').optional().isInt({ min: 1, max: 3 }).withMessage('Rol inválido.'),
    body('foto_url')
      .optional({ nullable: true })
      .custom((value) => {
        if (value && typeof value === 'string' && !value.startsWith('/uploads/') && !value.startsWith('http')) {
          throw new Error('URL de imagen inválida.');
        }
        return true;
      }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { nombre, apellido, email, rol_id, foto_url } = req.body;
      const fields = [];
      const params = [];

      if (nombre) { fields.push('nombre = ?'); params.push(nombre); }
      if (apellido) { fields.push('apellido = ?'); params.push(apellido); }
      if (email) {
        const [exists] = await pool.query('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, req.params.id]);
        if (exists.length) return res.status(409).json({ message: 'Ese email ya está en uso.' });
        fields.push('email = ?');
        params.push(email);
      }
      if (rol_id) { fields.push('rol_id = ?'); params.push(rol_id); }
      if (foto_url !== undefined) { fields.push('foto_url = ?'); params.push(foto_url || null); }

      if (!fields.length) return res.status(400).json({ message: 'No hay datos para actualizar.' });

      params.push(req.params.id);
      const [result] = await pool.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`, params);
      if (!result.affectedRows) return res.status(404).json({ message: 'Usuario no encontrado.' });
      return res.json({ message: 'Usuario actualizado correctamente.' });
    } catch (error) {
      return next(error);
    }
  },
);

// PATCH /api/admin/usuarios/:id/estado — activar o desactivar cuenta.
router.patch(
  '/usuarios/:id/estado',
  [param('id').isInt(), body('estado_id').isInt({ min: 1, max: 2 })],
  validate,
  async (req, res, next) => {
    try {
      if (Number(req.params.id) === req.user.id) {
        return res.status(400).json({ message: 'No podés cambiar el estado de tu propia cuenta.' });
      }
      const [result] = await pool.query('UPDATE usuarios SET estado_id = ? WHERE id = ?', [
        req.body.estado_id,
        req.params.id,
      ]);
      if (!result.affectedRows) return res.status(404).json({ message: 'Usuario no encontrado.' });
      return res.json({ message: 'Estado actualizado correctamente.' });
    } catch (error) {
      return next(error);
    }
  },
);

// DELETE /api/admin/usuarios/:id — eliminar usuario con comprobación de seguridad
router.delete(
  '/usuarios/:id',
  [param('id').isInt()],
  validate,
  async (req, res, next) => {
    try {
      if (Number(req.params.id) === req.user.id) {
        return res.status(400).json({ message: 'No podés eliminar tu propia cuenta.' });
      }

      // Comprobamos si existe
      const [rows] = await pool.query('SELECT id, nombre, apellido FROM usuarios WHERE id = ?', [req.params.id]);
      if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado.' });

      try {
        // Intenta eliminar (o clientes/veterinarios asociados sin turnos)
        await pool.query('DELETE FROM clientes WHERE usuario_id = ?', [req.params.id]);
        await pool.query('DELETE FROM veterinarios WHERE usuario_id = ?', [req.params.id]);
        const [delResult] = await pool.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
        if (!delResult.affectedRows) return res.status(404).json({ message: 'Usuario no encontrado.' });
        return res.json({ message: 'Usuario eliminado correctamente.' });
      } catch (dbErr) {
        if (dbErr.code === 'ER_ROW_IS_REFERENCED_2' || dbErr.errno === 1451) {
          return res.status(409).json({
            message: 'No se puede eliminar el usuario porque tiene mascotas o turnos asociados. Te recomendamos desactivarlo.',
          });
        }
        throw dbErr;
      }
    } catch (error) {
      return next(error);
    }
  },
);

// GET /api/admin/mascotas — todas las mascotas con propietario.
router.get(
  '/mascotas',
  [query('q').optional().trim(), query('especie').optional().trim()],
  validate,
  async (req, res, next) => {
    try {
      let sql = `SELECT m.id, m.nombre, m.fecha_nacimiento, m.sexo, m.peso, m.foto_url,
                        e.nombre AS especie, r.nombre AS raza,
                        CONCAT(u.nombre, ' ', u.apellido) AS propietario,
                        CASE WHEN u.estado_id = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado
                 FROM mascotas m
                 JOIN especies e ON e.id = m.especie_id
                 LEFT JOIN razas r ON r.id = m.raza_id
                 JOIN clientes c ON c.id = m.cliente_id
                 JOIN usuarios u ON u.id = c.usuario_id
                 WHERE 1=1`;
      const params = [];

      if (req.query.q) {
        sql += ' AND (m.nombre LIKE ? OR u.nombre LIKE ? OR u.apellido LIKE ?)';
        const term = `%${req.query.q}%`;
        params.push(term, term, term);
      }
      if (req.query.especie) {
        sql += ' AND e.nombre = ?';
        params.push(req.query.especie);
      }

      sql += ' ORDER BY m.id DESC';
      const [rows] = await pool.query(sql, params);
      return res.json(rows);
    } catch (error) {
      return next(error);
    }
  },
);

// GET /api/admin/turnos — turnos pendientes o filtrados.
router.get(
  '/turnos',
  [
    query('estado').optional().trim(),
    query('fecha').optional().isISO8601(),
    query('veterinario').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      let sql = `SELECT t.id, t.fecha, t.hora, t.motivo, et.nombre AS estado,
                        m.nombre AS mascota,
                        CONCAT(uc.nombre, ' ', uc.apellido) AS propietario,
                        CONCAT(uv.nombre, ' ', uv.apellido) AS veterinario
                 FROM turnos t
                 JOIN mascotas m ON m.id = t.mascota_id
                 JOIN clientes c ON c.id = m.cliente_id
                 JOIN usuarios uc ON uc.id = c.usuario_id
                 JOIN veterinarios v ON v.id = t.veterinario_id
                 JOIN usuarios uv ON uv.id = v.usuario_id
                 JOIN estados_turno et ON et.id = t.estado_id
                 WHERE 1=1`;
      const params = [];

      if (req.query.estado) {
        sql += ' AND et.nombre = ?';
        params.push(req.query.estado);
      } else {
        sql += " AND et.nombre IN ('Pendiente', 'Confirmado')";
      }
      if (req.query.fecha) {
        sql += ' AND t.fecha = ?';
        params.push(req.query.fecha);
      }
      if (req.query.veterinario) {
        sql += ' AND (uv.nombre LIKE ? OR uv.apellido LIKE ?)';
        const term = `%${req.query.veterinario}%`;
        params.push(term, term);
      }

      sql += ' ORDER BY t.fecha, t.hora';
      const [rows] = await pool.query(sql, params);
      return res.json(rows);
    } catch (error) {
      return next(error);
    }
  },
);

// GET /api/admin/turnos/:id — visualización detallada del turno
router.get('/turnos/:id', [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, et.nombre AS estado, m.nombre AS mascota,
              e.nombre AS especie, r.nombre AS raza,
              CONCAT(uc.nombre, ' ', uc.apellido) AS propietario, uc.email AS email_propietario,
              c.telefono AS telefono_propietario,
              CONCAT(uv.nombre, ' ', uv.apellido) AS veterinario, v.matricula
       FROM turnos t
       JOIN mascotas m ON m.id = t.mascota_id
       JOIN especies e ON e.id = m.especie_id
       LEFT JOIN razas r ON r.id = m.raza_id
       JOIN clientes c ON c.id = m.cliente_id
       JOIN usuarios uc ON uc.id = c.usuario_id
       JOIN veterinarios v ON v.id = t.veterinario_id
       JOIN usuarios uv ON uv.id = v.usuario_id
       JOIN estados_turno et ON et.id = t.estado_id
       WHERE t.id = ?`,
      [req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ message: 'Turno no encontrado.' });
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
});

// GET /api/admin/resumen — conteos para el dashboard.
router.get('/resumen', async (_req, res, next) => {
  try {
    const [[usuarios]] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
    const [[mascotas]] = await pool.query('SELECT COUNT(*) AS total FROM mascotas');
    const [[veterinarios]] = await pool.query('SELECT COUNT(*) AS total FROM veterinarios');
    const [[turnosPendientes]] = await pool.query(
      `SELECT COUNT(*) AS total FROM turnos t
       JOIN estados_turno e ON e.id = t.estado_id
       WHERE e.nombre IN ('Pendiente', 'Confirmado')`,
    );
    return res.json({
      usuarios: usuarios.total,
      mascotas: mascotas.total,
      veterinarios: veterinarios.total,
      turnosPendientes: turnosPendientes.total,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
