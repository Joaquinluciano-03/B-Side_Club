// Formulario de contacto -> POST /api/consultas (publico).
// Si llega con ?productoId=N la consulta queda asociada a ese disco.

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { get, post } from '../lib/api';
import { useStoreInfo } from '../lib/useStoreInfo';
import { mensajeDeError } from '../lib/formato';

const MAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contacto() {
  const [params] = useSearchParams();
  const productoId = params.get('productoId');
  const { info } = useStoreInfo();

  const [producto, setProducto] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // si viene por un producto, lo mostramos y precargamos el asunto
  useEffect(() => {
    if (!productoId) return;
    get(`/productos/${productoId}`)
      .then((p) => {
        setProducto(p);
        setForm((f) => ({
          ...f,
          asunto: f.asunto || `Consulta por ${p.nombre}`,
        }));
      })
      .catch(() => setProducto(null));
  }, [productoId]);

  function campo(nombre, valor) {
    setForm((f) => ({ ...f, [nombre]: valor }));
    // el error se limpia al corregir, no al reenviar: es menos frustrante
    if (errores[nombre]) setErrores((e) => ({ ...e, [nombre]: null }));
  }

  // Validamos igual que el backend para avisar antes de gastar un pedido:
  // el formulario publico tiene un limite de 5 envios por hora.
  function validar() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Decinos cómo te llamás.';
    if (!form.email.trim()) e.email = 'Necesitamos un mail para contestarte.';
    else if (!MAIL_REGEX.test(form.email)) e.email = 'Falta el dominio del email.';
    if (!form.asunto.trim()) e.asunto = 'Poné un asunto.';
    if (!form.mensaje.trim()) e.mensaje = 'Contanos qué buscás.';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function enviar(ev) {
    ev.preventDefault();
    setErrorGeneral(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      await post('/consultas', {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || undefined,
        asunto: form.asunto.trim(),
        mensaje: form.mensaje.trim(),
        productoId: productoId || undefined,
      });
      setEnviado(true);
    } catch (err) {
      setErrorGeneral(
        err.status === 429
          ? 'Ya enviaste varias consultas seguidas. Esperá un rato o escribinos por WhatsApp.'
          : mensajeDeError(err)
      );
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <main className="contenido">
        <div className="kicker">04 — Contacto</div>
        <div className="vacio" style={{ borderStyle: 'solid', borderColor: 'var(--ok-texto)' }}>
          <div className="vacio-titulo" style={{ color: 'var(--ok-texto)' }}>
            CONSULTA ENVIADA
          </div>
          <div className="vacio-texto">
            La recibimos y te contestamos al mail que nos dejaste. Si es urgente, escribinos por
            WhatsApp.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/catalogo" className="btn btn-primario">
              Seguir mirando el catálogo
            </Link>
            {info?.whatsapp && (
              <a
                href={`https://wa.me/${String(info.whatsapp).replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secundario"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="contenido">
      <div className="kicker">04 — Contacto</div>
      <h1 className="titulo">ESCRIBINOS</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: 28,
          alignItems: 'start',
        }}
        className="grilla-contacto"
      >
        <form onSubmit={enviar} className="card" noValidate>
          {producto && (
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                padding: 12,
                borderRadius: 'var(--r-control)',
                background: 'var(--gris-medio)',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '.16em',
                  color: 'var(--meta)',
                  textTransform: 'uppercase',
                }}
              >
                Consulta por
              </div>
              <Link to={`/producto/${producto.id}`} style={{ fontWeight: 800, fontSize: 14 }}>
                {producto.nombre}
              </Link>
            </div>
          )}

          {errorGeneral && <div className="aviso aviso-error">{errorGeneral}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className={`campo ${errores.nombre ? 'con-error' : ''}`}>
              <label htmlFor="c-nombre">Nombre</label>
              <input
                id="c-nombre"
                value={form.nombre}
                onChange={(e) => campo('nombre', e.target.value)}
                placeholder="Tu nombre"
              />
              {errores.nombre && <div className="campo-error">{errores.nombre}</div>}
            </div>

            <div className={`campo ${errores.email ? 'con-error' : ''}`}>
              <label htmlFor="c-email">Email</label>
              <input
                id="c-email"
                type="email"
                value={form.email}
                onChange={(e) => campo('email', e.target.value)}
                placeholder="vos@ejemplo.com"
              />
              {errores.email && <div className="campo-error">{errores.email}</div>}
            </div>

            <div className="campo">
              <label htmlFor="c-tel">Teléfono (opcional)</label>
              <input
                id="c-tel"
                value={form.telefono}
                onChange={(e) => campo('telefono', e.target.value)}
                placeholder="11 5555-0000"
              />
            </div>

            <div className={`campo ${errores.asunto ? 'con-error' : ''}`}>
              <label htmlFor="c-asunto">Asunto</label>
              <input
                id="c-asunto"
                value={form.asunto}
                onChange={(e) => campo('asunto', e.target.value)}
                placeholder="Busco un disco / Consulta por un precio"
              />
              {errores.asunto && <div className="campo-error">{errores.asunto}</div>}
            </div>

            <div className={`campo ${errores.mensaje ? 'con-error' : ''}`}>
              <label htmlFor="c-mensaje">Mensaje</label>
              <textarea
                id="c-mensaje"
                value={form.mensaje}
                onChange={(e) => campo('mensaje', e.target.value)}
                placeholder="Contanos qué estás buscando…"
              />
              {errores.mensaje && <div className="campo-error">{errores.mensaje}</div>}
            </div>

            <button type="submit" className="btn btn-primario" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar consulta'}
            </button>
          </div>
        </form>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="etiqueta">Dónde estamos</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
              {info?.direccion || 'Chacarita, Buenos Aires'}
            </div>
            {info?.horario && typeof info.horario === 'object' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {Object.entries(info.horario).map(([dia, hs]) => (
                  <div
                    key={dia}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 10,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'var(--meta)', textTransform: 'capitalize' }}>{dia}</span>
                    <span style={{ fontWeight: 700 }}>{String(hs)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="etiqueta">Más rápido</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
              {info?.whatsapp && (
                <a
                  href={`https://wa.me/${String(info.whatsapp).replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              )}
              {info?.instagram && (
                <a
                  href={`https://instagram.com/${String(info.instagram).replace(/^@/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              )}
              {info?.email && <a href={`mailto:${info.email}`}>{info.email}</a>}
              {info?.telefono && <span style={{ color: 'var(--meta)' }}>{info.telefono}</span>}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .grilla-contacto { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
