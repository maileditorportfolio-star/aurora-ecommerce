const http = require('http');
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const prisma = require('./config/prisma');
const { initChat } = require('./socket');

const server = http.createServer(app);
const io = initChat(server);

const start = async () => {
  try {
    await prisma.$connect();
    logger.info('connected to MySQL');
  } catch (error) {
    logger.error({ err: error }, 'database connection failed');
  }

  server.listen(env.port, () => {
    logger.info({ port: env.port, corsOrigins: env.corsOrigins }, 'Aurora Commerce API ready');
  });
};

const shutdown = async (signal) => {
  logger.info({ signal }, 'shutting down');
  io.close();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'unhandled promise rejection');
});

start();

module.exports = { app, server };
