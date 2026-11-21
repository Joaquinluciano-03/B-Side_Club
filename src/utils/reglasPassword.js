// requisitos de una contraseña nueva. El frontend muestra los mismos en frontend/src/lib/reglasPassword.js:
// si cambia una regla, cambiarla en los dos

const LARGO_MINIMO = 10;

// contraseñas comunes, se comparan sin acentos y deshaciendo reemplazos típicos (P@ssw0rd -> password)
const PALABRAS_COMUNES = [
  'password', 'contrasena', 'clave', 'qwerty', 'admin', 'administrador', 'usuario', 'bside', 'bsideclub',
  'disqueria', 'vinilo', 'letmein', 'welcome', 'bienvenido', 'iloveyou', 'teamo', 'monkey', 'dragon',
  'football', 'futbol', 'argentina', 'abc123', 'secreto',
];

// filas del teclado
const FILAS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890'];

const sinAcentos = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');
const deshacerLeet = (t) =>
  t.replace(/[@4]/g, 'a').replace(/3/g, 'e').replace(/[1!|]/g, 'i').replace(/0/g, 'o').replace(/[$5]/g, 's').replace(/7/g, 't');

// 4 o más caracteres seguidos: abcd, 1234, qwer
function tieneSecuencia(t) {
  for (let i = 0; i + 4 <= t.length; i++) {
    const tramo = t.slice(i, i + 4);
    const codigos = [...tramo].map((c) => c.charCodeAt(0));
    const mismoTipo = /^[a-z]{4}$|^[0-9]{4}$/.test(tramo);
    const sube = codigos.every((c, j) => j === 0 || c - codigos[j - 1] === 1);
    const baja = codigos.every((c, j) => j === 0 || codigos[j - 1] - c === 1);
    if (mismoTipo && (sube || baja)) return true;
    if (FILAS.some((f) => f.includes(tramo) || [...f].reverse().join('').includes(tramo))) return true;
  }
  return false;
}

// el patrón fácil que tenga, o null
function patronFacil(password, datos = {}) {
  const t = sinAcentos(password.toLowerCase());
  if (/(.)\1\1/.test(t)) return 'repite el mismo carácter tres veces seguidas';
  if (tieneSecuencia(t)) return 'tiene una secuencia como 1234, abcd o qwer';
  const plano = deshacerLeet(t);
  if (PALABRAS_COMUNES.some((p) => plano.includes(p))) return 'usa una palabra muy común';
  const personales = [datos.nombre, datos.apellido, String(datos.mail || '').split('@')[0]]
    .map((d) => sinAcentos(String(d || '').toLowerCase()).replace(/[^a-z0-9]/g, ''))
    .filter((d) => d.length >= 3);
  if (personales.some((d) => t.includes(d) || plano.includes(d))) return 'incluye tu nombre o tu email';
  return null;
}

// lista para el formulario, cada requisito con ok true/false
function requisitosPassword(password = '', datos = {}) {
  const patron = password ? patronFacil(password, datos) : 'vacia';
  return [
    { id: 'largo', texto: `Al menos ${LARGO_MINIMO} caracteres`, ok: password.length >= LARGO_MINIMO },
    { id: 'mayus', texto: 'Una mayúscula y una minúscula', ok: /\p{Lu}/u.test(password) && /\p{Ll}/u.test(password) },
    { id: 'numero', texto: 'Un número', ok: /\d/.test(password) },
    { id: 'especial', texto: 'Un carácter especial (! ? # @ $ % & * …)', ok: /[^\p{L}\p{N}\s]/u.test(password) },
    {
      id: 'patron',
      texto: 'Sin patrones fáciles (1234, aaa, qwerty) ni tu nombre o email',
      ok: !patron,
    },
  ];
}

// el primer problema, o null si cumple todo
function errorPassword(password = '', datos = {}) {
  if (!password) return 'Escribí una contraseña.';
  const falta = requisitosPassword(password, datos).find((r) => !r.ok);
  if (!falta) return null;
  if (falta.id === 'patron') return `La contraseña ${patronFacil(password, datos)}.`;
  return `Falta: ${falta.texto.toLowerCase()}.`;
}

module.exports = { LARGO_MINIMO, requisitosPassword, errorPassword };
