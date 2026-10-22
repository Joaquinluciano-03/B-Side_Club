import { Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react';
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

// Scroll entre paginas:
// - al entrar a una pagina nueva (un link) se arranca arriba; si no, entrabas
//   a un producto y aparecias a mitad de la ficha
// - al volver con Atras (o Adelante) se vuelve a donde estabas: bajabas por
//   el catalogo, abrias un disco, volvias y aparecias arriba de todo
// El navegador no lo puede hacer solo porque el contenido llega despues
// (pedidos a la API): se recuerda la posicion de cada entrada del historial y
// al volver se reintenta hasta que la pagina tiene alto suficiente.
const posiciones = new Map();

function ManejoDelScroll() {
  const location = useLocation();
  const tipo = useNavigationType();
  const rutaAnterior = useRef(location.pathname);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }, []);

  // recuerda donde esta parado el usuario en esta entrada del historial.
  // useLayoutEffect y no useEffect: al cambiar de pagina el contenido nuevo
  // es mas corto y el navegador acomoda el scroll; si el listener viejo
  // seguia puesto, guardaba esa posicion acomodada en la pagina anterior
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
      // reintenta hasta llegar (o 6 s: la lista puede tardar en llegar de la
      // API); si el usuario scrollea o toca una tecla, para y lo deja ahi
      const limite = performance.now() + 6000;
      let cuadro = 0;
      let parar = false;
      const cortar = () => (parar = true);
      // ademas de llegar, espera a que la pagina deje de crecer: si arriba
      // termina de cargar algo (una grilla que pasa de 4 a 8 discos), el
      // navegador corre el scroll para compensar y te dejaba mas abajo
      let alto = 0;
      let quietoDesde = performance.now();
      const intentar = () => {
        if (parar) return;
        window.scrollTo(0, guardada);
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
    if (cambioDePagina) window.scrollTo(0, 0);
  }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps
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
