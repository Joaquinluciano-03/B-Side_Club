// Validacion y limpieza de lo que llega del cliente. Todo campo que entra a
// la API pasa por aca antes de tocar la base:
//   - el tipo tiene que ser el esperado (un objeto en lugar de un texto se
//     rechaza: Prisma lo tomaria como un filtro, ej. { "mail": { "not": "" } })
//   - los textos se recortan, se normalizan (NFC) y pierden los caracteres de
//     control invisibles; tienen un largo maximo
//   - emails, telefonos, numeros, fechas y el horario tienen su formato
// Si algo no cumple se corta con un 400 y un mensaje claro para el panel.

function error400(mensaje) {
  const error = new Error(mensaje);
  error.status = 400;
  return error;
}

const vacio = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

// caracteres de control (salvo el salto de linea y el tab en textos largos)
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g;

/**
 * Texto libre. Devuelve el texto limpio, o null si es opcional y vino vacio.
 * multilinea: deja los saltos de linea (descripciones, mensajes).
 */
function texto(valor, campo, { requerido = false, max = 200, multilinea = false } = {}) {
  if (vacio(valor)) {
    if (requerido) throw error400(`Falta el campo "${campo}".`);
    return null;
  }
  if (typeof valor !== 'string' && typeof valor !== 'number') {
    throw error400(`El campo "${campo}" tiene que ser un texto.`);
  }
  let limpio = String(valor).normalize('NFC').replace(CONTROL, '');
  limpio = multilinea ? limpio.replace(/\r\n?/g, '\n').replace(/\t/g, ' ') : limpio.replace(/[\n\t]+/g, ' ');
  limpio = limpio.trim();
  if (!limpio) {
    if (requerido) throw error400(`Falta el campo "${campo}".`);
    return null;
  }
  if (limpio.length > max) throw error400(`El campo "${campo}" puede tener hasta ${max} caracteres.`);
  return limpio;
}

const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function email(valor, campo = 'email', { requerido = false } = {}) {
  const limpio = texto(valor, campo, { requerido, max: 254 });
  if (limpio === null) return null;
  const normal = limpio.toLowerCase();
  if (!MAIL.test(normal)) throw error400('El mail no tiene un formato válido.');
  return normal;
}

// "11 5555-0142", "+54 9 11 5555 0142", "(011) 4555-0000"
function telefono(valor, campo = 'telefono', { requerido = false } = {}) {
  const limpio = texto(valor, campo, { requerido, max: 30 });
  if (limpio === null) return null;
  if (!/^[0-9+()\-\s.]+$/.test(limpio) || limpio.replace(/\D/g, '').length < 6) {
    throw error400(`El campo "${campo}" tiene que ser un teléfono (números, espacios, +, - y paréntesis).`);
  }
  return limpio;
}

// bcrypt solo mira los primeros 72 bytes: mas largo no suma seguridad
function password(valor, { requerido = true } = {}) {
  if (vacio(valor)) {
    if (requerido) throw error400('Falta la contraseña.');
    return null;
  }
  if (typeof valor !== 'string') throw error400('La contraseña tiene que ser un texto.');
  if (valor.length < 8) throw error400('La contraseña tiene que tener al menos 8 caracteres.');
  if (Buffer.byteLength(valor, 'utf8') > 72) throw error400('La contraseña puede tener hasta 72 caracteres.');
  return valor;
}

function entero(valor, campo, { requerido = false, min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (vacio(valor)) {
    if (requerido) throw error400(`Falta el campo "${campo}".`);
    return null;
  }
  const n = typeof valor === 'string' ? Number(valor.trim()) : valor;
  if (typeof n !== 'number' || !Number.isInteger(n)) throw error400(`El campo "${campo}" tiene que ser un número entero.`);
  if (n < min || n > max) throw error400(`El campo "${campo}" tiene que estar entre ${min} y ${max}.`);
  return n;
}

function decimal(valor, campo, { requerido = false, min = 0, max = 1e10 } = {}) {
  if (vacio(valor)) {
    if (requerido) throw error400(`Falta el campo "${campo}".`);
    return null;
  }
  const n = typeof valor === 'string' ? Number(valor.trim()) : valor;
  if (typeof n !== 'number' || !Number.isFinite(n)) throw error400(`El campo "${campo}" tiene que ser un número.`);
  if (n < min || n > max) throw error400(`El campo "${campo}" tiene que estar entre ${min} y ${max}.`);
  return Math.round(n * 100) / 100;
}

function booleano(valor, campo) {
  if (valor === undefined) return undefined;
  if (typeof valor === 'boolean') return valor;
  if (valor === 'true') return true;
  if (valor === 'false') return false;
  throw error400(`El campo "${campo}" tiene que ser verdadero o falso.`);
}

function opcion(valor, campo, opciones, { requerido = false } = {}) {
  if (vacio(valor)) {
    if (requerido) throw error400(`Falta el campo "${campo}".`);
    return null;
  }
  if (typeof valor !== 'string' || !opciones.includes(valor)) {
    throw error400(`El campo "${campo}" tiene que ser uno de: ${opciones.join(', ')}.`);
  }
  return valor;
}

function fecha(valor, campo) {
  if (vacio(valor)) return null;
  if (typeof valor !== 'string' && typeof valor !== 'number') throw error400(`El campo "${campo}" tiene que ser una fecha.`);
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) throw error400(`El campo "${campo}" no es una fecha válida.`);
  return d;
}

// ids de la URL (/productos/:id): enteros positivos; si no, 404 directo
function id(valor) {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0 || n > 2147483647) {
    const error = new Error('Recurso no encontrado');
    error.status = 404;
    throw error;
  }
  return n;
}

// "@bsideclub" -> "bsideclub": solo letras, numeros, punto y guion bajo
function usuarioInstagram(valor) {
  const limpio = texto(valor, 'instagram', { max: 40 });
  if (limpio === null) return null;
  const usuario = limpio.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/+$/, '');
  if (!/^[A-Za-z0-9._]{1,30}$/.test(usuario)) throw error400('El usuario de Instagram solo puede tener letras, números, puntos y guiones bajos.');
  return `@${usuario}`;
}

// el horario del local: [{ label: "Lunes", value: "13 a 20 hs" }, ...]
function horario(valor) {
  if (!Array.isArray(valor)) throw error400('El horario tiene que ser una lista de días y horarios.');
  if (valor.length > 14) throw error400('El horario puede tener hasta 14 renglones.');
  return valor.map((fila, i) => {
    if (!fila || typeof fila !== 'object' || Array.isArray(fila)) throw error400(`El renglón ${i + 1} del horario no es válido.`);
    return {
      label: texto(fila.label, `horario ${i + 1} (día)`, { requerido: true, max: 30 }),
      value: texto(fila.value, `horario ${i + 1} (horario)`, { requerido: true, max: 40 }),
    };
  });
}

module.exports = {
  error400,
  texto,
  email,
  telefono,
  password,
  entero,
  decimal,
  booleano,
  opcion,
  fecha,
  id,
  usuarioInstagram,
  horario,
};
