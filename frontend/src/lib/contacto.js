// Links de contacto armados a partir de lo que el local carga en el panel.

// links de contacto a partir de lo que carga el local. wa.me necesita el número internacional sin símbolos: si falta el código de país se agrega 549
export function linkWhatsApp(numero, mensaje) {
  if (!numero) return null;
  let digitos = String(numero).replace(/\D/g, '');
  if (!digitos) return null;
  if (!digitos.startsWith('54')) digitos = `549${digitos.replace(/^0/, '')}`;
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : '';
  return `https://wa.me/${digitos}${texto}`;
}

// solo letras, números, punto y guion bajo, para que un valor raro no arme un link a otra parte
export function linkInstagram(usuario) {
  if (!usuario) return null;
  const limpio = String(usuario).trim().replace(/^@/, '');
  if (!/^[A-Za-z0-9._]{1,30}$/.test(limpio)) return null;
  return `https://instagram.com/${limpio}`;
}

export function arrobaInstagram(usuario) {
  if (!usuario) return '';
  const limpio = String(usuario).trim();
  return limpio.startsWith('@') ? limpio : `@${limpio}`;
}

// abre la dirección en el mapa del celular o en Google Maps
export function linkMapa(direccion) {
  if (!direccion) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
}
