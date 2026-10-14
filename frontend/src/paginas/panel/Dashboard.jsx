// Dashboard: metricas de GET /api/dashboard/metricas + ultimas consultas.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando, ErrorCarga } from '../../componentes/Estados';
import { useAuth } from '../../lib/auth';
import { etiquetaConsulta, formatearFecha, mensajeDeError } from '../../lib/formato';

const TARJETAS = [
  { k: 'consultasPendientes', label: 'Consultas pendientes', a: '/panel/consultas', destacar: true },
  { k: 'productosActivos', label: 'Productos publicados', a: '/panel/productos' },
  { k: 'productosInactivos', label: 'Dados de baja', a: '/panel/productos' },
  { k: 'productosSinStock', label: 'Sin stock', a: '/panel/productos' },
  { k: 'invitacionesPendientes', label: 'Invitaciones abiertas', a: '/panel/invitaciones' },
  { k: 'totalUsuarios', label: 'Gente en el equipo', a: '/panel/usuarios' },
];

export default function Dashboard() {
  const { usuario } = useAuth();
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

  return (
    <>
      <CabeceraPanel kicker={`Hola, ${usuario?.nombre || ''}`} titulo="DASHBOARD" />
      <CuerpoPanel>
        {error ? (
          <ErrorCarga mensaje={error} onReintentar={() => setIntento((i) => i + 1)} />
        ) : !metricas ? (
          <Cargando />
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: 14,
                marginBottom: 18,
              }}
            >
              {TARJETAS.map((t) => {
                const valor = metricas[t.k] ?? 0;
                const resaltar = t.destacar && valor > 0;
                return (
                  <Link
                    key={t.k}
                    to={t.a}
                    className="card"
                    style={{
                      padding: 20,
                      color: 'inherit',
                      borderColor: resaltar ? 'var(--naranja)' : 'var(--borde)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 10,
                        letterSpacing: '.18em',
                        color: 'var(--tinta-dim)',
                        marginBottom: 12,
                        textTransform: 'uppercase',
                      }}
                    >
                      {t.label}
                    </div>
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: 900,
                        lineHeight: 1,
                        color: resaltar ? 'var(--naranja)' : 'var(--tinta)',
                      }}
                    >
                      {valor}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    letterSpacing: '.2em',
                    color: 'var(--tinta-dim)',
                    textTransform: 'uppercase',
                  }}
                >
                  Últimas consultas
                </div>
                <Link to="/panel/consultas" className="btn-enlace">
                  Ver todas
                </Link>
              </div>

              {consultas.length === 0 ? (
                <div style={{ color: 'var(--meta)', fontSize: 14, padding: '18px 0' }}>
                  Todavía no llegó ninguna consulta.
                </div>
              ) : (
                consultas.map((c) => (
                  <Link
                    key={c.id}
                    to="/panel/consultas"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 0',
                      borderBottom: '1px solid #c2cacd',
                      color: 'inherit',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.nombre}
                      </div>
                      <div
                        style={{
                          color: 'var(--tinta-dim)',
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.producto ? c.producto.nombre : c.asunto} · {formatearFecha(c.fecha)}
                      </div>
                    </div>
                    <span className={`badge badge-${c.estado}`}>{etiquetaConsulta(c.estado)}</span>
                  </Link>
                ))
              )}
            </div>
          </>
        )}
      </CuerpoPanel>
    </>
  );
}
