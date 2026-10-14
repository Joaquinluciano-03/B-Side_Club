// Alta de un integrante del equipo con el token de invitacion.
// El mail no se pide: lo define la invitacion, no la persona que la acepta.

import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import LayoutAuth from '../../layouts/LayoutAuth';
import { post } from '../../lib/api';
import { mensajeDeError } from '../../lib/formato';

export default function AceptarInvitacion() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', password: '' });
  const [errores, setErrores] = useState({});
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  function campo(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errores[k]) setErrores((e) => ({ ...e, [k]: null }));
  }

  if (!token) {
    return (
      <LayoutAuth titulo="LINK INCOMPLETO" bajada="A este link le falta el token de invitación.">
        <div className="aviso aviso-error">
          Copiá el link entero del mail, o pedile al equipo que te mande una invitación nueva.
        </div>
        <Link to="/login" className="btn btn-secundario" style={{ display: 'block', textAlign: 'center' }}>
          Ir al login
        </Link>
      </LayoutAuth>
    );
  }

  async function enviar(ev) {
    ev.preventDefault();
    setError(null);

    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido.';
    if (!form.apellido.trim()) e.apellido = 'Requerido.';
    if (!form.telefono.trim()) e.telefono = 'Requerido.';
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres.';
    setErrores(e);
    if (Object.keys(e).length) return;

    setEnviando(true);
    try {
      await post('/invitacion/aceptar', {
        token,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        telefono: form.telefono.trim(),
        password: form.password,
      });
      setListo(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      const porStatus = {
        404: 'No encontramos esta invitación. Pedí una nueva al equipo.',
        409: 'Esta invitación ya se usó o fue revocada.',
        410: 'Esta invitación venció (duran 7 días). Pedí una nueva.',
        429: 'Demasiados intentos. Esperá un rato.',
      };
      setError(porStatus[err.status] || mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <LayoutAuth titulo="CUENTA CREADA" bajada="Bienvenido al equipo.">
        <div className="aviso aviso-ok">Te llevamos al login para que entres…</div>
      </LayoutAuth>
    );
  }

  const campos = [
    { k: 'nombre', label: 'Nombre', tipo: 'text', autoComplete: 'given-name' },
    { k: 'apellido', label: 'Apellido', tipo: 'text', autoComplete: 'family-name' },
    { k: 'telefono', label: 'Teléfono', tipo: 'tel', autoComplete: 'tel' },
    { k: 'password', label: 'Contraseña', tipo: 'password', autoComplete: 'new-password' },
  ];

  return (
    <LayoutAuth
      titulo="SUMATE AL EQUIPO"
      bajada="Completá tus datos para crear la cuenta. El mail ya viene definido por la invitación."
    >
      <form onSubmit={enviar} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div className="aviso aviso-error">
            {error} <Link to="/login">Ir al login</Link>
          </div>
        )}

        {campos.map((c) => (
          <div key={c.k} className={`campo ${errores[c.k] ? 'con-error' : ''}`}>
            <label htmlFor={`inv-${c.k}`}>{c.label}</label>
            <input
              id={`inv-${c.k}`}
              type={c.tipo}
              value={form[c.k]}
              onChange={(e) => campo(c.k, e.target.value)}
              autoComplete={c.autoComplete}
            />
            {errores[c.k] && <div className="campo-error">{errores[c.k]}</div>}
            {c.k === 'password' && !errores.password && (
              <div className="campo-ayuda">Mínimo 6 caracteres.</div>
            )}
          </div>
        ))}

        <button type="submit" className="btn btn-primario" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear mi cuenta'}
        </button>
      </form>
    </LayoutAuth>
  );
}
