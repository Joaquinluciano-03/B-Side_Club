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

async function enviarInvitacion({ mail, link }) {
  await enviarMail({
    to: mail,
    subject: 'Te invitaron a sumarte a B-Side Club',
    html: `<p>Te invitaron a sumarte al equipo de B-Side Club.</p><p><a href="${link}">Aceptar invitación</a></p>`,
  });
}

async function enviarRecuperoPassword({ mail, link }) {
  await enviarMail({
    to: mail,
    subject: 'Recuperar contraseña — B-Side Club',
    html: `<p>Pediste recuperar tu contraseña.</p><p><a href="${link}">Elegir una contraseña nueva</a></p><p>Este link vence en 30 minutos. Si no fuiste vos, podés ignorar este mail.</p>`,
  });
}

module.exports = { enviarInvitacion, enviarRecuperoPassword };
