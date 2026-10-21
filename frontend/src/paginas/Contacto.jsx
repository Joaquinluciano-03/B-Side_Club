// Contacto: canales rapidos (WhatsApp, Instagram, mail) y el formulario que
// guarda la consulta -> POST /api/consultas (publico, 5 envios por hora).
// Si llega con ?productoId=N la consulta queda asociada a ese disco.

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  WhatsappLogo,
  InstagramLogo,
  EnvelopeSimple,
  ArrowUpRight,
  MapPin,
  CheckCircle,
  X,
} from '@phosphor-icons/react';
import { get, post } from '../lib/api';
import { useStoreInfo } from '../lib/useStoreInfo';
import { normalizarHorario, horarioDeHoy } from '../lib/horario';
import { linkWhatsApp, linkInstagram, arrobaInstagram, linkMapa } from '../lib/contacto';
import { mensajeDeError, separarNombre } from '../lib/formato';
import estilos from './Contacto.module.css';

const MAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VACIO = { nombre: '', email: '', telefono: '', asunto: '', mensaje: '' };

function Campo({ id, label, error, opcional, children }) {
  return (
    <div className={`campo ${error ? 'con-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {opcional && <span className={estilos.opcional}> (opcional)</span>}
      </label>
      {children}
      {error && (
        <div className="campo-error" id={`${id}-error`}>
          {error}
        </div>
      )}
    </div>
  );
}

export default function Contacto() {
  const [params, setParams] = useSearchParams();
  const productoId = params.get('productoId');
  const { info } = useStoreInfo();
  const horario = normalizarHorario(info?.horario);
  const hoy = horarioDeHoy(info?.horario);

  const [producto, setProducto] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // si viene por un producto, lo mostramos y precargamos el asunto
  useEffect(() => {
    if (!productoId) {
      setProducto(null);
      return;
    }
    get(`/productos/${productoId}`)
      .then((p) => {
        setProducto(p);
        setForm((f) => ({ ...f, asunto: f.asunto || `Consulta por ${p.nombre}` }));
      })
      .catch(() => setProducto(null));
  }, [productoId]);

  function campo(nombre, valor) {
    setForm((f) => ({ ...f, [nombre]: valor }));
    // el error se limpia al corregir, no al reenviar: es menos frustrante
    if (errores[nombre]) setErrores((e) => ({ ...e, [nombre]: null }));
  }

  function quitarProducto() {
    setProducto(null);
    setForm((f) => ({ ...f, asunto: '' }));
    const nuevos = new URLSearchParams(params);
    nuevos.delete('productoId');
    setParams(nuevos, { replace: true });
  }

  // Validamos igual que el backend para avisar antes de gastar un pedido:
  // el formulario publico tiene un limite de 5 envios por hora.
  function validar() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Decinos cómo te llamás.';
    if (!form.email.trim()) e.email = 'Necesitamos un mail para contestarte.';
    else if (!MAIL_REGEX.test(form.email.trim())) e.email = 'Revisá el mail: le falta algo (por ejemplo, el @ o el dominio).';
    if (!form.asunto.trim()) e.asunto = 'Poné un asunto corto.';
    if (!form.mensaje.trim()) e.mensaje = 'Contanos qué buscás.';
    setErrores(e);
    // el foco va al primer campo con error, para no tener que buscarlo
    const primero = ['nombre', 'email', 'asunto', 'mensaje'].find((k) => e[k]);
    if (primero) document.getElementById(`c-${primero}`)?.focus();
    return !primero;
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
        productoId: producto ? producto.id : undefined,
      });
      setEnviado(true);
      window.scrollTo(0, 0);
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

  const whatsapp = linkWhatsApp(
    info?.whatsapp,
    producto ? `Hola B-Side Club! Les consulto por "${producto.nombre}".` : 'Hola B-Side Club!'
  );
  const instagram = linkInstagram(info?.instagram);

  if (enviado) {
    return (
      <main className={estilos.pagina}>
        <div className={estilos.enviado} role="status">
          <CheckCircle size={48} weight="duotone" className={estilos.enviadoIcono} aria-hidden="true" />
          <h1 className={estilos.enviadoTitulo}>Consulta enviada</h1>
          <p>
            La recibimos y te contestamos a <strong>{form.email.trim()}</strong>. Si es urgente,
            escribinos por WhatsApp.
          </p>
          <div className={estilos.enviadoAcciones}>
            <Link to="/catalogo" className="btn btn-primario">
              Seguir mirando el catálogo
            </Link>
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noreferrer" className="btn btn-secundario">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={estilos.pagina}>
      <div className={estilos.grilla}>
        <div className={`${estilos.lado} cascada`}>
          <h1 className={estilos.titulo}>Escribinos</h1>
          <p className={estilos.bajada}>
            Para reservar un disco, pedir uno que no está o vendernos tu colección. Por WhatsApp te
            contestamos más rápido.
          </p>

          <ul className={estilos.canales}>
            {whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noreferrer">
                  <WhatsappLogo size={26} weight="duotone" aria-hidden="true" />
                  <span>
                    <strong>WhatsApp</strong>
                    <small>{info.whatsapp}</small>
                  </span>
                  <ArrowUpRight size={18} weight="bold" aria-hidden="true" className={estilos.flecha} />
                </a>
              </li>
            )}
            {instagram && (
              <li>
                <a href={instagram} target="_blank" rel="noreferrer">
                  <InstagramLogo size={26} weight="duotone" aria-hidden="true" />
                  <span>
                    <strong>Instagram</strong>
                    <small>{arrobaInstagram(info.instagram)}</small>
                  </span>
                  <ArrowUpRight size={18} weight="bold" aria-hidden="true" className={estilos.flecha} />
                </a>
              </li>
            )}
            {info?.email && (
              <li>
                <a href={`mailto:${info.email}`}>
                  <EnvelopeSimple size={26} weight="duotone" aria-hidden="true" />
                  <span>
                    <strong>Mail</strong>
                    <small>{info.email}</small>
                  </span>
                  <ArrowUpRight size={18} weight="bold" aria-hidden="true" className={estilos.flecha} />
                </a>
              </li>
            )}
          </ul>

          {info?.direccion && (
            <div className={estilos.local}>
              <a href={linkMapa(info.direccion)} target="_blank" rel="noreferrer" className={estilos.direccion}>
                <MapPin size={20} weight="duotone" aria-hidden="true" />
                {info.direccion}
              </a>
              {horario.length > 0 && (
                <dl className={estilos.horario}>
                  {horario.map((fila) => (
                    <div key={fila.label} className={fila.label === hoy?.label ? estilos.hoy : undefined}>
                      <dt>{fila.label}</dt>
                      <dd>{fila.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
        </div>

        <form onSubmit={enviar} className={estilos.formulario} noValidate aria-labelledby="form-titulo">
          <h2 id="form-titulo" className={estilos.formTitulo}>
            Dejanos un mensaje
          </h2>

          {producto && (
            <div className={estilos.producto}>
              <span>
                Consulta por{' '}
                <Link to={`/producto/${producto.id}`}>{separarNombre(producto.nombre).titulo}</Link>
              </span>
              <button type="button" onClick={quitarProducto} aria-label="Quitar el disco de la consulta">
                <X size={14} weight="bold" />
              </button>
            </div>
          )}

          {errorGeneral && (
            <div className="aviso aviso-error" role="alert">
              {errorGeneral}
            </div>
          )}

          <div className={estilos.dosColumnas}>
            <Campo id="c-nombre" label="Nombre" error={errores.nombre}>
              <input
                id="c-nombre"
                value={form.nombre}
                onChange={(e) => campo('nombre', e.target.value)}
                autoComplete="name"
                aria-invalid={Boolean(errores.nombre)}
                aria-describedby={errores.nombre ? 'c-nombre-error' : undefined}
              />
            </Campo>
            <Campo id="c-telefono" label="Teléfono" opcional>
              <input
                id="c-telefono"
                type="tel"
                value={form.telefono}
                onChange={(e) => campo('telefono', e.target.value)}
                autoComplete="tel"
                inputMode="tel"
              />
            </Campo>
          </div>

          <Campo id="c-email" label="Email" error={errores.email}>
            <input
              id="c-email"
              type="email"
              value={form.email}
              onChange={(e) => campo('email', e.target.value)}
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(errores.email)}
              aria-describedby={errores.email ? 'c-email-error' : undefined}
            />
          </Campo>

          <Campo id="c-asunto" label="Asunto" error={errores.asunto}>
            <input
              id="c-asunto"
              value={form.asunto}
              onChange={(e) => campo('asunto', e.target.value)}
              placeholder="Busco un disco, reservar, vender mi colección…"
              aria-invalid={Boolean(errores.asunto)}
              aria-describedby={errores.asunto ? 'c-asunto-error' : undefined}
            />
          </Campo>

          <Campo id="c-mensaje" label="Mensaje" error={errores.mensaje}>
            <textarea
              id="c-mensaje"
              value={form.mensaje}
              onChange={(e) => campo('mensaje', e.target.value)}
              placeholder="Contanos qué estás buscando…"
              aria-invalid={Boolean(errores.mensaje)}
              aria-describedby={errores.mensaje ? 'c-mensaje-error' : undefined}
            />
          </Campo>

          <button type="submit" className={`btn btn-primario ${estilos.enviar}`} disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar consulta'}
          </button>
          {/* sale del horario cargado en el panel, no de un texto fijo */}
          <p className={estilos.nota}>
            {hoy ? `Hoy el local está: ${hoy.value}. ` : ''}Te contestamos al mail que nos dejes.
          </p>
        </form>
      </div>
    </main>
  );
}
