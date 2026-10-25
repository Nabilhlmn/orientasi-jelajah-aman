// src/db/database.web.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const KUNCI_STORAGE = "@jelajah_aman:sqlite_web_cache";

interface BarisCache {
  kunci: string;
  kota_id: number;
  nama_kota: string;
  latitude: number;
  longitude: number;
  cuaca_json: string;
  aqi_json: string;
  disimpan_pada: number;
}

async function bacaSemua(): Promise<Record<string, BarisCache>> {
  try {
    const raw = await AsyncStorage.getItem(KUNCI_STORAGE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function simpanSemua(data: Record<string, BarisCache>): Promise<void> {
  await AsyncStorage.setItem(KUNCI_STORAGE, JSON.stringify(data));
}

// Adapter web yang meniru method expo-sqlite tanpa memuat modul native expo-sqlite
class SQLiteWebAdapter {
  async execAsync(_sql: string): Promise<void> {
    // Tidak ada migrasi DDL khusus yang diperlukan di web
  }

  async runAsync(sql: string, params: any[] = []): Promise<void> {
    const trimmed = sql.trim().toUpperCase();
    const data = await bacaSemua();

    if (trimmed.startsWith("INSERT OR REPLACE")) {
      const [
        kunci,
        kota_id,
        nama_kota,
        latitude,
        longitude,
        cuaca_json,
        aqi_json,
        disimpan_pada,
      ] = params;

      data[kunci] = {
        kunci,
        kota_id,
        nama_kota,
        latitude,
        longitude,
        cuaca_json,
        aqi_json,
        disimpan_pada,
      };
      await simpanSemua(data);
    } else if (trimmed.startsWith("DELETE FROM CACHE_CUACA WHERE DISIMPAN_PADA <")) {
      const batasWaktu = params[0] as number;
      for (const k of Object.keys(data)) {
        if (data[k].disimpan_pada < batasWaktu) {
          delete data[k];
        }
      }
      await simpanSemua(data);
    } else if (trimmed.startsWith("DELETE FROM CACHE_CUACA WHERE KUNCI =")) {
      const kunciHapus = params[0] as string;
      if (kunciHapus && data[kunciHapus]) {
        delete data[kunciHapus];
        await simpanSemua(data);
      }
    } else if (trimmed.startsWith("DELETE FROM CACHE_CUACA")) {
      await simpanSemua({});
    }
  }

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    const data = await bacaSemua();
    const kunci = params[0] as string;
    const baris = data[kunci];
    return (baris as unknown as T) || null;
  }

  async getAllAsync<T>(_sql: string, _params: any[] = []): Promise<T[]> {
    const data = await bacaSemua();
    const daftar = Object.values(data);
    daftar.sort((a, b) => b.disimpan_pada - a.disimpan_pada);
    return daftar as unknown as T[];
  }
}

const instanceWeb = new SQLiteWebAdapter();

export async function inisialisasiDatabase(_db?: any): Promise<void> {
  // Sudah siap di web
}

export async function ambilDatabase(): Promise<any> {
  return instanceWeb;
}
