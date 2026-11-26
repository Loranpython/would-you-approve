import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// GitHub Pages serves the site at https://loranpython.github.io/would-you-approve/.
// Set BASE_PATH to build for another location (for example BASE_PATH=./).
const PAGES_BASE = process.env.BASE_PATH ?? '/would-you-approve/';

// `npm run build`        -> dist/        (for GitHub Pages, under PAGES_BASE)
// `npm run build:single` -> dist-single/ (one self-contained index.html that opens from disk)
export default defineConfig(({ mode }) => ({
  base: mode === 'single' ? './' : PAGES_BASE,
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  publicDir: false,
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
}));
