import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

const connectionString = 'postgresql://neondb_owner:npg_JKfVe1Scpz7R@ep-proud-resonance-afmhcyuk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });