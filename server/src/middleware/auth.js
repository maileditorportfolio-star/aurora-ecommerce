const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { readToken, verifyToken } = require('../services/token.service');

const loadUser = async (req) => {
  const token = readToken(req);
  if (!token) return null;

  const payload = verifyToken(token);
  return prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true },
  });
};

/** Attaches `req.user` when a valid token is present, but never blocks the request. */
const optionalAuth = async (req, _res, next) => {
  try {
    req.user = await loadUser(req);
  } catch (error) {
    req.user = null;
  }
  next();
};

/** Rejects the request unless a valid token maps to an existing user. */
const requireAuth = async (req, _res, next) => {
  try {
    const user = await loadUser(req);
    if (!user) throw ApiError.unauthorized();
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/** Restricts a route to admin accounts. Must run after `requireAuth`. */
const requireAdmin = (req, _res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(ApiError.forbidden('Administrator access required'));
  }
  next();
};

module.exports = { optionalAuth, requireAuth, requireAdmin };
