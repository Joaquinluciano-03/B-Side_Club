// Achica y comprime las fotos en el navegador antes de subirlas (panel >
// producto). Una foto de celular pesa varios MB y en el sitio se ve, como
// mucho, a unos 600 px en la ficha: subirla entera hacia que el catalogo
// bajara de mas en cada visita. Se lleva el lado mayor a 1600 px (sobra para
// la ficha en pantallas de alta densidad) y se guarda en WebP.
// Si algo falla, o si el resultado no pesa menos, se sube el original: nunca
// se pierde una foto por esto. Los GIF (pueden ser animados) y AVIF (ya
// vienen comprimidos) van tal cual.

const LADO_MAXIMO = 1600;
const CALIDAD = 0.82;

async function comprimir(archivo) {
  if (!/^image\/(jpeg|png|webp)$/.test(archivo.type) || typeof createImageBitmap !== 'function') return archivo;
  try {
    // imageOrientation: las fotos de celular traen la rotacion aparte (EXIF)
    const imagen = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
    const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(imagen.width * escala);
    lienzo.height = Math.round(imagen.height * escala);
    lienzo.getContext('2d').drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    imagen.close();
    const blob = await new Promise((listo) => lienzo.toBlob(listo, 'image/webp', CALIDAD));
    // un navegador sin WebP devuelve PNG: ahi no se gana nada, va el original
    if (!blob || blob.type !== 'image/webp' || blob.size >= archivo.size) return archivo;
    const nombre = `${archivo.name.replace(/\.[^.]+$/, '') || 'foto'}.webp`;
    return new File([blob], nombre, { type: 'image/webp', lastModified: Date.now() });
  } catch {
    return archivo;
  }
}

/** Comprime una lista de archivos (los que no son fotos quedan igual). */
export function comprimirImagenes(archivos) {
  return Promise.all(archivos.map(comprimir));
}
