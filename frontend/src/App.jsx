import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useAuth } from './lib/auth';
import { Cargando } from './componentes/Estados';

// La home y su layout van en el paquete principal: es por donde entra casi
// todo el mundo. El resto de las paginas se bajan aparte, cuando hacen falta
// (asi la home no carga el codigo del panel, del login, etc). Las publicas
// ademas se precargan apenas la home termina de cargar (ver
// usePrecargarPaginas), para que pasar de una a otra siga siendo instantaneo.
import LayoutPublico from './layouts/LayoutPublico';
import Home from './paginas/Home';

const PUBLICAS = {
  Catalogo: () => import('./paginas/Catalogo'),
  DetalleProducto: () => import('./paginas/DetalleProducto'),
  Nosotros: () => import('./paginas/Nosotros'),
  Contacto: () => import('./paginas/Contacto'),
};
const Catalogo = lazy(PUBLICAS.Catalogo);
const DetalleProducto = lazy(PUBLICAS.DetalleProducto);
const Nosotros = lazy(PUBLICAS.Nosotros);
const Contacto = lazy(PUBLICAS.Contacto);

const Login = lazy(() => import('./paginas/auth/Login'));
const Registro = lazy(() => import('./paginas/auth/Registro'));
const Recuperar = lazy(() => import('./paginas/auth/Recuperar'));
const Resetear = lazy(() => import('./paginas/auth/Resetear'));
const AceptarInvitacion = lazy(() => import('./paginas/auth/AceptarInvitacion'));

const LayoutPanel = lazy(() => import('./layouts/LayoutPanel'));
const Dashboard = lazy(() => import('./paginas/panel/Dashboard'));
const PanelProductos = lazy(() => import('./paginas/panel/Productos'));
const FormProducto = lazy(() => import('./paginas/panel/FormProducto'));
const PanelCategorias = lazy(() => import('./paginas/panel/Categorias'));
const PanelPromociones = lazy(() => import('./paginas/panel/Promociones'));
const PanelConsultas = lazy(() => import('./paginas/panel/Consultas'));
const PanelInfoLocal = lazy(() => import('./paginas/panel/InfoLocal'));
const PanelInvitaciones = lazy(() => import('./paginas/panel/Invitaciones'));
const PanelUsuarios = lazy(() => import('./paginas/panel/Usuarios'));
const PanelPerfil = lazy(() => import('./paginas/panel/Perfil'));

// Precarga las paginas publicas cuando el navegador queda libre despues de
// cargar la primera: no compite con lo que la pagina actual necesita.
function usePrecargarPaginas() {
  useEffect(() => {
    const precargar = () => Object.values(PUBLICAS).forEach((cargar) => cargar().catch(() => {}));
    const enLibre = () =>
      'requestIdleCallback' in window ? requestIdleCallback(precargar, { timeout: 3000 }) : setTimeout(precargar, 1500);
    if (document.readyState === 'complete') enLibre();
    else window.addEventListener('load', enLibre, { once: true });
    return () => window.removeEventListener('load', enLibre);
  }, []);
}

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
  usePrecargarPaginas();

  return (
    <>
      <ScrollAlTope />
      {/* mientras baja el codigo de una pagina (solo la primera vez que se
          entra; las publicas ya vienen precargadas). Las paginas del sitio
          tienen su propio Suspense en LayoutPublico, asi el header queda */}
      <Suspense fallback={<Cargando />}>
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
      </Suspense>
    </>
  );
}
