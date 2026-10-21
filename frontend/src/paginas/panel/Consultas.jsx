// Bandeja de consultas. La lista es compacta y el detalle se abre en un modal,
// como lo diseña la demo: los mensajes son largos y adentro de la fila
// desarmaban el listado.

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EnvelopeSimple, WhatsappLogo } from '@phosphor-icons/react';
import { get, patch, del, query } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando, ErrorCarga, Vacio } from '../../componentes/Estados';
import Confirmar from '../../componentes/Confirmar';
import Modal from '../../componentes/Modal';
import Segmentos from '../../componentes/Segmentos';
import { useToast } from '../../lib/toast';
import { linkWhatsApp } from '../../lib/contacto';
import {
  ESTADOS_CONSULTA,
  etiquetaConsulta,
  formatearFechaHora,
  mensajeDeError,
} from '../../lib/formato';
import estilos from './Consultas.module.css';

// "Sin responder" junta las pendientes y las leidas: lo que falta contestar
// (es lo que cuenta el inicio del panel)
const SIN_RESPONDER = ['pendiente', 'leida'];
const FILTROS = [
  { valor: '', label: 'Todas' },
  { valor: 'sin_responder', label: 'Sin responder' },
  ...ESTADOS_CONSULTA.map((e) => ({ valor: e, label: etiquetaConsulta(e) })),
];
const VALORES_FILTRO = FILTROS.map((f) => f.valor);

export default function Consultas() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  // el filtro vive en la URL: el dashboard puede abrir la bandeja ya filtrada
  const estado = VALORES_FILTRO.includes(params.get('estado')) ? params.get('estado') : '';
  // ¿una consulta en este estado entra en el filtro elegido?
  const entraEnFiltro = (e) => !estado || (estado === 'sin_responder' ? SIN_RESPONDER.includes(e) : e === estado);
  function setEstado(nuevo) {
    setParams(nuevo ? { estado: nuevo } : {}, { replace: true });
  }
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
        !entraEnFiltro(nuevo)
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
      <CabeceraPanel kicker="Bandeja" titulo="Consultas" />
      <CuerpoPanel>
        <div className={estilos.filtros}>
          <Segmentos
            id="consultas"
            etiqueta="Filtrar por estado"
            opciones={FILTROS}
            valor={estado}
            onCambiar={setEstado}
          />
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
          <ul className={estilos.bandeja}>
            {consultas.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => abrir(c)}
                  className={`${estilos.fila} ${c.estado === 'pendiente' ? estilos.sinLeer : ''}`}
                >
                  {/* el punto naranja marca las que nadie abrio todavia */}
                  <span className={estilos.punto} aria-hidden="true" />
                  <span className={estilos.remitente}>{c.nombre}</span>
                  <span className={estilos.asunto}>
                    {c.asunto}
                    <span className={estilos.extracto}> · {c.mensaje}</span>
                  </span>
                  <span className={estilos.fecha}>{formatearFechaHora(c.fecha)}</span>
                  <span className={`badge badge-${c.estado}`}>{etiquetaConsulta(c.estado)}</span>
                </button>
              </li>
            ))}
          </ul>
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
              <div className={estilos.detalleEstado}>
                <span className={`badge badge-${abierta.estado}`}>
                  {etiquetaConsulta(abierta.estado)}
                </span>
              </div>

              <h3 className={estilos.detalleAsunto}>{abierta.asunto}</h3>

              <p className={estilos.mensaje}>{abierta.mensaje}</p>

              {abierta.producto && (
                <p className={estilos.detalleProducto}>
                  Consulta por{' '}
                  <Link to={`/producto/${abierta.producto.id}`}>{abierta.producto.nombre}</Link>
                </p>
              )}

              <div className={estilos.detalleAcciones}>
                <a
                  href={`mailto:${abierta.email}?subject=${encodeURIComponent('Re: ' + abierta.asunto)}`}
                  className="btn btn-primario"
                >
                  <EnvelopeSimple size={18} weight="bold" /> Responder por mail
                </a>
                {abierta.telefono && (
                  <a
                    href={linkWhatsApp(abierta.telefono, `Hola ${abierta.nombre}! Te escribimos de B-Side Club por tu consulta: "${abierta.asunto}".`)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secundario"
                  >
                    <WhatsappLogo size={18} weight="bold" /> WhatsApp
                  </a>
                )}
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
