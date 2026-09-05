import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { pool } from '../config/database.js';
import { authMiddleware, allowRoles } from '../middleware/auth.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  return errors.isEmpty() ? next() : res.status(400).json({ message: errors.array()[0].msg });
};

// Busca el id interno del cliente usando el id de usuario del JWT.
async function getClientId(userId) {
  const [rows] = await pool.query('SELECT id FROM clientes WHERE usuario_id = ?', [userId]);
  return rows[0]?.id;
}

async function getVetId(userId) {
  const [rows] = await pool.query('SELECT id FROM veterinarios WHERE usuario_id = ?', [userId]);
  return rows[0]?.id;
}

// GET /api/mascotas
router.get('/mascotas', authMiddleware, async (req, res, next) => {
  try {
    let sql = `SELECT m.*, e.nombre AS especie, r.nombre AS raza
               FROM mascotas m
               JOIN especies e ON e.id = m.especie_id
               LEFT JOIN razas r ON r.id = m.raza_id`;
    let params = [];

    if (req.user.rol === 'Cliente') {
      sql += ' WHERE m.cliente_id = ?';
      params = [await getClientId(req.user.id)];
    } else if (req.user.rol === 'Veterinario') {
      const vetId = await getVetId(req.user.id);
      sql += ' WHERE m.id IN (SELECT DISTINCT mascota_id FROM turnos WHERE veterinario_id = ?)';
      params = [vetId];
    }

    const [pets] = await pool.query(sql, params);
    return res.json(pets);
  } catch (error) {
    return next(error);
  }
});

// POST /api/mascotas
router.post(
  '/mascotas',
  authMiddleware,
  allowRoles('Cliente'),
  [
    body('nombre')
      .trim()
      .notEmpty()
      .withMessage('El nombre de la mascota es obligatorio.')
      .isLength({ min: 2, max: 80 })
      .withMessage('El nombre debe tener entre 2 y 80 caracteres.')
      .custom((value) => {
        if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(value)) {
          throw new Error('El nombre de la mascota no puede contener símbolos extraños.');
        }
        return true;
      }),
    body('especie_id').isInt().withMessage('Seleccioná una especie válida.'),
    body('sexo').isIn(['Macho', 'Hembra']).withMessage('Sexo inválido.'),
    body('peso').optional({ checkFalsy: true }).isFloat({ min: 0.1, max: 300 }).withMessage('El peso debe ser un número válido.'),
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
      const clientId = await getClientId(req.user.id);
      const { nombre, especie_id, raza_id, fecha_nacimiento, sexo, peso, foto_url } = req.body;
      const [result] = await pool.query(
        `INSERT INTO mascotas(cliente_id, nombre, especie_id, raza_id, fecha_nacimiento, sexo, peso, foto_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [clientId, nombre.trim(), especie_id, raza_id || null, fecha_nacimiento || null, sexo, peso || null, foto_url || null],
      );
      return res.status(201).json({ id: result.insertId, message: 'Mascota registrada correctamente.' });
    } catch (error) {
      return next(error);
    }
  },
);

// DELETE /api/mascotas/:id
router.delete('/mascotas/:id', authMiddleware, async (req, res, next) => {
  try {
    const clientId = await getClientId(req.user.id);
    try {
      const [result] = await pool.query(
        'DELETE FROM mascotas WHERE id = ? AND (cliente_id = ? OR ? = "Administrador")',
        [req.params.id, clientId, req.user.rol],
      );
      if (!result.affectedRows) {
        return res.status(404).json({ message: 'Mascota no encontrada o sin permiso.' });
      }
      return res.status(204).end();
    } catch (dbErr) {
      if (dbErr.code === 'ER_ROW_IS_REFERENCED_2' || dbErr.errno === 1451) {
        return res.status(409).json({
          message: 'No se puede eliminar la mascota porque tiene turnos o historiales asociados.',
        });
      }
      throw dbErr;
    }
  } catch (error) {
    return next(error);
  }
});

router.get('/veterinarios', authMiddleware, async (_req, res, next) => {
  try {
    const [vets] = await pool.query(
      `SELECT v.id, u.nombre, u.apellido, v.matricula, e.nombre AS especialidad
       FROM veterinarios v JOIN usuarios u ON u.id = v.usuario_id
       LEFT JOIN especialidades e ON e.id = v.especialidad_id`,
    );
    return res.json(vets);
  } catch (error) {
    return next(error);
  }
});

router.get('/especies', authMiddleware, async (_req, res, next) => {
  try {
    const [species] = await pool.query('SELECT * FROM especies');
    return res.json(species);
  } catch (error) {
    return next(error);
  }
});

// GET /api/pacientes — mascotas atendidas por el veterinario autenticado.
router.get('/pacientes', authMiddleware, allowRoles('Veterinario'), async (req, res, next) => {
  try {
    const vetId = await getVetId(req.user.id);
    const [rows] = await pool.query(
      `SELECT DISTINCT m.id, m.nombre, e.nombre AS especie, r.nombre AS raza, m.sexo,
              CONCAT(u.nombre, ' ', u.apellido) AS propietario
       FROM turnos t
       JOIN mascotas m ON m.id = t.mascota_id
       JOIN especies e ON e.id = m.especie_id
       LEFT JOIN razas r ON r.id = m.raza_id
       JOIN clientes c ON c.id = m.cliente_id
       JOIN usuarios u ON u.id = c.usuario_id
       WHERE t.veterinario_id = ?
       ORDER BY m.nombre`,
      [vetId],
    );
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

// GET /api/turnos
router.get('/turnos', authMiddleware, async (req, res, next) => {
  try {
    let sql = `SELECT t.*, m.nombre AS mascota, CONCAT(u.nombre, ' ', u.apellido) AS veterinario,
                      CONCAT(uc.nombre, ' ', uc.apellido) AS cliente,
                      et.nombre AS estado
               FROM turnos t
               JOIN mascotas m ON m.id = t.mascota_id
               JOIN veterinarios v ON v.id = t.veterinario_id
               JOIN usuarios u ON u.id = v.usuario_id
               JOIN clientes c ON c.id = m.cliente_id
               JOIN usuarios uc ON uc.id = c.usuario_id
               JOIN estados_turno et ON et.id = t.estado_id`;
    let params = [];

    if (req.user.rol === 'Cliente') {
      sql += ' WHERE c.usuario_id = ?';
      params = [req.user.id];
    } else if (req.user.rol === 'Veterinario') {
      sql += ' WHERE v.usuario_id = ?';
      params = [req.user.id];
    }

    if (req.query.fecha) {
      sql += params.length ? ' AND t.fecha = ?' : ' WHERE t.fecha = ?';
      params.push(req.query.fecha);
    }

    sql += ' ORDER BY t.fecha, t.hora';
    const [appointments] = await pool.query(sql, params);
    return res.json(appointments);
  } catch (error) {
    return next(error);
  }
});

// GET /api/turnos/hoy — agenda del día para veterinarios.
router.get('/turnos/hoy', authMiddleware, allowRoles('Veterinario'), async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await pool.query(
      `SELECT t.id, t.fecha, t.hora, t.motivo, m.nombre AS mascota,
              CONCAT(uc.nombre, ' ', uc.apellido) AS cliente, et.nombre AS estado
       FROM turnos t
       JOIN mascotas m ON m.id = t.mascota_id
       JOIN clientes c ON c.id = m.cliente_id
       JOIN usuarios uc ON uc.id = c.usuario_id
       JOIN veterinarios v ON v.id = t.veterinario_id
       JOIN estados_turno et ON et.id = t.estado_id
       WHERE v.usuario_id = ? AND t.fecha = ?
       ORDER BY t.hora`,
      [req.user.id, today],
    );
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

// POST /api/turnos
router.post(
  '/turnos',
  authMiddleware,
  allowRoles('Cliente'),
  [
    body('mascota_id').isInt().withMessage('Seleccioná una mascota válida.'),
    body('veterinario_id').isInt().withMessage('Seleccioná un profesional.'),
    body('fecha').notEmpty().withMessage('La fecha es obligatoria.'),
    body('hora').notEmpty().withMessage('La hora es obligatoria.'),
    body('motivo').trim().notEmpty().withMessage('El motivo es obligatorio.'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const clientId = await getClientId(req.user.id);
      const { mascota_id, veterinario_id, fecha, hora, motivo } = req.body;

      const [pets] = await pool.query(
        'SELECT id FROM mascotas WHERE id = ? AND cliente_id = ?',
        [mascota_id, clientId],
      );
      if (!pets[0]) return res.status(403).json({ message: 'Mascota no válida o no te pertenece.' });

      const [vets] = await pool.query('SELECT id FROM veterinarios WHERE id = ?', [veterinario_id]);
      if (!vets[0]) return res.status(404).json({ message: 'Veterinario no encontrado.' });

      const [result] = await pool.query(
        'INSERT INTO turnos(mascota_id, veterinario_id, fecha, hora, motivo) VALUES (?, ?, ?, ?, ?)',
        [mascota_id, veterinario_id, fecha, hora, motivo],
      );
      return res.status(201).json({ id: result.insertId, message: 'Turno solicitado correctamente.' });
    } catch (error) {
      return next(error);
    }
  },
);

// PATCH /api/turnos/:id/cancelar — cancelación de turno por parte del cliente o admin
router.patch(
  '/turnos/:id/cancelar',
  authMiddleware,
  [param('id').isInt()],
  validate,
  async (req, res, next) => {
    try {
      let checkSql = `SELECT t.id, et.nombre AS estado FROM turnos t
                      JOIN estados_turno et ON et.id = t.estado_id
                      JOIN mascotas m ON m.id = t.mascota_id
                      JOIN clientes c ON c.id = m.cliente_id
                      WHERE t.id = ?`;
      let checkParams = [req.params.id];
      if (req.user.rol === 'Cliente') {
        checkSql += ' AND c.usuario_id = ?';
        checkParams.push(req.user.id);
      } else if (req.user.rol !== 'Administrador') {
        return res.status(403).json({ message: 'No tenés permiso para esta acción.' });
      }

      const [rows] = await pool.query(checkSql, checkParams);
      const turno = rows[0];
      if (!turno) return res.status(404).json({ message: 'Turno no encontrado.' });
      if (turno.estado !== 'Pendiente' && turno.estado !== 'Confirmado') {
        return res.status(409).json({ message: 'Solo se pueden cancelar turnos pendientes o confirmados.' });
      }

      const [[estadoRow]] = await pool.query('SELECT id FROM estados_turno WHERE nombre = "Cancelado"');
      await pool.query('UPDATE turnos SET estado_id = ? WHERE id = ?', [estadoRow.id, req.params.id]);
      return res.json({ message: 'Turno cancelado correctamente.' });
    } catch (error) {
      return next(error);
    }
  },
);

// PATCH /api/turnos/:id/estado — acciones del veterinario sobre turnos.
router.patch(
  '/turnos/:id/estado',
  authMiddleware,
  allowRoles('Veterinario'),
  [param('id').isInt(), body('accion').isIn(['confirmar', 'completar', 'cancelar'])],
  validate,
  async (req, res, next) => {
    try {
      const vetId = await getVetId(req.user.id);
      const [rows] = await pool.query(
        `SELECT t.id, et.nombre AS estado
         FROM turnos t
         JOIN estados_turno et ON et.id = t.estado_id
         WHERE t.id = ? AND t.veterinario_id = ?`,
        [req.params.id, vetId],
      );
      const turno = rows[0];
      if (!turno) return res.status(404).json({ message: 'Turno no encontrado.' });

      const transitions = {
        confirmar: { from: ['Pendiente'], to: 'Confirmado' },
        completar: { from: ['Confirmado', 'Pendiente'], to: 'Completado' },
        cancelar: { from: ['Pendiente', 'Confirmado'], to: 'Cancelado' },
      };
      const rule = transitions[req.body.accion];
      if (!rule.from.includes(turno.estado)) {
        return res.status(409).json({ message: 'Esta acción no está disponible para el estado actual.' });
      }

      const [[estadoRow]] = await pool.query('SELECT id FROM estados_turno WHERE nombre = ?', [rule.to]);
      await pool.query('UPDATE turnos SET estado_id = ? WHERE id = ?', [estadoRow.id, req.params.id]);
      return res.json({ message: `Turno ${rule.to.toLowerCase()} correctamente.` });
    } catch (error) {
      return next(error);
    }
  },
);

// GET /api/consultas — consultas recientes según rol.
router.get('/consultas', authMiddleware, async (req, res, next) => {
  try {
    let sql = `SELECT c.id, c.fecha AS fecha_consulta, c.diagnostico, c.tratamiento,
                      m.nombre AS mascota, t.fecha, t.hora,
                      CONCAT(uv.nombre, ' ', uv.apellido) AS veterinario
               FROM consultas c
               JOIN turnos t ON t.id = c.turno_id
               JOIN mascotas m ON m.id = t.mascota_id
               JOIN veterinarios v ON v.id = t.veterinario_id
               JOIN usuarios uv ON uv.id = v.usuario_id
               JOIN clientes cl ON cl.id = m.cliente_id`;
    let params = [];

    if (req.user.rol === 'Cliente') {
      sql += ' WHERE cl.usuario_id = ?';
      params = [req.user.id];
    } else if (req.user.rol === 'Veterinario') {
      sql += ' WHERE v.usuario_id = ?';
      params = [req.user.id];
    }

    sql += ' ORDER BY c.fecha DESC LIMIT 20';

    try {
      const [rows] = await pool.query(sql, params);
      return res.json(rows);
    } catch {
      // Si la tabla consultas no existe, devolvemos turnos completados como fallback.
      let fallback = `SELECT t.id, t.fecha, t.hora, m.nombre AS mascota, et.nombre AS estado,
                             CONCAT(uv.nombre, ' ', uv.apellido) AS veterinario
                      FROM turnos t
                      JOIN mascotas m ON m.id = t.mascota_id
                      JOIN estados_turno et ON et.id = t.estado_id
                      JOIN veterinarios v ON v.id = t.veterinario_id
                      JOIN usuarios uv ON uv.id = v.usuario_id
                      JOIN clientes cl ON cl.id = m.cliente_id
                      WHERE et.nombre = 'Completado'`;
      const fbParams = [];
      if (req.user.rol === 'Cliente') {
        fallback += ' AND cl.usuario_id = ?';
        fbParams.push(req.user.id);
      } else if (req.user.rol === 'Veterinario') {
        fallback += ' AND v.usuario_id = ?';
        fbParams.push(req.user.id);
      }
      fallback += ' ORDER BY t.fecha DESC LIMIT 20';
      const [rows] = await pool.query(fallback, fbParams);
      return res.json(rows);
    }
  } catch (error) {
    return next(error);
  }
});

// GET /api/dashboard — resumen según rol autenticado.
router.get('/dashboard', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.rol === 'Administrador') {
      return res.status(403).json({ message: 'Usá /api/admin/resumen para el panel administrativo.' });
    }

    if (req.user.rol === 'Cliente') {
      const clientId = await getClientId(req.user.id);
      const [[pets]] = await pool.query('SELECT COUNT(*) AS total FROM mascotas WHERE cliente_id = ?', [clientId]);
      const [[upcoming]] = await pool.query(
        `SELECT COUNT(*) AS total FROM turnos t
         JOIN mascotas m ON m.id = t.mascota_id
         JOIN estados_turno e ON e.id = t.estado_id
         WHERE m.cliente_id = ? AND e.nombre IN ('Pendiente', 'Confirmado')`,
        [clientId],
      );
      let consultas = 0;
      try {
        const [[c]] = await pool.query(
          `SELECT COUNT(*) AS total FROM consultas c
           JOIN turnos t ON t.id = c.turno_id
           JOIN mascotas m ON m.id = t.mascota_id
           WHERE m.cliente_id = ?`,
          [clientId],
        );
        consultas = c.total;
      } catch {
        const [[c]] = await pool.query(
          `SELECT COUNT(*) AS total FROM turnos t
           JOIN mascotas m ON m.id = t.mascota_id
           JOIN estados_turno e ON e.id = t.estado_id
           WHERE m.cliente_id = ? AND e.nombre = 'Completado'`,
          [clientId],
        );
        consultas = c.total;
      }
      return res.json({ mascotas: pets.total, turnosPendientes: upcoming.total, consultas });
    }

    if (req.user.rol === 'Veterinario') {
      const vetId = await getVetId(req.user.id);
      const [[patients]] = await pool.query(
        'SELECT COUNT(DISTINCT mascota_id) AS total FROM turnos WHERE veterinario_id = ?',
        [vetId],
      );
      const [[pending]] = await pool.query(
        `SELECT COUNT(*) AS total FROM turnos t
         JOIN estados_turno e ON e.id = t.estado_id
         WHERE t.veterinario_id = ? AND e.nombre IN ('Pendiente', 'Confirmado')`,
        [vetId],
      );
      let consultas = 0;
      try {
        const [[c]] = await pool.query(
          `SELECT COUNT(*) AS total FROM consultas c
           JOIN turnos t ON t.id = c.turno_id
           WHERE t.veterinario_id = ?`,
          [vetId],
        );
        consultas = c.total;
      } catch {
        const [[c]] = await pool.query(
          `SELECT COUNT(*) AS total FROM turnos t
           JOIN estados_turno e ON e.id = t.estado_id
           WHERE t.veterinario_id = ? AND e.nombre = 'Completado'`,
          [vetId],
        );
        consultas = c.total;
      }
      return res.json({ pacientes: patients.total, turnosPendientes: pending.total, consultas });
    }

    return res.status(403).json({ message: 'Rol no autorizado.' });
  } catch (error) {
    return next(error);
  }
});

export default router;
