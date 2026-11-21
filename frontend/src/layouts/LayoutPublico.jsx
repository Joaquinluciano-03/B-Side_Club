import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../componentes/Header';
import Footer from '../componentes/Footer';
import CartelAbierto from '../componentes/CartelAbierto';
import { activarScrollSuave } from '../lib/scrollSuave';
import { useDatosDelLocal } from '../lib/useStoreInfo';

// cada página trae su propia entrada; no hay un fundido general porque el hero oscuro se veía lavado
//
// las páginas (salvo la home) se bajan aparte: el Suspense deja header y footer en su lugar y reserva el alto
export default function LayoutPublico() {
  // scroll suave con la rueda en el sitio público (el panel no lo usa)
  useEffect(() => activarScrollSuave(), []);
  const { info } = useDatosDelLocal();

  return (
    <div className="pagina">
      <Header />
      <Suspense fallback={<main style={{ minHeight: '100dvh' }} />}>
        <Outlet />
      </Suspense>
      <Footer />
      {/* el cartel de abierto/cerrado fijo en la esquina: solo en pantallas
          anchas (en las angostas va dentro de cada pagina) */}
      <CartelAbierto horario={info?.horario} fijo />
    </div>
  );
}
