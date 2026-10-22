const http = require('http');
const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');
const { initChat } = require('./socket');

const server = http.createServer(app);
const io = initChat(server);

const start = async () => {
  try {
    await prisma.$connect();
    console.log('[db] connected to MySQL');
  } catch (error) {
    console.error('[db] connection failed:', error.message);
  }

  server.listen(env.port, () => {
    console.log(`[api] Aurora Commerce API ready on http://localhost:${env.port}`);
    console.log(`[api] health check: http://localhost:${env.port}/api/health`);
    console.log(`[api] CORS origins: ${env.corsOrigins.join(', ')}`);
  });
};

const shutdown = async (signal) => {
  console.log(`\n[api] ${signal} received, shutting down...`);
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
  console.error('[api] unhandled rejection:', reason);
});

start();

module.exports = { app, server };
