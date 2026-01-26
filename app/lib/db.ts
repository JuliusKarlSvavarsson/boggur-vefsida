import { neon } from "@neondatabase/serverless";

export function getSql() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Please add it to your .env.local file (Neon Postgres connection string).",
    );
  }

  return neon(connectionString);
}
