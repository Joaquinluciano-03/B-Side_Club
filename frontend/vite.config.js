import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Precarga las fuentes del neon (el logo del header y el cartel del hero).
// Sin esto el navegador las descubre recien cuando la pagina ya se dibujo, y
// el cartel aparece primero con otra letra y despues "salta". Los nombres de
// los archivos llevan un hash que cambia en cada build, por eso se buscan en
// el bundle en vez de escribirlos a mano en index.html.
// Solo las dos del neon (42 KB): precargar tambien Archivo y Martian Mono
// (126 KB) le quitaria ancho de banda al JS, que es lo que mas apura.
function precargarFuentes() {
  const CRITICAS = [/bungee-outline-latin-400-normal-[\w-]+\.woff2$/, /bungee-latin-400-normal-[\w-]+\.woff2$/];
  return {
    name: 'precargar-fuentes',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      return Object.keys(ctx.bundle || {})
        .filter((archivo) => CRITICAS.some((re) => re.test(archivo)))
        .map((archivo) => ({
          tag: 'link',
          attrs: { rel: 'preload', href: `/${archivo}`, as: 'font', type: 'font/woff2', crossorigin: '' },
          injectTo: 'head',
        }));
    },
  };
}

export default defineConfig({
  plugins: [react(), precargarFuentes()],
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
  // vite preview (para probar el build de produccion en local) usa el mismo proxy
  preview: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
