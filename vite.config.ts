import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // relative asset paths so the build works on GitHub Pages, Vercel, Netlify or any sub-folder
  base: './',
  plugins: [react()],
});
