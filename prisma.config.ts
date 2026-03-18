// prisma.config.ts
import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // Caminhos absolutos (evita bugs de path no Windows)
  schema: path.resolve('prisma/schema.prisma'),

  migrations: {
    path: path.resolve('prisma/migrations'),
  },

  // Engine padrão do Prisma 6 é "library". Só use "classic" se você tem um motivo.
  // Se você estava usando classic por conta de ambiente, pode manter.
  engine: 'classic',

  datasource: {
    url: env('DATABASE_URL'),
  },
});
