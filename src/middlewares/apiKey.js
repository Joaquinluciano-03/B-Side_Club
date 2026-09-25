// valida la API key interna que el frontend manda en el header x-api-key.
// es una capa previa al JWT: filtra pedidos de clientes que no son nuestro frontend,
// pero NO identifica usuarios (de eso se sigue encargando requireAuth).

const crypto = require('crypto');

// compara en tiempo constante para no filtrar info por cuanto tarda la comparacion.
// timingSafeEqual explota si los buffers miden distinto, por eso chequeamos el largo antes.
function comparacionSegura(recibida, esperada) {
  const bufferRecibida = Buffer.from(recibida);
  const bufferEsperada = Buffer.from(esperada);

  if (bufferRecibida.length !== bufferEsperada.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferRecibida, bufferEsperada);
}

function requireApiKey(req, res, next) {
  const apiKeyEsperada = process.env.API_KEY;

  // sin API_KEY configurada rechazamos todo: si dejaramos pasar los pedidos,
  // un .env mal armado desactivaria la proteccion sin que nadie se entere.
  if (!apiKeyEsperada) {
    return res.status(500).json({ error: 'API key no configurada en el servidor' });
  }

  const apiKeyRecibida = req.headers['x-api-key'];

  if (!apiKeyRecibida || typeof apiKeyRecibida !== 'string') {
    return res.status(401).json({ error: 'API key inválida o faltante' });
  }

  if (!comparacionSegura(apiKeyRecibida, apiKeyEsperada)) {
    return res.status(401).json({ error: 'API key inválida o faltante' });
  }

  next();
}

module.exports = { requireApiKey };
