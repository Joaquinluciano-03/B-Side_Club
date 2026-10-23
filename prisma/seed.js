// Carga datos de ejemplo en la base, los mismos que muestra la demo del local
// (demo/demo.html): categorias, productos, info del local y consultas.
// Se corre con: npm run seed

const bcrypt = require("bcrypt");
const { prisma } = require("../src/config/db");
const { productosExtra, archivoFoto } = require("./productosExtra");

const superAdminData = {
  nombre: "Admin",
  apellido: "B-Side Club",
  mail: "admin.bsideclub@gmail.com",
  telefono: "11 5555-0142",
  passwordPlana: "admin123", // se hashea antes de guardarla, nunca se guarda tal cual
};

// "clave" es solo para relacionar cada producto con su categoria aca abajo,
// no se guarda en la base (Categoria no tiene slug).
const categoriasData = [
  { clave: "vinilos", nombre: "Vinilos", icono: "vinilo", descripcion: 'LPs de 12", nuevos o usados con garantía de calidad' },
  { clave: "cassettes", nombre: "Cassettes", icono: "cassette", descripcion: "Originales y compilados del local" },
  { clave: "cds", nombre: "CDs", icono: "cd", descripcion: "Ediciones originales con librito" },
  { clave: "equipos", nombre: "Equipos", icono: "perilla", descripcion: "Bandejas, amplificadores y portátiles revisados" },
  { clave: "accesorios", nombre: "Accesorios", icono: "auriculares", descripcion: "Púas, auriculares y todo para cuidar tus discos" },
];

// Las fotos del seed ya estan subidas al bucket "productos" de Supabase Storage
// con el mismo nombre de archivo. Si no hay Supabase configurado se usa la
// copia de frontend/public/productos, que el sitio sirve igual.
function urlFoto(ruta) {
  if (!process.env.SUPABASE_URL) return ruta;
  return `${process.env.SUPABASE_URL}/storage/v1/object/public${ruta}`;
}

// El nombre se guarda como "Titulo — Artista": el frontend lo separa en dos
// lineas (lib/formato.js, separarNombre). Producto no tiene campo artista.
const productosData = [
  { titulo: "The Dark Side of the Moon", imagen: "/productos/18-dark-side-of-the-moon.jpg", artista: "Pink Floyd", categoria: "vinilos", anio: 1973, sello: "Harvest", precio: 145000, condicion: "Muy bueno (VG+)", estado_stock: "disponible", destacado: true, stock: 2, descripcion: "Reedición europea de 1984 con el póster original y los dos stickers. Tapa con roce leve en las esquinas, vinilo impecable: lo probamos entero y no tiene un solo salto." },
  { titulo: "Remain in Light", imagen: "/productos/19-remain-in-light.jpg", artista: "Talking Heads", categoria: "vinilos", anio: 1980, sello: "Sire", precio: 98000, condicion: "Muy bueno (VG+)", estado_stock: "disponible", destacado: true, stock: 1, descripcion: "Prensado americano. Funda interna original, algo amarillenta. El lado B tiene un ruido de fondo mínimo en los primeros surcos que desaparece al segundo tema." },
  { titulo: "Signos", imagen: "/productos/20-signos.jpg", artista: "Soda Stereo", categoria: "vinilos", anio: 1986, sello: "CBS", precio: 120000, condicion: "Casi nuevo (NM)", estado_stock: "ultima_unidad", destacado: true, stock: 1, descripcion: "Primera edición argentina. Uno de los mejores ejemplares que pasaron por el local: parece que nunca salió de la funda. Insert original incluido." },
  { titulo: "Hounds of Love", imagen: "/productos/21-hounds-of-love.jpg", artista: "Kate Bush", categoria: "vinilos", anio: 1985, sello: "EMI", precio: null, condicion: "Coleccionista", estado_stock: "a_consultar", destacado: false, stock: 1, descripcion: "Prensado inglés de primera tirada. Pieza de colección, el precio depende del día y de las ganas. Pasá a verlo y lo charlamos." },
  { titulo: "Purple Rain", imagen: "/productos/22-purple-rain.jpg", artista: "Prince & The Revolution", categoria: "vinilos", anio: 1984, sello: "Warner Bros.", precio: 135000, condicion: "Muy bueno (VG+)", estado_stock: "disponible", destacado: true, stock: 2, descripcion: "Con el póster original doblado como venía de fábrica. Tapa con un pequeño doblez en el borde superior. Suena fuerte y limpio." },
  { titulo: "Clics Modernos", imagen: "/productos/23-clics-modernos.jpg", artista: "Charly García", categoria: "vinilos", anio: 1983, sello: "SG Discos", precio: 110000, condicion: "Bueno (VG)", estado_stock: "disponible", destacado: false, stock: 3, descripcion: "Edición nacional muy buscada. Marcas de uso visibles en la tapa y algo de ruido superficial: es un disco con historia, revisado para que suene bien." },
  { titulo: "Disintegration", imagen: "/productos/24-disintegration.jpg", artista: "The Cure", categoria: "cassettes", anio: 1989, sello: "Fiction", precio: 38000, condicion: "Muy bueno (VG+)", estado_stock: "disponible", destacado: false, stock: 2, descripcion: "Cassette con la carátula completa y la cinta tensa. Probado en un deck Nakamichi: ni un solo enganche." },
  { titulo: "Divididos por la Felicidad", imagen: "/productos/25-divididos-por-la-felicidad.jpg", artista: "Sumo", categoria: "cassettes", anio: 1985, sello: "CBS", precio: 45000, condicion: "Bueno (VG)", estado_stock: "ultima_unidad", destacado: true, stock: 1, descripcion: "La carcasa tiene una rajadura en la esquina inferior, pero la cinta está perfecta. Carátula original con el precio de 1985 todavía escrito a mano." },
  { titulo: "Thriller", imagen: "/productos/26-thriller.jpg", artista: "Michael Jackson", categoria: "cassettes", anio: 1982, sello: "Epic", precio: 32000, condicion: "Muy bueno (VG+)", estado_stock: "reservado", destacado: false, stock: 1, descripcion: "Reservado hasta el viernes. Si no lo pasan a buscar vuelve al cajón, avisanos si te interesa y te anotamos." },
  { titulo: "OK Computer", imagen: "/productos/27-ok-computer.jpg", artista: "Radiohead", categoria: "cds", anio: 1997, sello: "Parlophone", precio: 28000, condicion: "Casi nuevo (NM)", estado_stock: "disponible", destacado: false, stock: 4, descripcion: "Edición original con el librito completo de 24 páginas. Disco sin una sola marca." },
  { titulo: "Blue Lines", imagen: "/productos/28-blue-lines.jpg", artista: "Massive Attack", categoria: "cds", anio: 1991, sello: "Wild Bunch", precio: 24000, condicion: "Muy bueno (VG+)", estado_stock: "disponible", destacado: false, stock: 2, descripcion: "Caja original con una fisura fina en la bisagra. El disco lee perfecto de punta a punta." },
  { titulo: "El Amor Después del Amor", imagen: "/productos/29-el-amor-despues-del-amor.jpg", artista: "Fito Páez", categoria: "cds", anio: 1992, sello: "Warner", precio: 26000, condicion: "Muy bueno (VG+)", estado_stock: "disponible", destacado: false, stock: 5, descripcion: "El disco más vendido de la historia argentina, y todavía entran cinco por semana. Este ejemplar está impecable." },
  { titulo: "Technics SL-1200 MK2", imagen: "/productos/30-technics-sl-1200mk2.jpg", artista: "Bandeja giradiscos", categoria: "equipos", anio: 1979, sello: "Technics", precio: null, condicion: "Revisado en taller", estado_stock: "a_consultar", destacado: true, stock: 1, descripcion: "Revisada por nuestro técnico: cápsula nueva, correa de tracción directa original, pitch calibrado. La joya del local, se vende con garantía de 6 meses." },
  { titulo: "Walkman WM-2", imagen: "/productos/31-walkman-wm-2.jpg", descuento: { tipo: "monto", valor: 10000 }, artista: "Reproductor portátil", categoria: "equipos", anio: 1981, sello: "Sony", precio: 95000, condicion: "Funcional", estado_stock: "ultima_unidad", destacado: false, stock: 1, descripcion: "Chasis plateado con marcas de uso honestas. Motor recién lubricado, velocidad estable. Se entrega con auriculares de época." },
  { titulo: "Receiver 2270", imagen: "/productos/32-marantz-2270.jpg", artista: "Amplificador estéreo", categoria: "equipos", anio: 1972, sello: "Marantz", precio: 180000, condicion: "Revisado en taller", estado_stock: "disponible", destacado: false, stock: 1, descripcion: "Capacitores reemplazados, iluminación del dial restaurada con lámparas originales. 70 watts por canal que mueven cualquier par de parlantes." },
  { titulo: "Speed of Life", artista: "Varios · compilado del local", categoria: "cassettes", anio: 1988, sello: "B-Side Club", precio: 12000, condicion: "Casero", estado_stock: "disponible", destacado: false, stock: 8, descripcion: "Compilado que armamos nosotros con lados B de los 80. Grabado en TDK SA-90, carátula fotocopiada. No es original de nada, es original de acá." },
  { titulo: "Rumours", imagen: "/productos/34-rumours.jpg", descuento: { tipo: "porcentaje", valor: 15 }, artista: "Fleetwood Mac", categoria: "vinilos", anio: 1977, sello: "Warner Bros.", precio: 128000, condicion: "Muy bueno (VG+)", estado_stock: "disponible", destacado: false, stock: 2, descripcion: "Prensado americano de los 70. Funda con desgaste típico de la época, vinilo brillante y sin rayas profundas." },
  { titulo: "Vida", artista: "Vox Dei", categoria: "vinilos", anio: 1971, sello: "Disc Jockey", precio: 155000, condicion: "Bueno (VG)", estado_stock: "ultima_unidad", destacado: true, stock: 1, descripcion: "Edición original argentina, uno de los discos fundacionales del rock nacional. Tapa con marcas de manoseo, disco prolijo y revisado." },
  { titulo: "Léon Gieco", imagen: "/productos/36-leon-gieco.jpg", artista: "León Gieco", categoria: "vinilos", anio: 1973, sello: "Music Hall", precio: 89000, condicion: "Bueno (VG)", estado_stock: "disponible", destacado: false, stock: 1, descripcion: "Primer disco solista, edición original. Contratapa con firma de un dueño anterior, nada que afecte el sonido." },
  { titulo: "Continuous", artista: "Buddy Holly", categoria: "cds", anio: 1988, sello: "MCA", precio: 18000, condicion: "Muy bueno (VG+)", estado_stock: "disponible", destacado: false, stock: 3, descripcion: "Compilado importado, caja sin roturas. Ideal para arrancar una colección de rock and roll clásico." },
  { titulo: "Ok Corazón", artista: "Massacre", categoria: "cds", anio: 2001, sello: "PopArt", precio: 16000, condicion: "Casi nuevo (NM)", estado_stock: "disponible", destacado: false, stock: 4, descripcion: "Edición nacional con librito completo. Un clásico under del rock argentino de los 2000." },
  { titulo: "Parlantes 3 vías", artista: "Torre acústica", categoria: "equipos", anio: 1985, sello: "JBL", precio: 210000, condicion: "Revisado en taller", estado_stock: "disponible", destacado: false, stock: 1, descripcion: "Par de parlantes de piso, gabinete restaurado y parlantes originales recableados por nuestro técnico." },
];

const storeInfoData = {
  nombre: "B-Side Club",
  description: "Discos nuevos o usados con garantía de calidad. Desde 1998 en Chacarita.",
  direccion: "Jorge Newbery 3120, Chacarita, CABA",
  telefono: "11 5555-0142",
  email: "hola@bsideclub.ar",
  instagram: "@bsideclub",
  whatsapp: "11 5555-0142",
  horario: [
    { label: "Lunes", value: "Cerrado" },
    { label: "Martes", value: "13 a 23 hs" },
    { label: "Miér a Vie", value: "13 a 20 hs" },
    { label: "Sábados", value: "11 a 20 hs" },
    { label: "Domingos", value: "Cerrado" },
  ],
};

const consultasData = [
  { nombre: "Malena Ruiz", email: "malena.ruiz@correo.com", telefono: "11 5555-0188", asunto: "Signos — Soda Stereo", canal: "whatsapp", estado: "pendiente", fecha: new Date("2026-08-06"), productoTitulo: "Signos", mensaje: "Hola! Vi que tienen Signos en primera edición argentina. ¿Sigue disponible? ¿Puedo pasar el sábado a la mañana a escucharlo antes de comprarlo?" },
  { nombre: "Tomás Vega", email: "tvega@correo.com", telefono: "11 4444-0122", asunto: "Technics SL-1200 MK2", canal: "formulario", estado: "pendiente", fecha: new Date("2026-08-06"), productoTitulo: "Technics SL-1200 MK2", mensaje: "Buenas, me interesa la bandeja. Necesito saber si la cápsula es nueva y si entregan factura. También si hacen envío a Vicente López." },
  { nombre: "Lucía Ferrán", email: "lu.ferran@correo.com", telefono: "11 6666-0710", asunto: "Vendo colección (≈180 vinilos)", canal: "instagram", estado: "leida", fecha: new Date("2026-08-05"), productoTitulo: null, mensaje: "Heredé la colección de mi viejo, son unos 180 discos de rock nacional y jazz de los 70 y 80. ¿Cómo hacemos para que los tasen?" },
  { nombre: "Diego Arrieta", email: "diego.a@correo.com", telefono: "11 3333-0455", asunto: "Hounds of Love — Kate Bush", canal: "whatsapp", estado: "respondida", fecha: new Date("2026-08-05"), productoTitulo: "Hounds of Love", mensaje: "¿Cuánto piden por el prensado inglés de Hounds of Love? Vi que dice a consultar." },
  { nombre: "Sol Benítez", email: "solben@correo.com", telefono: "11 2222-0967", asunto: "Thriller (cassette) — reserva", canal: "instagram", estado: "respondida", fecha: new Date("2026-08-04"), productoTitulo: "Thriller", mensaje: "Quiero reservar el cassette de Thriller hasta el viernes, paso a buscarlo después del trabajo." },
  { nombre: "Pablo Iriarte", email: "p.iriarte@correo.com", telefono: "11 7777-0231", asunto: "Busco: Peperina, primera edición", canal: "formulario", estado: "respondida", fecha: new Date("2026-08-03"), productoTitulo: null, mensaje: "Busco Peperina de Serú Girán, primera edición con la tapa sin el sticker. Si les entra alguno, avísenme por favor." },
];

async function main() {
  console.log("Borrando datos anteriores...");
  await prisma.consulta.deleteMany();
  await prisma.producto.deleteMany(); // esto borra tambien las Imagen (onDelete: Cascade)
  await prisma.categoria.deleteMany();
  await prisma.storeInfo.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creando el usuario super_admin...");
  const passwordhash = await bcrypt.hash(superAdminData.passwordPlana, 10);
  await prisma.user.create({
    data: {
      nombre: superAdminData.nombre,
      apellido: superAdminData.apellido,
      mail: superAdminData.mail,
      telefono: superAdminData.telefono,
      passwordhash,
      rol: "super_admin",
    },
  });

  console.log("Creando categorias...");
  const categoriasPorClave = {};
  for (const c of categoriasData) {
    const categoria = await prisma.categoria.create({
      data: { nombre: c.nombre, descripcion: c.descripcion, icono: c.icono },
    });
    categoriasPorClave[c.clave] = categoria.id;
  }

  console.log("Creando productos...");
  const productosPorTitulo = {};
  for (const p of productosData) {
    const producto = await prisma.producto.create({
      data: {
        nombre: `${p.titulo} — ${p.artista}`,
        anio: p.anio,
        precio: p.precio,
        // un par de ejemplos de descuento (por porcentaje y por monto fijo)
        ...(p.descuento && { descuento_tipo: p.descuento.tipo, descuento_valor: p.descuento.valor }),
        stock: p.stock,
        estado_stock: p.estado_stock,
        condicion: p.condicion,
        destacado: p.destacado,
        esActivo: true,
        descripcion: `Sello: ${p.sello}. ${p.descripcion}`,
        categoriaId: categoriasPorClave[p.categoria],
        // tapas y fotos reales de frontend/public/productos (ver CREDITOS.md).
        // Los que no tienen (compilado casero, discos que no existen) quedan
        // sin imagen y el frontend dibuja la tapa generica del formato.
        ...(p.imagen && { imagenes: { create: [{ url: urlFoto(p.imagen), alt: `${p.titulo} — ${p.artista}`, orden: 0 }] } }),
      },
    });
    productosPorTitulo[p.titulo] = producto.id;
  }

  // segunda tanda: 50 productos mas (prisma/productosExtra.js), mismo formato
  console.log("Creando la segunda tanda de productos...");
  for (const p of productosExtra) {
    const archivo = archivoFoto(p);
    await prisma.producto.create({
      data: {
        nombre: `${p.titulo} — ${p.artista}`,
        anio: p.anio,
        precio: p.precio,
        ...(p.descuento && { descuento_tipo: p.descuento.tipo, descuento_valor: p.descuento.valor }),
        stock: p.stock,
        estado_stock: p.estado_stock,
        condicion: p.condicion,
        destacado: p.destacado,
        esActivo: true,
        descripcion: `Sello: ${p.sello}. ${p.descripcion}`,
        categoriaId: categoriasPorClave[p.categoria],
        ...(archivo && { imagenes: { create: [{ url: urlFoto(`/productos/${archivo}`), alt: `${p.titulo} — ${p.artista}`, orden: 0 }] } }),
      },
    });
  }

  console.log("Creando info del local...");
  await prisma.storeInfo.create({ data: { id: 1, ...storeInfoData } });

  console.log("Creando consultas...");
  for (const c of consultasData) {
    await prisma.consulta.create({
      data: {
        nombre: c.nombre,
        email: c.email,
        telefono: c.telefono,
        asunto: c.asunto,
        mensaje: c.mensaje,
        canal: c.canal,
        estado: c.estado,
        fecha: c.fecha,
        productoId: c.productoTitulo ? productosPorTitulo[c.productoTitulo] : null,
      },
    });
  }

  console.log(`Listo: 1 super_admin, 4 categorias, ${productosData.length} productos, info del local y 6 consultas.`);
  console.log(`Login del super_admin -> mail: ${superAdminData.mail} / password: ${superAdminData.passwordPlana}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
