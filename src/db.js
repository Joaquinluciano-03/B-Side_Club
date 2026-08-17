// Carga las variables del archivo .env (DATABASE_URL, etc.) en process.env
require("dotenv").config();

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

// El adapter es lo que conecta Prisma con Postgres usando la URL del .env
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// "prisma" es el objeto que vamos a usar en el resto del backend para hablar con la base.
// Se crea UNA sola vez aca, y el resto de los archivos lo importan con require("./db")
// en vez de abrir una conexion nueva cada uno.
const prisma = new PrismaClient({ adapter });

module.exports = { prisma };
