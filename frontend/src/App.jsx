import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './lib/auth';
import { Cargando } from './componentes/Estados';

import LayoutPublico from './layouts/LayoutPublico';
import Home from './paginas/Home';
import Catalogo from './paginas/Catalogo';
import DetalleProducto from './paginas/DetalleProducto';
import Nosotros from './paginas/Nosotros';
import Contacto from './paginas/Contacto';

import Login from './paginas/auth/Login';
import Registro from './paginas/auth/Registro';
import Recuperar from './paginas/auth/Recuperar';
import Resetear from './paginas/auth/Resetear';
import AceptarInvitacion from './paginas/auth/AceptarInvitacion';

import LayoutPanel from './layouts/LayoutPanel';
import Dashboard from './paginas/panel/Dashboard';
import PanelProductos from './paginas/panel/Productos';
import FormProducto from './paginas/panel/FormProducto';
import PanelCategorias from './paginas/panel/Categorias';
import PanelPromociones from './paginas/panel/Promociones';
import PanelConsultas from './paginas/panel/Consultas';
import PanelInfoLocal from './paginas/panel/InfoLocal';
import PanelInvitaciones from './paginas/panel/Invitaciones';
import PanelUsuarios from './paginas/panel/Usuarios';
import PanelPerfil from './paginas/panel/Perfil';

// Al cambiar de ruta el navegador conserva el scroll, y se siente roto cuando
// entras a un producto y aparecés a mitad de la ficha.
function ScrollAlTope() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Protege el panel. Mientras revalidamos el token no decidimos nada: si
// mandaramos al login ahi, al refrescar el panel te echaria siempre.
function SoloStaff({ children }) {
  const { esStaff, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <Cargando texto="Verificando sesión…" />;
  if (!esStaff) return <Navigate to="/login" replace state={{ volverA: location.pathname }} />;
  return children;
}

export default function App() {
  return (
    <>
      <ScrollAlTope />
      <Routes>
        {/* ---------- Sitio publico ---------- */}
        <Route element={<LayoutPublico />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
        </Route>

        {/* ---------- Auth (sin header/footer) ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/resetear-password" element={<Resetear />} />
        <Route path="/aceptar-invitacion" element={<AceptarInvitacion />} />

        {/* ---------- Panel interno ---------- */}
        <Route
          path="/panel"
          element={
            <SoloStaff>
              <LayoutPanel />
            </SoloStaff>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<PanelProductos />} />
          <Route path="productos/nuevo" element={<FormProducto />} />
          <Route path="productos/:id" element={<FormProducto />} />
          <Route path="categorias" element={<PanelCategorias />} />
          <Route path="promociones" element={<PanelPromociones />} />
          <Route path="consultas" element={<PanelConsultas />} />
          <Route path="info" element={<PanelInfoLocal />} />
          <Route path="invitaciones" element={<PanelInvitaciones />} />
          <Route path="usuarios" element={<PanelUsuarios />} />
          <Route path="perfil" element={<PanelPerfil />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
