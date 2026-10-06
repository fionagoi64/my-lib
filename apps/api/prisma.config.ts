import dotenv from 'dotenv';
import path from 'path';

import { defineConfig, env } from 'prisma/config';

const nodeEnv = process.env.NODE_ENV || 'local';

dotenv.config({
  path: path.resolve(__dirname, `../../.env.${nodeEnv}`),
});

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },

  datasource: {
    url: env('DATABASE_URL'),
  },
});
