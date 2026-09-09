import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

let database: ReturnType<typeof createDatabase> | undefined;

function createDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const client = postgres(connectionString, {
    max: 1,
    prepare: false,
  });

  return drizzle(client, { schema });
}

export function getDatabase() {
  database ??= createDatabase();
  return database;
}
