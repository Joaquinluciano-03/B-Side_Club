// Carga los 50 productos de productosExtra.js en la base que ya existe, SIN
// borrar nada (a diferencia de seed.js, que la vacia). Se puede correr mas de
// una vez: los productos que ya estan (mismo nombre) se saltean.
//
//   node prisma/cargarProductosExtra.js
//
// Las fotos se suben al bucket "productos" de Supabase Storage con el mismo
// nombre que tienen en frontend/public/productos, que es la URL que arma
// seed.js (urlFoto). Necesita SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.

require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { prisma } = require('../src/config/db');
const { productosExtra, archivoFoto } = require('./productosExtra');

const CARPETA = path.join(__dirname, '..', 'frontend', 'public', 'productos');
const BUCKET = 'productos';

// clave de la categoria en productosExtra -> nombre en la base
const CATEGORIAS = { vinilos: 'Vinilos', cds: 'CDs', cassettes: 'Cassettes', equipos: 'Equipos', accesorios: 'Accesorios' };

async function main() {
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const categorias = await prisma.categoria.findMany();
  const idDe = {};
  for (const [clave, nombre] of Object.entries(CATEGORIAS)) {
    const c = categorias.find((x) => x.nombre.toLowerCase() === nombre.toLowerCase());
    if (!c) throw new Error(`Falta la categoria "${nombre}" en la base`);
    idDe[clave] = c.id;
  }

  let creados = 0;
  for (const p of productosExtra) {
    const nombre = `${p.titulo} — ${p.artista}`;
    if (await prisma.producto.findFirst({ where: { nombre } })) {
      console.log('ya estaba:', nombre);
      continue;
    }

    let url = null;
    const archivo = archivoFoto(p);
    if (archivo) {
      const { error } = await sb.storage.from(BUCKET).upload(archivo, fs.readFileSync(path.join(CARPETA, archivo)), {
        contentType: archivo.endsWith('.png') ? 'image/png' : 'image/jpeg',
        upsert: true,
      });
      if (error) throw new Error(`No se pudo subir ${archivo}: ${error.message}`);
      url = sb.storage.from(BUCKET).getPublicUrl(archivo).data.publicUrl;
    }

    await prisma.producto.create({
      data: {
        nombre,
        anio: p.anio,
        precio: p.precio,
        ...(p.descuento && { descuento_tipo: p.descuento.tipo, descuento_valor: p.descuento.valor }),
        stock: p.stock,
        estado_stock: p.estado_stock,
        condicion: p.condicion,
        destacado: p.destacado,
        esActivo: true,
        descripcion: `Sello: ${p.sello}. ${p.descripcion}`,
        categoriaId: idDe[p.categoria],
        ...(url && { imagenes: { create: [{ url, alt: nombre, orden: 0 }] } }),
      },
    });
    creados++;
    console.log(url ? 'con foto:' : 'sin foto:', nombre);
  }
  console.log(`Listo: ${creados} productos nuevos.`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
