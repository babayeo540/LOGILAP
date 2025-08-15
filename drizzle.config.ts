import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Chargez les variables d'environnement depuis le fichier .env
dotenv.config({ path: "./.env" });

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
