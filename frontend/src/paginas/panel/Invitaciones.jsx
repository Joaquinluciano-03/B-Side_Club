// Invitaciones al equipo. Solo super_admin y administrador llegan hasta aca
// (lo filtra el sidebar y lo vuelve a chequear el backend).
// Ojo: solo puede haber UNA invitacion pendiente por mail; si ya hay una, el
// backend contesta 409 y hay que revocarla antes de generar otra.

import { useEffect, useState } from 'react';
import { get, post, del } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando, ErrorCarga, Vacio } from '../../componentes/Estados';
import Confirmar from '../../componentes/Confirmar';
import ModalPlantillaEmail from '../../componentes/ModalPlantillaEmail';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';
import { formatearFecha, etiquetaRol, mensajeDeError } from '../../lib/formato';

const MAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['vendedor', 'administrador'];

export default function Invitaciones() {
  const { usuario } = useAuth();
  const toast = useToast();

  const [invitaciones, setInvitaciones] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('vendedor');
  const [errorCampo, setErrorCampo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [aRevocar, setARevocar] = useState(null);
  const [verPlantilla, setVerPlantilla] = useState(false);
  const [recargar, setRecargar] = useState(0);

  useEffect(() => {
    setError(null);
    get('/invitacion')
      .then(setInvitaciones)
      .catch((err) => setError(mensajeDeError(err)));
  }, [recargar]);

  async function invitar(ev) {
    ev.preventDefault();
    setErrorCampo(null);

    if (!MAIL_REGEX.test(email.trim())) {
      setErrorCampo('Escribí un mail válido.');
      return;
    }

    const destino = email.trim();
    setEnviando(true);
    try {
      await post('/invitacion', { email: destino, rol });
      setEmail('');
      toast.exito(`Invitación enviada a ${destino}. El link vence en 7 días.`);
      setRecargar((r) => r + 1);
    } catch (err) {
      // el 409 pide una acción concreta (revocar la anterior), así que va
      // al campo y no a un toast que se va solo
      if (err.status === 409) setErrorCampo(mensajeDeError(err));
      else toast.error(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  async function revocar() {
    const inv = aRevocar;
    setARevocar(null);
    try {
      await del(`/invitacion/${inv.id}`);
      toast.exito(`Invitación a ${inv.email} revocada.`);
      setRecargar((r) => r + 1);
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  const vencida = (inv) => inv.estado === 'pendiente' && new Date(inv.expiraEn) < new Date();

  return (
    <>
      <CabeceraPanel kicker="Equipo" titulo="INVITACIONES" />
      <CuerpoPanel>
        <form onSubmit={invitar} className="card" style={{ marginBottom: 18, maxWidth: 620 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div className="etiqueta">Invitar a alguien</div>
            <button type="button" className="btn-enlace" onClick={() => setVerPlantilla(true)}>
              Ver el mail que recibe →
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className={`campo ${errorCampo ? 'con-error' : ''}`} style={{ flex: 1, minWidth: 220 }}>
              <label htmlFor="inv-mail">Email</label>
              <input
                id="inv-mail"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorCampo(null);
                }}
                placeholder="nombre@ejemplo.com"
              />
              {errorCampo && <div className="campo-error">{errorCampo}</div>}
            </div>

            <div className="campo" style={{ minWidth: 170 }}>
              <label htmlFor="inv-rol">Rol</label>
              <select id="inv-rol" value={rol} onChange={(e) => setRol(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {etiquetaRol(r)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primario"
              disabled={enviando}
              style={{ marginTop: 23 }}
            >
              {enviando ? 'Enviando…' : 'Invitar'}
            </button>
          </div>
          <div className="campo-ayuda" style={{ marginTop: 10 }}>
            Si el backend no tiene SMTP configurado, el link se imprime en su consola en vez de
            enviarse por mail.
          </div>
        </form>

        {error ? (
          <ErrorCarga mensaje={error} onReintentar={() => setRecargar((r) => r + 1)} />
        ) : !invitaciones ? (
          <Cargando />
        ) : invitaciones.length === 0 ? (
          <Vacio titulo="SIN INVITACIONES" texto="Todavía no invitaste a nadie." />
        ) : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Vence</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invitaciones.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700 }}>{inv.email}</td>
                    <td data-etiqueta="Rol" style={{ color: 'var(--tinta-dim)' }}>
                      {etiquetaRol(inv.rol)}
                    </td>
                    <td data-etiqueta="Estado">
                      <span
                        className={`badge badge-${vencida(inv) ? 'revocada' : inv.estado === 'pendiente' ? 'pendiente' : inv.estado}`}
                      >
                        {vencida(inv) ? 'Vencida' : inv.estado}
                      </span>
                    </td>
                    <td data-etiqueta="Vence" className="mono" style={{ whiteSpace: 'nowrap' }}>
                      {formatearFecha(inv.expiraEn)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {inv.estado === 'pendiente' && (
                        <button className="btn btn-peligro btn-chico" onClick={() => setARevocar(inv)}>
                          Revocar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ModalPlantillaEmail
          abierto={verPlantilla}
          onCerrar={() => setVerPlantilla(false)}
          invitadoPor={usuario ? `${usuario.nombre} ${usuario.apellido}` : null}
          email={email.trim() || null}
        />

        <Confirmar
          abierto={Boolean(aRevocar)}
          titulo="¿Revocar la invitación?"
          texto={`El link que recibió ${aRevocar?.email} deja de funcionar. Después vas a poder invitarlo de nuevo.`}
          textoBoton="Revocar"
          onConfirmar={revocar}
          onCancelar={() => setARevocar(null)}
        />
      </CuerpoPanel>
    </>
  );
}
