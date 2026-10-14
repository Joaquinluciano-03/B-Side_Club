// Datos personales del usuario logueado (PUT /api/auth/me).
// La contraseña se manda solo si se escribio algo: si va vacia, el backend
// no la toca.

import { useState } from 'react';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';
import { etiquetaRol, mensajeDeError } from '../../lib/formato';

const MAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Perfil() {
  const { usuario, actualizarPerfil } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    nombre: usuario?.nombre ?? '',
    apellido: usuario?.apellido ?? '',
    mail: usuario?.mail ?? '',
    telefono: usuario?.telefono ?? '',
  });
  const [password, setPassword] = useState('');
  const [repetir, setRepetir] = useState('');
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  function campo(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errores[k]) setErrores((e) => ({ ...e, [k]: null }));
  }

  async function guardar(ev) {
    ev.preventDefault();

    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido.';
    if (!form.apellido.trim()) e.apellido = 'Requerido.';
    if (!MAIL_REGEX.test(form.mail)) e.mail = 'Mail inválido.';
    if (!form.telefono.trim()) e.telefono = 'Requerido.';
    if (password && password.length < 6) e.password = 'Mínimo 6 caracteres.';
    if (password && password !== repetir) e.repetir = 'No coinciden.';
    setErrores(e);
    if (Object.keys(e).length) return;

    setGuardando(true);
    try {
      await actualizarPerfil({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        mail: form.mail.trim(),
        telefono: form.telefono.trim(),
        ...(password ? { password } : {}),
      });
      setPassword('');
      setRepetir('');
      toast.exito(password ? 'Datos y contraseña actualizados.' : 'Datos actualizados.');
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  const campos = [
    { k: 'nombre', label: 'Nombre' },
    { k: 'apellido', label: 'Apellido' },
    { k: 'mail', label: 'Email', tipo: 'email' },
    { k: 'telefono', label: 'Teléfono', tipo: 'tel' },
  ];

  return (
    <>
      <CabeceraPanel kicker={etiquetaRol(usuario?.rol)} titulo="MI PERFIL" />
      <CuerpoPanel>
        <form
          onSubmit={guardar}
          noValidate
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: 18,
            alignItems: 'start',
            maxWidth: 800,
          }}
        >
          <div className="card">
            <div className="etiqueta">Mis datos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {campos.map((c) => (
                <div key={c.k} className={`campo ${errores[c.k] ? 'con-error' : ''}`}>
                  <label htmlFor={`pf-${c.k}`}>{c.label}</label>
                  <input
                    id={`pf-${c.k}`}
                    type={c.tipo || 'text'}
                    value={form[c.k]}
                    onChange={(e) => campo(c.k, e.target.value)}
                  />
                  {errores[c.k] && <div className="campo-error">{errores[c.k]}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="etiqueta">Cambiar contraseña</div>
            <p style={{ color: 'var(--meta)', fontSize: 13, margin: '0 0 16px' }}>
              Dejalo vacío si no querés cambiarla.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className={`campo ${errores.password ? 'con-error' : ''}`}>
                <label htmlFor="pf-pass">Contraseña nueva</label>
                <input
                  id="pf-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                {errores.password && <div className="campo-error">{errores.password}</div>}
              </div>

              <div className={`campo ${errores.repetir ? 'con-error' : ''}`}>
                <label htmlFor="pf-rep">Repetir</label>
                <input
                  id="pf-rep"
                  type="password"
                  value={repetir}
                  onChange={(e) => setRepetir(e.target.value)}
                  autoComplete="new-password"
                />
                {errores.repetir && <div className="campo-error">{errores.repetir}</div>}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primario"
              disabled={guardando}
              style={{ marginTop: 20, width: '100%' }}
            >
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </CuerpoPanel>
    </>
  );
}
