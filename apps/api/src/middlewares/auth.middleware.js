import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    const error = new Error('Authentification requise');
    error.status = 401;
    error.code = 'AUTHENTICATION_REQUIRED';
    return next(error);
  }

  const token = header.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    req.auth = {
      userId: payload.sub,
      accountType: payload.accountType,
      email: payload.email
    };

    next();
  } catch {
    const error = new Error('Token invalide ou expiré');
    error.status = 401;
    error.code = 'INVALID_ACCESS_TOKEN';
    next(error);
  }
}