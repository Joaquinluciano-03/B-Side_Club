import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import LayoutAuth from '../../layouts/LayoutAuth';
import InputPassword from '../../componentes/InputPassword';
import { useAuth } from '../../lib/auth';
import { mensajeDeError } from '../../lib/formato';

export default function Login() {
  const { login, esStaff, cargando } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // si ya hay sesion, no tiene sentido mostrar el login
  if (!cargando && esStaff) return <Navigate to={location.state?.volverA || '/panel'} replace />;

  async function enviar(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(mail.trim(), password);
      navigate(location.state?.volverA || '/panel', { replace: true });
    } catch (err) {
      setError(
        err.status === 429
          ? 'Demasiados intentos fallidos. Esperá 15 minutos antes de volver a probar.'
          : mensajeDeError(err)
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <LayoutAuth
      titulo="Iniciar sesión"
      bajada="Entrá con tu cuenta del equipo para cargar discos y responder consultas."
    >
      <form onSubmit={enviar} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div className="aviso aviso-error">{error}</div>}

        <div className="campo">
          <label htmlFor="l-mail">Email</label>
          <input
            id="l-mail"
            type="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="l-pass">Contraseña</label>
          <InputPassword
            id="l-pass"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn btn-primario" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        <Link to="/recuperar" className="btn-enlace" style={{ alignSelf: 'center' }}>
          Olvidé mi contraseña
        </Link>
      </form>
    </LayoutAuth>
  );
}
