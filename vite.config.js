import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Two pages: real estate site at "/" and the 3D software portfolio at "/software/".
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        software: resolve(import.meta.dirname, 'software/index.html'),
      },
    },
  },
});
