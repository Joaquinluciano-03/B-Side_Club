// Limites de pedidos por IP. Es la capa que faltaba: la API key no sirve para
// frenar fuerza bruta porque viaja en el frontend y cualquiera la puede leer
// desde las herramientas del navegador y reusarla con curl.

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const MINUTO = 60 * 1000;

// De donde sacamos "quien es el que pide".
//
// Por defecto la libreria usa req.ip, que Express arma a partir del socket de
// la conexion. Corriendo como funcion de Netlify NO hay socket: req.ip queda
// undefined y la libreria explota al intentar hashearlo, tirando 500 en TODOS
// los pedidos. Por eso lo resolvemos a mano, leyendo el header con la IP real
// del cliente que pone Netlify.
function identificarCliente(req) {
  const ip =
    req.headers['x-nf-client-connection-ip'] || // la que pone Netlify
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || // otros proxies
    req.ip ||
    '';

  // ipKeyGenerator normaliza IPv6 a su subred: sin esto, alguien con un /64
  // tiene millones de direcciones y cada intento contaria como un cliente
  // distinto, dejando el limite en nada.
  return ip ? ipKeyGenerator(ip) : 'sin-ip';
}

// respuesta en el mismo formato { error } que usa el resto de la API,
// para que el frontend la pueda mostrar sin un caso especial
function respuesta(mensaje) {
  return (req, res) => res.status(429).json({ error: mensaje });
}

function crearLimite({ windowMs, limit, mensaje, skipSuccessfulRequests = false }) {
  return rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    keyGenerator: identificarCliente,
    // draft-7 y no draft-8: el borrador 8 agrega una "partition key" que la
    // libreria arma hasheando datos de la conexion, y eso no existe cuando
    // corremos sin socket. draft-7 manda los mismos RateLimit-* utiles.
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: respuesta(mensaje),
  });
}

// Techo general de toda la API. Alto a proposito: no es para frenar ataques
// puntuales (de eso se encargan los de abajo) sino para que un script suelto
// no pueda inundar el servidor.
const limiteGeneral = crearLimite({
  windowMs: 15 * MINUTO,
  limit: 300,
  mensaje: 'Demasiados pedidos. Esperá unos minutos y volvé a intentar.',
});

// Login: solo contamos los intentos FALLIDOS (skipSuccessfulRequests).
// Asi el que entra bien puede seguir usando la app normalmente, y el que
// prueba contraseñas al azar se queda sin intentos enseguida.
const limiteLogin = crearLimite({
  windowMs: 15 * MINUTO,
  limit: 10,
  skipSuccessfulRequests: true,
  mensaje: 'Demasiados intentos de login fallidos. Esperá 15 minutos.',
});

// Operaciones que crean o cambian credenciales. Son poco frecuentes por
// naturaleza, asi que un limite bajo no molesta al uso normal. En
// forgot-password tambien evita que se use la API para bombardear un mail.
const limiteCuenta = crearLimite({
  windowMs: 60 * MINUTO,
  limit: 10,
  mensaje: 'Demasiados pedidos seguidos. Esperá una hora y volvé a intentar.',
});

// Formulario de contacto: es publico y sin login, el vector de spam mas obvio.
const limiteFormulario = crearLimite({
  windowMs: 60 * MINUTO,
  limit: 5,
  mensaje: 'Ya enviaste varias consultas. Esperá un rato antes de mandar otra.',
});

module.exports = { limiteGeneral, limiteLogin, limiteCuenta, limiteFormulario };
