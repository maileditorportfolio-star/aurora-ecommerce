const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    exclude: ['tests/integration/**'],
    clearMocks: true,
    restoreMocks: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/index.js', 'src/socket/**'],
      thresholds: {
        statements: 95,
        branches: 78,
        functions: 95,
        lines: 95,
      },
    },
  },
});
