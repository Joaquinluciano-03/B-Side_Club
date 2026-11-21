import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './lib/toast';
// fuentes autohospedadas. Archivo es variable con eje de ancho (wdth)
import '@fontsource/bungee/latin.css';
// Bungee Outline: el contorno del cartel de neón del hero
import '@fontsource/bungee-outline/latin.css';
// Bungee Hairline: un solo trazo, para el cartel de abierto/cerrado
import '@fontsource/bungee-hairline/latin.css';
import '@fontsource-variable/archivo/wdth.css';
// Martian Mono: la mono de la meta, variable con eje de ancho (font-stretch 87.5% en etiquetas)
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
