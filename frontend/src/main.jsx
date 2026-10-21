import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import App from './App';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './lib/toast';
// Fuentes autohospedadas (antes venian de Google Fonts con un <link> que
// frenaba el primer render). Archivo va en su version variable con eje de
// ancho (wdth), asi se puede usar condensada o expandida sin cargar otra fuente.
import '@fontsource/bungee/latin.css';
// Bungee Outline: el contorno de Bungee, para el cartel de neon del hero (cada
// trazo se lee como un tubo de vidrio). Se usa solo ahi.
import '@fontsource/bungee-outline/latin.css';
import '@fontsource-variable/archivo/wdth.css';
// Martian Mono: la mono de la meta (catalogo, años, estados). Tambien variable,
// con eje de ancho: se usa un poco angosta (font-stretch 87.5%) en etiquetas.
import '@fontsource-variable/martian-mono/wdth.css';
import './estilos/tokens.css';
import './estilos/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          {/* reducedMotion="never": las animaciones de Motion se ven siempre,
              aunque el sistema tenga "Efectos de animacion" apagado
              (decision del proyecto, ver tokens.css) */}
          <MotionConfig reducedMotion="never">
            <App />
          </MotionConfig>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
