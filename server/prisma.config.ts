import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7 reads the connection string from this file (not from schema.prisma).
// `prisma generate` does not connect, so a missing DATABASE_URL must not break installs/builds;
// migration commands will fail with a connection error if it is not set.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
