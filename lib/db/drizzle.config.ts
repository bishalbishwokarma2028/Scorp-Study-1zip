import { defineConfig } from "drizzle-kit";
import path from "path";

const rawUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!rawUrl) {
  throw new Error("SUPABASE_DB_URL or DATABASE_URL must be set");
}

const url = rawUrl.includes("sslmode") ? rawUrl : `${rawUrl}?sslmode=require`;

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: { url },
});
