// envio de mails transaccionales (invitaciones, recuperar contraseña).
// si no hay credenciales SMTP en el .env, cae a loguear el link por consola
// en vez de fallar — asi el resto del equipo puede seguir developeando sin
// tener que configurar un mail real.

const nodemailer = require('nodemailer');

function crearTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const transporter = crearTransporter();

async function enviarMail({ to, subject, html }) {
  if (!transporter) {
    console.log('--- MAIL (simulado, faltan credenciales SMTP en .env) ---');
    console.log(`Para: ${to}`);
    console.log(`Asunto: ${subject}`);
    console.log(html);
    console.log('-----------------------------------------------------------');
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

// Plantilla de los mails, con el diseño del sitio (demo/demo.html, modal
// "PLANTILLA DEL EMAIL"). Todo va en estilos inline y con tablas implicitas
// porque los clientes de mail no soportan hojas de estilo ni flexbox.
//
// OJO: el panel muestra una vista previa de este mail en
// frontend/src/componentes/ModalPlantillaEmail.jsx. Si cambia el diseño de
// acá, hay que tocar ese archivo también.
function plantilla({ kicker, titulo, cuerpo, textoBoton, link, pie }) {
  return `<!doctype html>
<html lang="es"><body style="margin:0;padding:24px 12px;background:#D5DADD;font-family:Archivo,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#100F0E;border-radius:14px;overflow:hidden;border:1px solid #2A2624">
    <div style="padding:30px 28px 24px;text-align:center;border-bottom:1px solid #2A2624">
      <div style="font-family:Georgia,serif;font-size:18px;font-weight:bold;color:#F2ECE4;letter-spacing:1px">
        B-SIDE <span style="color:#35D0E8">CLUB</span>
      </div>
      <div style="font-family:Consolas,monospace;font-size:9px;letter-spacing:3px;color:#7C736D;margin-top:8px">
        ${kicker}
      </div>
    </div>
    <div style="padding:28px">
      <div style="font-family:Georgia,serif;font-size:20px;color:#F2ECE4;line-height:1.2;margin-bottom:16px;font-weight:bold">
        ${titulo}
      </div>
      <div style="color:#B8AFA8;font-size:15px;line-height:1.7;margin-bottom:22px">${cuerpo}</div>
      <a href="${link}" style="display:block;text-align:center;background:#F26A1B;color:#141210;font-weight:bold;font-size:15px;letter-spacing:1px;text-transform:uppercase;padding:16px 24px;border-radius:8px;margin-bottom:20px;text-decoration:none">
        ${textoBoton}
      </a>
      <div style="font-family:Consolas,monospace;font-size:11px;color:#6B625D;word-break:break-all;line-height:1.7">
        ${link}
      </div>
    </div>
    <div style="padding:18px 28px 26px;border-top:1px solid #241F1C;font-family:Consolas,monospace;font-size:10px;letter-spacing:1px;color:#6B625D;line-height:1.8">
      ${pie}
    </div>
  </div>
</body></html>`;
}

async function enviarInvitacion({ mail, link, invitadoPor }) {
  await enviarMail({
    to: mail,
    subject: 'Te invitaron al panel de B-Side Club',
    html: plantilla({
      kicker: 'PANEL INTERNO · INVITACIÓN',
      titulo: 'TE SUMARON AL MOSTRADOR',
      cuerpo: `${invitadoPor || 'El equipo'} te invitó a administrar el catálogo de B-Side Club. Creá tu cuenta con este link; vence en 7 días y sirve una sola vez.`,
      textoBoton: 'Aceptar invitación y crear mi cuenta',
      link,
      pie: 'SI NO ESPERABAS ESTE MAIL, IGNORALO.<br>B-SIDE CLUB · BUENOS AIRES',
    }),
  });
}

async function enviarRecuperoPassword({ mail, link }) {
  await enviarMail({
    to: mail,
    subject: 'Recuperar contraseña — B-Side Club',
    html: plantilla({
      kicker: 'PANEL INTERNO · CONTRASEÑA',
      titulo: 'ELEGÍ UNA NUEVA',
      cuerpo:
        'Pediste recuperar tu contraseña. Este link vence en 30 minutos y sirve una sola vez. Si no fuiste vos, ignorá este mail: tu contraseña actual sigue funcionando.',
      textoBoton: 'Elegir una contraseña nueva',
      link,
      pie: 'SI NO PEDISTE ESTO, IGNORALO.<br>B-SIDE CLUB · BUENOS AIRES',
    }),
  });
}

module.exports = { enviarInvitacion, enviarRecuperoPassword };
