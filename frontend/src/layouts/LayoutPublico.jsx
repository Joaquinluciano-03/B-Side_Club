import { Outlet } from 'react-router-dom';
import Header from '../componentes/Header';
import Footer from '../componentes/Footer';

export default function LayoutPublico() {
  return (
    <div className="pagina">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
