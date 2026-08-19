// por ahora, en vez de mandar un mail real, logueamos el link en consola.
// cuando tengamos las credenciales de Gmail, se reemplaza el contenido de esta funcion
// por el envio real con Nodemailer, sin tener que tocar el resto del codigo (invitacion.service.js
// solo llama a enviarInvitacion, no le importa como se manda).

async function enviarInvitacion({ mail, link }) {
  console.log('--- INVITACION (simulada, todavia no se configuro el envio real) ---');
  console.log(`Para: ${mail}`);
  console.log(`Link: ${link}`);
  console.log('----------------------------------------------------------------------');
}

module.exports = { enviarInvitacion };