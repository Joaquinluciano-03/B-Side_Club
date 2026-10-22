// Vista previa del mail de invitación, tal como lo diseña la demo.
//
// Sirve para algo concreto: cuando el backend no tiene SMTP configurado el
// mail no se manda, se imprime en su consola. Esta pantalla es la unica forma
// de ver qué recibe la persona invitada.
//
// OJO: esto es un ESPEJO de la plantilla real, que vive en
// src/config/mailer.js (el backend es quien manda el mail). Si cambia una,
// hay que cambiar la otra.

import Modal from './Modal';
import { useDatosDelLocal, partirNombre } from '../lib/useStoreInfo';

export default function ModalPlantillaEmail({ abierto, onCerrar, invitadoPor, email, link }) {
  // nombre y zona del local salen de la base, igual que en el mail real
  const { nombre, zona } = useDatosDelLocal();
  const { resto, ultima } = partirNombre(nombre);
  const linkMuestra = link || `${window.location.origin}/aceptar-invitacion?token=…`;

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      kicker="Plantilla del email"
      titulo={`Te invitaron al panel de ${nombre}`}
      bajada={email ? `Así lo va a recibir ${email}` : 'Así lo recibe la persona invitada'}
      ancho={560}
    >
      <div
        style={{
          background: 'var(--carbon)',
          borderRadius: 'var(--r-card)',
          overflow: 'hidden',
          border: '1px solid var(--borde-oscuro)',
        }}
      >
        <div
          style={{
            padding: '30px 28px 24px',
            textAlign: 'center',
            borderBottom: '1px solid var(--borde-oscuro)',
          }}
        >
          <img src="/logo-256.png" alt="" style={{ width: 56, height: 56, marginBottom: 14 }} />
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 18,
              color: 'var(--crema)',
              lineHeight: 1.1,
              textTransform: 'uppercase',
            }}
          >
            {resto} <span style={{ color: 'var(--neon-cian)' }}>{ultima}</span>
          </div>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9,
              letterSpacing: '.24em',
              color: '#7C736D',
              marginTop: 8,
            }}
          >
            PANEL INTERNO · INVITACIÓN
          </div>
        </div>

        <div style={{ padding: 28 }}>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 20,
              color: 'var(--crema)',
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            TE SUMARON AL MOSTRADOR
          </div>

          <div
            style={{
              color: '#B8AFA8',
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 22,
              textWrap: 'pretty',
            }}
          >
            {invitadoPor || 'El equipo'} te invitó a administrar el catálogo de {nombre}. Creá tu
            cuenta con este link; vence en 7 días y sirve una sola vez.
          </div>

          <div
            style={{
              display: 'block',
              textAlign: 'center',
              background: 'var(--naranja)',
              color: 'var(--tinta-sobre-naranja)',
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              padding: '16px 24px',
              borderRadius: 'var(--r-control)',
              marginBottom: 20,
            }}
          >
            Aceptar invitación y crear mi cuenta
          </div>

          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: '#6B625D',
              letterSpacing: '.06em',
              wordBreak: 'break-all',
              lineHeight: 1.7,
            }}
          >
            {linkMuestra}
          </div>
        </div>

        <div
          style={{
            padding: '18px 28px 26px',
            borderTop: '1px solid #241F1C',
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '.12em',
            color: '#6B625D',
            lineHeight: 1.8,
          }}
        >
          SI NO ESPERABAS ESTE MAIL, IGNORALO.
          <br />
          {[nombre, zona].filter(Boolean).join(' · ').toUpperCase()}
        </div>
      </div>

      <div className="campo-ayuda" style={{ marginTop: 16 }}>
        El link real lo genera el backend y es distinto para cada invitación. Si no hay SMTP
        configurado, el mail no sale: queda impreso en la consola del servidor.
      </div>
    </Modal>
  );
}
