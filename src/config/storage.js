// Guardado de las imagenes de productos en Supabase Storage.
//
// Antes se escribian en la carpeta uploads/ del servidor. Eso dejo de servir
// cuando el backend paso a correr como funcion de Netlify: una funcion no
// tiene disco propio, se levanta y se muere por cada pedido, asi que los
// archivos desaparecian. Supabase Storage ademas nos da una URL publica
// directa, asi que las <img> del sitio no pasan por el backend.

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const path = require('path');

const BUCKET = 'productos';

// La service role key saltea las policies de RLS: es una clave de SERVIDOR.
// Nunca puede terminar en el frontend (ahi iria la anon key, que no usamos).
const URL_SUPABASE = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cliente = null;
function getCliente() {
  if (!URL_SUPABASE || !SERVICE_KEY) {
    const error = new Error(
      'Falta configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para poder subir imágenes.'
    );
    error.status = 500;
    throw error;
  }
  if (!cliente) {
    cliente = createClient(URL_SUPABASE, SERVICE_KEY, {
      auth: { persistSession: false },
    });
  }
  return cliente;
}

/** ¿Se puede subir? Lo usa el controller para avisar antes de intentarlo. */
function estaConfigurado() {
  return Boolean(URL_SUPABASE && SERVICE_KEY);
}

// El bucket tiene que existir antes de la primera subida. En vez de pedirle
// al equipo que lo cree a mano en el panel, lo creamos la primera vez.
let bucketVerificado = false;
async function asegurarBucket(sb) {
  if (bucketVerificado) return;
  const { data } = await sb.storage.getBucket(BUCKET);
  if (!data) {
    // public: true -> las URLs se pueden poner directo en un <img>, sin firmar
    await sb.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    });
  }
  bucketVerificado = true;
}

/**
 * Sube un archivo que multer dejo en memoria y devuelve su URL publica.
 * @param {{originalname: string, mimetype: string, buffer: Buffer}} file
 */
async function subirImagen(file) {
  const sb = getCliente();
  await asegurarBucket(sb);

  // nombre impredecible: si usaramos el original, dos productos con
  // "tapa.jpg" se pisarian, y se podrian adivinar URLs de otros productos
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const nombre = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

  const { error } = await sb.storage.from(BUCKET).upload(nombre, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) {
    const err = new Error(`No se pudo subir la imagen: ${error.message}`);
    err.status = 502;
    throw err;
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(nombre);
  return data.publicUrl;
}

/**
 * Borra el archivo a partir de la URL publica que guardamos en la base.
 * No tira error si no existe: puede haberse borrado a mano desde el panel de
 * Supabase, y en ese caso igual queremos limpiar la fila de la tabla.
 */
async function borrarImagen(url) {
  if (!url || !estaConfigurado()) return;

  // de "https://xxx.supabase.co/storage/v1/object/public/productos/ARCHIVO"
  // nos quedamos con ARCHIVO
  const marca = `/${BUCKET}/`;
  const i = url.indexOf(marca);
  if (i === -1) return; // no es una URL nuestra (ej. una de placehold.co del seed)

  const nombre = url.slice(i + marca.length);
  try {
    await getCliente().storage.from(BUCKET).remove([nombre]);
  } catch (err) {
    console.error('No se pudo borrar la imagen del storage:', err.message);
  }
}

module.exports = { subirImagen, borrarImagen, estaConfigurado, BUCKET };
