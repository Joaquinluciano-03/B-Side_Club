import { Routes, Route, Navigate, Link, useLocation, useNavigationType } from 'react-router-dom';
import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { useAuth } from './lib/auth';
import { useDatosDelLocal } from './lib/useStoreInfo';
import { Cargando, Vacio } from './componentes/Estados';
import { irAlScroll } from './lib/scrollSuave';

// la home y su layout van en el paquete principal; el resto de las páginas se baja aparte y las públicas se precargan (usePrecargarPaginas)
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

// precarga las páginas públicas cuando el navegador queda libre
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

// Scroll entre páginas: al entrar por un link arranca arriba; al volver con Atrás vuelve a donde estabas.
// Como el contenido llega después de la API, se guarda la posición de cada entrada del historial y se reintenta hasta que la página tiene alto
const posiciones = new Map();

function ManejoDelScroll() {
  const location = useLocation();
  const tipo = useNavigationType();
  const rutaAnterior = useRef(location.pathname);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }, []);

  // useLayoutEffect y no useEffect: si no, el listener viejo guardaba la posición ya acomodada de la página anterior
  useLayoutEffect(() => {
    let cuadro = 0;
    const alScrollear = () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => posiciones.set(location.key, window.scrollY));
    };
    window.addEventListener('scroll', alScrollear, { passive: true });
    return () => {
      window.removeEventListener('scroll', alScrollear);
      cancelAnimationFrame(cuadro);
    };
  }, [location.key]);

  useLayoutEffect(() => {
    const cambioDePagina = rutaAnterior.current !== location.pathname;
    rutaAnterior.current = location.pathname;
    const guardada = posiciones.get(location.key);

    if (tipo === 'POP' && guardada) {
      // reintenta hasta 6 s; si el usuario scrollea o toca una tecla, para
      const limite = performance.now() + 6000;
      let cuadro = 0;
      let parar = false;
      const cortar = () => (parar = true);
      // espera a que la página deje de crecer, si no el navegador corre el scroll al cargar contenido arriba
      let alto = 0;
      let quietoDesde = performance.now();
      const intentar = () => {
        if (parar) return;
        irAlScroll(guardada);
        const altoAhora = document.documentElement.scrollHeight;
        if (altoAhora !== alto) {
          alto = altoAhora;
          quietoDesde = performance.now();
        }
        const llego = Math.abs(window.scrollY - guardada) <= 2;
        const estable = performance.now() - quietoDesde > 600;
        if (!(llego && estable) && performance.now() < limite) cuadro = requestAnimationFrame(intentar);
      };
      window.addEventListener('wheel', cortar, { passive: true, once: true });
      window.addEventListener('touchstart', cortar, { passive: true, once: true });
      window.addEventListener('keydown', cortar, { once: true });
      intentar();
      return () => {
        cancelAnimationFrame(cuadro);
        window.removeEventListener('wheel', cortar);
        window.removeEventListener('touchstart', cortar);
        window.removeEventListener('keydown', cortar);
      };
    }
    if (cambioDePagina) irAlScroll(0);
  }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// título y descripción con los datos de la base (index.html trae unos de respaldo)
function useMetadatosDelLocal() {
  const { info, nombre, barrio } = useDatosDelLocal();
  useEffect(() => {
    document.title = `${nombre} · Disquería${barrio ? ` en ${barrio}` : ''}`;
    const descripcion = [
      `${nombre}, disquería${barrio ? ` en ${barrio}` : ''}.`,
      info?.description,
      'Vinilos, cassettes, CDs y equipos de audio, nuevos o usados con garantía de calidad.',
    ]
      .filter(Boolean)
      .join(' ');
    document.querySelector('meta[name="description"]')?.setAttribute('content', descripcion);
  }, [nombre, barrio, info?.description]);
}

// mientras se revalida el token no se decide nada, si no al refrescar el panel te echaría al login
function SoloStaff({ children }) {
  const { esStaff, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <Cargando texto="Verificando sesión…" />;
  if (!esStaff) return <Navigate to="/login" replace state={{ volverA: location.pathname }} />;
  return children;
}

// Invitaciones y Equipo son solo para dueño y administradores: si un vendedor entra por la URL, mensaje claro en vez del error del servidor
function SoloAdmin({ children }) {
  const { puedeInvitar } = useAuth();
  if (puedeInvitar) return children;
  return (
    <Vacio titulo="Esta sección es para administradores" texto="Pedile al dueño del local que te dé permisos si la necesitás.">
      <Link to="/panel" className="btn btn-primario">
        Volver al inicio del panel
      </Link>
    </Vacio>
  );
}

export default function App() {
  usePrecargarPaginas();
  useMetadatosDelLocal();

  return (
    <>
      <ManejoDelScroll />
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
            <Route path="invitaciones" element={<SoloAdmin><PanelInvitaciones /></SoloAdmin>} />
            <Route path="usuarios" element={<SoloAdmin><PanelUsuarios /></SoloAdmin>} />
            <Route path="perfil" element={<PanelPerfil />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
