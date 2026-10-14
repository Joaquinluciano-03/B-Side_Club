// Bandeja de consultas. La lista es compacta y el detalle se abre en un modal,
// como lo diseña la demo: los mensajes son largos y adentro de la fila
// desarmaban el listado.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, patch, del, query } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando, ErrorCarga, Vacio } from '../../componentes/Estados';
import Confirmar from '../../componentes/Confirmar';
import Modal from '../../componentes/Modal';
import { useToast } from '../../lib/toast';
import {
  ESTADOS_CONSULTA,
  etiquetaConsulta,
  formatearFechaHora,
  mensajeDeError,
} from '../../lib/formato';

const chip = (activo) => ({
  background: activo ? 'var(--naranja)' : 'transparent',
  color: activo ? 'var(--tinta-sobre-naranja)' : 'var(--tinta-suave)',
  border: `1px solid ${activo ? 'var(--naranja)' : 'var(--borde-boton)'}`,
  fontWeight: 700,
  fontSize: 12,
  padding: '7px 14px',
  borderRadius: 999,
  cursor: 'pointer',
});

export default function Consultas() {
  const toast = useToast();

  const [estado, setEstado] = useState('');
  const [consultas, setConsultas] = useState(null);
  const [error, setError] = useState(null);
  const [abierta, setAbierta] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [recargar, setRecargar] = useState(0);

  useEffect(() => {
    let vigente = true;
    setConsultas(null);
    setError(null);
    get(`/consultas${query({ estado })}`)
      .then((c) => vigente && setConsultas(c))
      .catch((err) => vigente && setError(mensajeDeError(err)));
    return () => {
      vigente = false;
    };
  }, [estado, recargar]);

  // Al abrir una consulta sin leer la marcamos leída sola: es lo que uno
  // espera de una bandeja, y evita tener que acordarse de hacerlo a mano.
  async function abrir(c) {
    setAbierta(c);
    if (c.estado !== 'pendiente') return;
    try {
      await patch(`/consultas/${c.id}/estado`, { estado: 'leida' });
      setConsultas((prev) => prev.map((x) => (x.id === c.id ? { ...x, estado: 'leida' } : x)));
      setAbierta((a) => (a && a.id === c.id ? { ...a, estado: 'leida' } : a));
    } catch {
      // si falla no molestamos: el estado se puede cambiar a mano desde el modal
    }
  }

  async function cambiarEstado(c, nuevo) {
    try {
      await patch(`/consultas/${c.id}/estado`, { estado: nuevo });
      setConsultas((prev) =>
        // si hay un filtro puesto y la consulta ya no entra, la sacamos de la lista
        estado && nuevo !== estado
          ? prev.filter((x) => x.id !== c.id)
          : prev.map((x) => (x.id === c.id ? { ...x, estado: nuevo } : x))
      );
      setAbierta((a) => (a && a.id === c.id ? { ...a, estado: nuevo } : a));
      toast.exito(`Marcada como ${etiquetaConsulta(nuevo).toLowerCase()}.`);
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  async function borrar() {
    const c = aBorrar;
    setABorrar(null);
    try {
      await del(`/consultas/${c.id}`);
      setConsultas((prev) => prev.filter((x) => x.id !== c.id));
      setAbierta(null);
      toast.exito('Consulta eliminada.');
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  return (
    <>
      <CabeceraPanel kicker="Bandeja" titulo="CONSULTAS" />
      <CuerpoPanel>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 18 }}>
          <button style={chip(estado === '')} onClick={() => setEstado('')}>
            Todas
          </button>
          {ESTADOS_CONSULTA.map((e) => (
            <button key={e} style={chip(estado === e)} onClick={() => setEstado(e)}>
              {etiquetaConsulta(e)}
            </button>
          ))}
        </div>

        {error ? (
          <ErrorCarga mensaje={error} onReintentar={() => setRecargar((r) => r + 1)} />
        ) : !consultas ? (
          <Cargando />
        ) : consultas.length === 0 ? (
          <Vacio
            titulo="BANDEJA VACÍA"
            texto={estado ? 'Ninguna consulta con ese estado.' : 'Todavía no llegó ninguna consulta.'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {consultas.map((c) => (
              <button
                key={c.id}
                onClick={() => abrir(c)}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  flexWrap: 'wrap',
                  // la pendiente se marca con una barra naranja a la izquierda
                  borderLeft:
                    c.estado === 'pendiente'
                      ? '3px solid var(--naranja)'
                      : '1px solid var(--borde)',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{c.asunto}</div>
                  <div style={{ color: 'var(--tinta-dim)', fontSize: 13, marginTop: 3 }}>
                    {c.nombre} · {c.email} · {formatearFechaHora(c.fecha)}
                  </div>
                </div>
                <span className={`badge badge-${c.estado}`}>{etiquetaConsulta(c.estado)}</span>
              </button>
            ))}
          </div>
        )}

        {/* ---------- Detalle ---------- */}
        <Modal
          abierto={Boolean(abierta)}
          onCerrar={() => setAbierta(null)}
          kicker={abierta ? `#${abierta.id} · ${formatearFechaHora(abierta.fecha)}` : ''}
          titulo={abierta?.nombre}
          bajada={abierta ? [abierta.email, abierta.telefono].filter(Boolean).join(' · ') : ''}
        >
          {abierta && (
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                <span className="badge badge-neutro">{abierta.canal}</span>
                <span className={`badge badge-${abierta.estado}`}>
                  {etiquetaConsulta(abierta.estado)}
                </span>
              </div>

              <div className="etiqueta">Asunto</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>{abierta.asunto}</div>

              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--borde)',
                  borderRadius: 11,
                  padding: '16px 18px',
                  color: 'var(--tinta-cuerpo)',
                  fontSize: 15,
                  lineHeight: 1.65,
                  marginBottom: 18,
                  whiteSpace: 'pre-wrap',
                  textWrap: 'pretty',
                }}
              >
                {abierta.mensaje}
              </div>

              {abierta.producto && (
                <div style={{ fontSize: 13, color: 'var(--meta)', marginBottom: 18 }}>
                  Consulta por{' '}
                  <Link to={`/producto/${abierta.producto.id}`}>{abierta.producto.nombre}</Link>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a
                  href={`mailto:${abierta.email}?subject=${encodeURIComponent('Re: ' + abierta.asunto)}`}
                  className="btn btn-primario"
                  style={{ flex: 1, minWidth: 170, textAlign: 'center' }}
                >
                  Responder por mail
                </a>
                {abierta.estado !== 'respondida' && (
                  <button
                    className="btn btn-secundario"
                    onClick={() => cambiarEstado(abierta, 'respondida')}
                  >
                    Marcar respondida
                  </button>
                )}
                {abierta.estado !== 'pendiente' && (
                  <button
                    className="btn btn-secundario"
                    onClick={() => cambiarEstado(abierta, 'pendiente')}
                  >
                    Volver a pendiente
                  </button>
                )}
                <button className="btn btn-peligro" onClick={() => setABorrar(abierta)}>
                  Eliminar
                </button>
              </div>
            </>
          )}
        </Modal>

        <Confirmar
          abierto={Boolean(aBorrar)}
          titulo="¿Borrar la consulta?"
          texto="No se puede deshacer."
          onConfirmar={borrar}
          onCancelar={() => setABorrar(null)}
        />
      </CuerpoPanel>
    </>
  );
}
