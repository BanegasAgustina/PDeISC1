// Limita intentos de login por IP para reducir fuerza bruta.
const attempts = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function loginRateLimit(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = attempts.get(key) || { count: 0, firstAt: now, blockedUntil: 0 };

  if (record.blockedUntil > now) {
    return res.status(429).json({
      message: 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
    });
  }

  if (now - record.firstAt > WINDOW_MS) {
    record.count = 0;
    record.firstAt = now;
  }

  record.count += 1;
  attempts.set(key, record);

  if (record.count > MAX_ATTEMPTS) {
    record.blockedUntil = now + WINDOW_MS;
    attempts.set(key, record);
    return res.status(429).json({
      message: 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
    });
  }

  return next();
}

// Limpia el contador cuando el login fue exitoso.
export function clearLoginAttempts(req) {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  attempts.delete(key);
}
