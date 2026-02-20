import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },
  test: {
    environment: 'node',
    globals: true,
    fileParallelism: false,
    maxWorkers: 1,
    include: ['test/**/*.e2e-spec.ts'],
    globalSetup: ['./test/global-setup.ts'],
    setupFiles: ['./test/setup.ts'],
    testTimeout: 60000,
    hookTimeout: 180000,
  },
});
