// Links de contacto armados a partir de lo que el local carga en el panel.

// wa.me necesita el numero completo en formato internacional y sin simbolos.
// En el panel suele cargarse como "11 5555-0142" (sin codigo de pais): en ese
// caso le agregamos el 549 de Argentina para celulares.
export function linkWhatsApp(numero, mensaje) {
  if (!numero) return null;
  let digitos = String(numero).replace(/\D/g, '');
  if (!digitos) return null;
  if (!digitos.startsWith('54')) digitos = `549${digitos.replace(/^0/, '')}`;
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : '';
  return `https://wa.me/${digitos}${texto}`;
}

export function linkInstagram(usuario) {
  if (!usuario) return null;
  return `https://instagram.com/${String(usuario).trim().replace(/^@/, '')}`;
}

export function arrobaInstagram(usuario) {
  if (!usuario) return '';
  const limpio = String(usuario).trim();
  return limpio.startsWith('@') ? limpio : `@${limpio}`;
}

// Abre la direccion en el mapa del celular o en Google Maps
export function linkMapa(direccion) {
  if (!direccion) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
}
