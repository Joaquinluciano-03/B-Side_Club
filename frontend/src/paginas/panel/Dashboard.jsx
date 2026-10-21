// Dashboard: el mostrador del local. Arriba lo urgente (consultas sin
// responder, con digitos tipo tubo nixie), los accesos de todos los dias y
// las cifras del catalogo. Todo sale de GET /api/dashboard/metricas y
// GET /api/consultas: no se muestran metricas que el backend no tiene.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChatCircleText, Storefront, CaretRight } from '@phosphor-icons/react';
import { get } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando, ErrorCarga } from '../../componentes/Estados';
import { useAuth } from '../../lib/auth';
import { etiquetaConsulta, formatearFecha, mensajeDeError } from '../../lib/formato';
import estilos from './Dashboard.module.css';

const CIFRAS = [
  { k: 'productosActivos', label: 'Publicados', a: '/panel/productos' },
  { k: 'productosInactivos', label: 'Dados de baja', a: '/panel/productos' },
  { k: 'productosSinStock', label: 'Sin stock', a: '/panel/productos', alerta: true },
  { k: 'invitacionesPendientes', label: 'Invitaciones abiertas', a: '/panel/invitaciones', soloAdmin: true },
  { k: 'totalUsuarios', label: 'En el equipo', a: '/panel/usuarios', soloAdmin: true },
];

// cada digito en su "tubo": siempre al menos dos, como un contador fisico
function Nixie({ valor }) {
  const digitos = String(valor).padStart(2, '0').split('');
  return (
    <span className={estilos.nixie} aria-hidden="true">
      {digitos.map((d, i) => (
        <span key={i} className={estilos.tubo}>
          {d}
        </span>
      ))}
    </span>
  );
}

export default function Dashboard() {
  const { usuario, puedeInvitar } = useAuth();
  const [metricas, setMetricas] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    setError(null);
    Promise.all([get('/dashboard/metricas'), get('/consultas')])
      .then(([m, c]) => {
        setMetricas(m);
        setConsultas(c.slice(0, 6));
      })
      .catch((err) => setError(mensajeDeError(err)));
  }, [intento]);

  // sin responder = sin leer + leidas: todo lo que todavia hay que contestar
  const pendientes = metricas?.consultasSinResponder ?? metricas?.consultasPendientes ?? 0;

  return (
    <>
      <CabeceraPanel kicker={`Hola, ${usuario?.nombre || ''}`} titulo="Mostrador" />
      <CuerpoPanel>
        {error ? (
          <ErrorCarga mensaje={error} onReintentar={() => setIntento((i) => i + 1)} />
        ) : !metricas ? (
          <Cargando />
        ) : (
          <div className={`${estilos.grilla} cascada`}>
            <section className={estilos.urgente} aria-label="Consultas sin responder">
              <Nixie valor={pendientes} />
              <div className={estilos.urgenteTexto}>
                <p className={estilos.urgenteTitulo}>
                  {pendientes === 0
                    ? 'No hay consultas sin responder'
                    : pendientes === 1
                      ? 'Consulta sin responder'
                      : 'Consultas sin responder'}
                </p>
                <p className={estilos.urgenteBajada}>
                  {pendientes === 0
                    ? 'Está todo al día. Las nuevas llegan desde el formulario del sitio.'
                    : 'Llegaron desde el formulario del sitio. Respondelas por mail o WhatsApp y marcalas como respondidas.'}
                </p>
              </div>
              {pendientes > 0 && (
                <Link to="/panel/consultas?estado=sin_responder" className={`btn btn-primario ${estilos.urgenteBoton}`}>
                  Responder
                </Link>
              )}
            </section>

            <nav className={estilos.accesos} aria-label="Accesos rápidos">
              <Link to="/panel/productos/nuevo" className={estilos.acceso}>
                <Plus size={22} weight="bold" aria-hidden="true" />
                <span>Cargar un producto</span>
                <CaretRight size={16} aria-hidden="true" className={estilos.accesoFlecha} />
              </Link>
              <Link to="/panel/consultas" className={estilos.acceso}>
                <ChatCircleText size={22} weight="duotone" aria-hidden="true" />
                <span>Ver todas las consultas</span>
                <CaretRight size={16} aria-hidden="true" className={estilos.accesoFlecha} />
              </Link>
              <Link to="/panel/info" className={estilos.acceso}>
                <Storefront size={22} weight="duotone" aria-hidden="true" />
                <span>Horarios y datos del local</span>
                <CaretRight size={16} aria-hidden="true" className={estilos.accesoFlecha} />
              </Link>
            </nav>

            <dl className={estilos.cifras}>
              {CIFRAS.filter((c) => !c.soloAdmin || puedeInvitar).map((c) => {
                const valor = metricas[c.k] ?? 0;
                return (
                  <Link key={c.k} to={c.a} className={estilos.cifra}>
                    <dt>{c.label}</dt>
                    <dd className={c.alerta && valor > 0 ? estilos.alerta : undefined}>{valor}</dd>
                  </Link>
                );
              })}
            </dl>

            <section className={estilos.ultimas} aria-labelledby="ultimas-titulo">
              <div className={estilos.ultimasCabecera}>
                <h2 id="ultimas-titulo">Últimas consultas</h2>
                <Link to="/panel/consultas" className="btn-enlace">
                  Ver todas
                </Link>
              </div>

              {consultas.length === 0 ? (
                <p className={estilos.sinConsultas}>Todavía no llegó ninguna consulta.</p>
              ) : (
                <ul className={estilos.lista}>
                  {consultas.map((c) => (
                    <li key={c.id}>
                      <Link to="/panel/consultas" className={estilos.consulta}>
                        <span className={estilos.consultaTexto}>
                          <span className={estilos.consultaNombre}>{c.nombre}</span>
                          <span className={estilos.consultaAsunto}>
                            {c.producto ? c.producto.nombre : c.asunto}
                          </span>
                        </span>
                        <span className={estilos.consultaFecha}>{formatearFecha(c.fecha)}</span>
                        <span className={`badge badge-${c.estado}`}>{etiquetaConsulta(c.estado)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </CuerpoPanel>
    </>
  );
}
