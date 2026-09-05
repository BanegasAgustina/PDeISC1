// jsonwebtoken permite verificar la firma y vigencia de cada JWT recibido.
import jwt from 'jsonwebtoken';

// Protege una ruta: agrega el usuario autenticado a req.user antes de continuar.
export function authMiddleware(req, res, next) {
  // El formato esperado es: Authorization: Bearer <token>.
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Sesión requerida.' });
  }

  try {
    // jwt.verify devuelve el payload creado al iniciar sesión.
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Sesión inválida o vencida.' });
  }
}

// Devuelve un middleware que permite pasar solo a los roles indicados.
export const allowRoles = (...roles) => (req, res, next) => {
  if (roles.includes(req.user.rol)) return next();
  return res.status(403).json({ message: 'No tenés permiso para esta acción.' });
};
