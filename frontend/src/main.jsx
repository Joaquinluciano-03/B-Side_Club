import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
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
// Bungee Hairline: la de un solo trazo, para el cartel de abierto/cerrado
// (cada letra es un tubo continuo, sin la doble linea del Outline)
import '@fontsource/bungee-hairline/latin.css';
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
          {/* Motion (la libreria de animacion) no se importa aca: solo la
              usan el catalogo y el panel, y asi no viaja en el paquete de la
              home. Su configuracion (reducedMotion="never") va donde se usa */}
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
