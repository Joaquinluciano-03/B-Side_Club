// Pedir el link para resetear la contraseña.
// El backend contesta siempre lo mismo exista o no el mail, para no delatar
// que cuentas estan registradas: la pantalla replica ese mensaje tal cual.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import LayoutAuth from '../../layouts/LayoutAuth';
import { post } from '../../lib/api';
import { mensajeDeError } from '../../lib/formato';

export default function Recuperar() {
  const [mail, setMail] = useState('');
  const [listo, setListo] = useState(false);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await post('/auth/forgot-password', { mail: mail.trim() });
      setListo(true);
    } catch (err) {
      setError(
        err.status === 429
          ? 'Pediste el link varias veces seguidas. Esperá un rato antes de volver a intentar.'
          : mensajeDeError(err)
      );
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <LayoutAuth titulo="REVISÁ TU MAIL" bajada="Si ese mail está registrado, te mandamos un link.">
        <div className="aviso aviso-ok">
          El link vence en 30 minutos. Si no te llega, fijate en spam o pedile a alguien del equipo
          que te reenvíe una invitación.
        </div>
        <Link to="/login" className="btn btn-secundario" style={{ display: 'block', textAlign: 'center' }}>
          Volver al login
        </Link>
      </LayoutAuth>
    );
  }

  return (
    <LayoutAuth
      titulo="RECUPERAR CONTRASEÑA"
      bajada="Te mandamos un link para elegir una nueva."
      pie={<Link to="/login">Volver al login</Link>}
    >
      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div className="aviso aviso-error">{error}</div>}
        <div className="campo">
          <label htmlFor="rec-mail">Email</label>
          <input
            id="rec-mail"
            type="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <button type="submit" className="btn btn-primario" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Mandame el link'}
        </button>
      </form>
    </LayoutAuth>
  );
}
