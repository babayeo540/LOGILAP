import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm'; // <-- C'est ici que l'importation est corrigée
import { NodePgDatabase, drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Vérifie si la variable d'environnement DATABASE_URL est bien définie
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Crée un pool de connexions pour PostgreSQL.
// Le paramètre ssl: { rejectUnauthorized: false } est crucial pour Render et d'autres services cloud.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialise Drizzle-ORM avec le pool de connexions et le schéma
export const db = drizzlePg(pool, { schema });