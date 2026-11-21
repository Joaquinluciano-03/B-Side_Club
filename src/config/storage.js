// guardado de imágenes en Supabase Storage

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const path = require('path');

const BUCKET = 'productos';

// la service role key es de servidor: nunca va al frontend
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
  // las claves son ASCII; un "•" significa que se copió la versión oculta del panel de Supabase
  if (!/^[\x21-\x7e]+$/.test(SERVICE_KEY) || !/^[\x21-\x7e]+$/.test(URL_SUPABASE)) {
    const error = new Error(
      'La SUPABASE_SERVICE_ROLE_KEY (o la SUPABASE_URL) está mal copiada: tiene caracteres ocultos como "•". Volvé a copiarla completa desde Supabase (Reveal) y cargala de nuevo.'
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

// crea el bucket la primera vez si no existe
let bucketVerificado = false;
async function asegurarBucket(sb) {
  if (bucketVerificado) return;
  const { data } = await sb.storage.getBucket(BUCKET);
  if (!data) {
    // public: las URLs van directo en un <img>
    await sb.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    });
  }
  bucketVerificado = true;
}

/** Sube un archivo de multer y devuelve su URL pública. */
async function subirImagen(file) {
  const sb = getCliente();
  await asegurarBucket(sb);

  // nombre único para que dos "tapa.jpg" no se pisen
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

/** Borra el archivo a partir de su URL pública. No falla si ya no existe. */
async function borrarImagen(url) {
  if (!url || !estaConfigurado()) return;

  // nos quedamos con el nombre del archivo
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
