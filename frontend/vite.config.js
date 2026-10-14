import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // En produccion el frontend y la API quedan en el mismo dominio
    // (Netlify manda /api/* a la funcion), asi que el frontend pide a /api
    // y listo. Este proxy hace que en desarrollo pase lo mismo: el navegador
    // ve todo en localhost:5173 y Vite reenvia /api al Express de al lado.
    // Beneficio: no hay CORS en el medio ni una URL distinta por ambiente.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
