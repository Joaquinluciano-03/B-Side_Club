// Envuelve el servidor Express para que Netlify lo corra como una funcion.
//
// server.js (app.listen) se sigue usando en desarrollo local; en Netlify no
// hay un proceso que quede prendido escuchando un puerto, asi que entra por
// acá: Netlify invoca el handler una vez por pedido y serverless-http traduce
// ese evento a algo que Express entiende.

const serverless = require('serverless-http');
const app = require('../../src/app');

const handlerExpress = serverless(app, {
  // multipart/form-data (la subida de imagenes) llega en base64: hay que
  // avisarle a serverless-http que trate esos tipos como binarios, o los
  // archivos se corrompen al pasarlos a texto
  binary: ['image/*', 'multipart/form-data', 'application/octet-stream'],
});

exports.handler = async (event, context) => {
  // Prisma mantiene conexiones abiertas; sin esto la funcion se queda colgada
  // esperando a que el event loop se vacie y suma segundos a cada respuesta.
  context.callbackWaitsForEmptyEventLoop = false;

  // El redirect de netlify.toml manda /api/* acá. Segun como lo invoque
  // Netlify, el path puede llegar como /.netlify/functions/api/productos en
  // vez de /api/productos; se lo normalizamos para que las rutas de Express
  // (todas montadas bajo /api) coincidan igual.
  const prefijo = '/.netlify/functions/api';
  if (event.path && event.path.startsWith(prefijo)) {
    event.path = '/api' + event.path.slice(prefijo.length);
  }

  return handlerExpress(event, context);
};
