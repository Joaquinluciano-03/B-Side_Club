// límites de pedidos por IP (la API key no frena fuerza bruta porque viaja en el frontend)

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const MINUTO = 60 * 1000;

// la IP se saca de los headers: como función de Netlify no hay socket y req.ip queda undefined
function identificarCliente(req) {
  const ip =
    req.headers['x-nf-client-connection-ip'] || // la que pone Netlify
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || // otros proxies
    req.ip ||
    '';

  // ipKeyGenerator agrupa IPv6 por subred, si no cada dirección contaría como un cliente distinto
  return ip ? ipKeyGenerator(ip) : 'sin-ip';
}

// mismo formato { error } que el resto de la API
function respuesta(mensaje) {
  return (req, res) => res.status(429).json({ error: mensaje });
}

function crearLimite({ windowMs, limit, mensaje, skipSuccessfulRequests = false }) {
  return rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    keyGenerator: identificarCliente,
    // draft-7: el draft-8 necesita datos del socket que acá no existen
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: respuesta(mensaje),
  });
}

// techo general, alto a propósito: solo evita que un script suelto inunde el servidor
const limiteGeneral = crearLimite({
  windowMs: 15 * MINUTO,
  limit: 300,
  mensaje: 'Demasiados pedidos. Esperá unos minutos y volvé a intentar.',
});

// login: solo cuentan los intentos fallidos
const limiteLogin = crearLimite({
  windowMs: 15 * MINUTO,
  limit: 10,
  skipSuccessfulRequests: true,
  mensaje: 'Demasiados intentos de login fallidos. Esperá 15 minutos.',
});

// cambios de credenciales: poco frecuentes, límite bajo (en forgot-password evita bombardear un mail)
const limiteCuenta = crearLimite({
  windowMs: 60 * MINUTO,
  limit: 10,
  mensaje: 'Demasiados pedidos seguidos. Esperá una hora y volvé a intentar.',
});

// formulario de contacto: público, el vector de spam más obvio
const limiteFormulario = crearLimite({
  windowMs: 60 * MINUTO,
  limit: 5,
  mensaje: 'Ya enviaste varias consultas. Esperá un rato antes de mandar otra.',
});

module.exports = { limiteGeneral, limiteLogin, limiteCuenta, limiteFormulario };
