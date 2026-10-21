import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // process.env y no env("DIRECT_URL"): env() corta con error si la variable
    // no existe, y "prisma generate" (que corre en el build de Netlify) no se
    // conecta a la base, asi que no deberia necesitarla. Los comandos que si
    // se conectan (db push, migrate) siguen avisando si falta.
    url: process.env.DIRECT_URL ?? "",
  },
});
