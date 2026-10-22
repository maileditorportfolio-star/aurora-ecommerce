const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../services/token.service');
const { registerSchema, loginSchema, parse } = require('../validation/schemas');

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? null,
  role: user.role,
  avatarUrl: user.avatarUrl ?? null,
});

/** POST /api/auth/register */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = parse(registerSchema, req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, env.security.bcryptRounds);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone: phone || null },
  });

  res.status(201).json({
    success: true,
    message: 'Welcome to Aurora Commerce',
    data: { user: publicUser(user), token: signToken(user) },
  });
});

/** POST /api/auth/login */
const login = asyncHandler(async (req, res) => {
  const { email, password } = parse(loginSchema, req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) throw ApiError.unauthorized('Invalid email or password');

  res.json({
    success: true,
    message: 'Signed in successfully',
    data: { user: publicUser(user), token: signToken(user) },
  });
});

/** GET /api/auth/me */
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: publicUser(req.user) } });
});

/** PATCH /api/auth/me */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatarUrl } = req.body || {};
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name ? { name: String(name).trim().slice(0, 80) } : {}),
      ...(phone !== undefined ? { phone: String(phone).trim() || null } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl || null } : {}),
    },
  });

  res.json({ success: true, data: { user: publicUser(user) } });
});

/** PATCH /api/auth/password */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    throw ApiError.badRequest('Current password and a new password of 8+ characters are required');
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) throw ApiError.badRequest('Current password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, env.security.bcryptRounds);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  res.json({ success: true, message: 'Password updated' });
});

module.exports = { register, login, me, updateProfile, changePassword, publicUser };
