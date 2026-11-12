import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  server: { watch: { ignored: ['**/.tmp/**'] } },
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
  },
});
