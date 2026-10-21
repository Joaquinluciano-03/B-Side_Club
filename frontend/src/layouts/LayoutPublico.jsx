import { Outlet } from 'react-router-dom';
import Header from '../componentes/Header';
import Footer from '../componentes/Footer';

// Cada pagina trae su propia entrada (cascada, hero, tapa...). No hay un
// fundido general: con el fondo gris de .pagina, un hero oscuro que se funde
// se veia lavado los primeros cuadros.
export default function LayoutPublico() {
  return (
    <div className="pagina">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
