export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      const error = new Error('Authentification requise');
      error.status = 401;
      error.code = 'AUTHENTICATION_REQUIRED';
      return next(error);
    }

    if (!allowedRoles.includes(req.auth.accountType)) {
      const error = new Error(
        'Vous n’avez pas les permissions nécessaires'
      );

      error.status = 403;
      error.code = 'FORBIDDEN';
      return next(error);
    }

    next();
  };
}