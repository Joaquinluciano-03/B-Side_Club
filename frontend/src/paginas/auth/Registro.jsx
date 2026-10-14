// Registro: solo sirve UNA vez, para crear al dueño (super_admin). El resto
// del equipo entra por invitacion. Si ya existe, el backend contesta 409.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LayoutAuth from '../../layouts/LayoutAuth';
import { useAuth } from '../../lib/auth';
import { mensajeDeError } from '../../lib/formato';

const MAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    mail: '',
    telefono: '',
    password: '',
  });
  const [errores, setErrores] = useState({});
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function campo(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errores[k]) setErrores((e) => ({ ...e, [k]: null }));
  }

  function validar() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido.';
    if (!form.apellido.trim()) e.apellido = 'Requerido.';
    if (!form.mail.trim()) e.mail = 'Requerido.';
    else if (!MAIL_REGEX.test(form.mail)) e.mail = 'Falta el dominio del email.';
    if (!form.telefono.trim()) e.telefono = 'Requerido.';
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres.';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function enviar(ev) {
    ev.preventDefault();
    setError(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      await registrar({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        mail: form.mail.trim(),
        telefono: form.telefono.trim(),
        password: form.password,
      });
      navigate('/panel', { replace: true });
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  const campos = [
    { k: 'nombre', label: 'Nombre', tipo: 'text', autoComplete: 'given-name' },
    { k: 'apellido', label: 'Apellido', tipo: 'text', autoComplete: 'family-name' },
    { k: 'mail', label: 'Email', tipo: 'email', autoComplete: 'email' },
    { k: 'telefono', label: 'Teléfono', tipo: 'tel', autoComplete: 'tel' },
    { k: 'password', label: 'Contraseña', tipo: 'password', autoComplete: 'new-password' },
  ];

  return (
    <LayoutAuth
      titulo="REGISTRAR EL LOCAL"
      bajada="Crea la cuenta del dueño. Se hace una sola vez: después el equipo se suma por invitación."
      pie={
        <>
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </>
      }
    >
      <form onSubmit={enviar} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div className="aviso aviso-error">{error}</div>}

        {campos.map((c) => (
          <div key={c.k} className={`campo ${errores[c.k] ? 'con-error' : ''}`}>
            <label htmlFor={`r-${c.k}`}>{c.label}</label>
            <input
              id={`r-${c.k}`}
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
          {enviando ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
    </LayoutAuth>
  );
}
