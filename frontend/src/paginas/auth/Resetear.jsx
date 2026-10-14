// Elegir contraseña nueva con el token que llego por mail.
// El backend distingue tres fallas del token y conviene no mezclarlas:
// 400 invalido, 409 ya usado, 410 vencido.

import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import LayoutAuth from '../../layouts/LayoutAuth';
import { post } from '../../lib/api';
import { mensajeDeError } from '../../lib/formato';

export default function Resetear() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState(null);
  const [errorCampo, setErrorCampo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  if (!token) {
    return (
      <LayoutAuth titulo="LINK INCOMPLETO" bajada="A este link le falta el token.">
        <div className="aviso aviso-error">
          Copiá el link entero del mail, o pedí uno nuevo desde "olvidé mi contraseña".
        </div>
        <Link to="/recuperar" className="btn btn-primario" style={{ display: 'block', textAlign: 'center' }}>
          Pedir uno nuevo
        </Link>
      </LayoutAuth>
    );
  }

  async function enviar(e) {
    e.preventDefault();
    setError(null);
    setErrorCampo(null);

    if (password.length < 6) {
      setErrorCampo('La contraseña necesita al menos 6 caracteres.');
      return;
    }
    if (password !== repetir) {
      setErrorCampo('Las dos contraseñas no coinciden.');
      return;
    }

    setEnviando(true);
    try {
      await post('/auth/reset-password', { token, password });
      setListo(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      const porStatus = {
        400: 'Este link no es válido. Pedí uno nuevo.',
        409: 'Este link ya se usó. Pedí uno nuevo.',
        410: 'Este link venció (duran 30 minutos). Pedí uno nuevo.',
        429: 'Demasiados intentos. Esperá un rato.',
      };
      setError(porStatus[err.status] || mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <LayoutAuth titulo="LISTO" bajada="Ya podés entrar con la contraseña nueva.">
        <div className="aviso aviso-ok">Te llevamos al login…</div>
      </LayoutAuth>
    );
  }

  return (
    <LayoutAuth titulo="NUEVA CONTRASEÑA" bajada="Elegí una contraseña para tu cuenta.">
      <form onSubmit={enviar} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div className="aviso aviso-error">
            {error} <Link to="/recuperar">Pedir uno nuevo</Link>
          </div>
        )}

        <div className={`campo ${errorCampo ? 'con-error' : ''}`}>
          <label htmlFor="rs-pass">Contraseña nueva</label>
          <input
            id="rs-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <div className="campo-ayuda">Mínimo 6 caracteres.</div>
        </div>

        <div className={`campo ${errorCampo ? 'con-error' : ''}`}>
          <label htmlFor="rs-rep">Repetir contraseña</label>
          <input
            id="rs-rep"
            type="password"
            value={repetir}
            onChange={(e) => setRepetir(e.target.value)}
            autoComplete="new-password"
          />
          {errorCampo && <div className="campo-error">{errorCampo}</div>}
        </div>

        <button type="submit" className="btn btn-primario" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </LayoutAuth>
  );
}
