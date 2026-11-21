// valida la API key que el frontend manda en x-api-key. No identifica usuarios (eso lo hace requireAuth)

const crypto = require('crypto');

// comparación en tiempo constante; timingSafeEqual falla si los largos difieren, por eso se chequea antes
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

  // sin API_KEY configurada se rechaza todo: un .env mal armado no debe dejar la API abierta
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
