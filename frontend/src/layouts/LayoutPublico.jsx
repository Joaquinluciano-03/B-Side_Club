import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../componentes/Header';
import Footer from '../componentes/Footer';
import { activarScrollSuave } from '../lib/scrollSuave';

// Cada pagina trae su propia entrada (cascada, hero, tapa...). No hay un
// fundido general: con el fondo gris de .pagina, un hero oscuro que se funde
// se veia lavado los primeros cuadros.
//
// Las paginas (salvo la home) se bajan aparte (ver App.jsx). Si alguna
// todavia no llego, el Suspense deja el header y el footer en su lugar y
// reserva el alto de la pantalla, asi nada salta cuando aparece.
export default function LayoutPublico() {
  // la rueda del mouse se desliza suave en todo el sitio publico (el panel
  // no lo usa: es una herramienta)
  useEffect(() => activarScrollSuave(), []);

  return (
    <div className="pagina">
      <Header />
      <Suspense fallback={<main style={{ minHeight: '100dvh' }} />}>
        <Outlet />
      </Suspense>
      <Footer />
    </div>
  );
}
