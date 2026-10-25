// src/db/database.ts
import * as SQLite from "expo-sqlite";

const NAMA_DATABASE = "cuaca.db";
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function inisialisasiDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS cache_cuaca (
      kunci TEXT PRIMARY KEY NOT NULL,
      kota_id INTEGER NOT NULL,
      nama_kota TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      cuaca_json TEXT NOT NULL,
      aqi_json TEXT NOT NULL,
      disimpan_pada INTEGER NOT NULL
    );
  `);
}

export async function ambilDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(NAMA_DATABASE);
    await inisialisasiDatabase(dbInstance);
  }
  return dbInstance;
}
