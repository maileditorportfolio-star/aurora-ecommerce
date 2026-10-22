const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const toList = (value, fallback = []) => {
  if (!value) return fallback;
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/aurora_commerce',

  jwt: {
    secret: process.env.JWT_SECRET || 'aurora-dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  corsOrigins: toList(process.env.CORS_ORIGINS, ['http://localhost:3000', 'http://127.0.0.1:3000']),

  security: {
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
    authRateLimit: Number(process.env.AUTH_RATE_LIMIT || 20),
  },

  shipping: {
    flatRate: Number(process.env.SHIPPING_FLAT_RATE || 60),
    freeThreshold: Number(process.env.SHIPPING_FREE_THRESHOLD || 5000),
    taxRate: Number(process.env.TAX_RATE || 0),
  },
};

env.isProduction = env.nodeEnv === 'production';

if (env.isProduction && env.jwt.secret === 'aurora-dev-secret-change-me') {
  throw new Error('JWT_SECRET must be set to a unique value in production.');
}

module.exports = env;
