
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  driver: 'pg',
  dbCredentials: {
    connectionString: 'postgresql://neondb_owner:npg_JKfVe1Scpz7R@ep-proud-resonance-afmhcyuk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  }
});
