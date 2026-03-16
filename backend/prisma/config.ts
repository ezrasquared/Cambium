import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "ts-node scripts/seed.ts"
  },
  datasource: {
    url: process.env.DATABASE_URL
  }
});