// src/services/favoritStorage.ts 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KotaFavorit } from "../types/favorit";

const KUNCI_PENYIMPANAN = "@jelajah_aman:favorit";

/**
 * Mengambil semua kota favorit yang tersimpan.
 */
export async function ambilSemuaFavorit(): Promise<KotaFavorit[]> {
  try {
    const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Mengecek apakah kota tertentu sudah tersimpan di daftar favorit.
 */
export async function cekApakahFavorit(kota: {
  id?: number | string;
  nama: string;
}): Promise<boolean> {
  try {
    const daftar = await ambilSemuaFavorit();
    return daftar.some((k) => {
      const matchId =
        kota.id !== undefined &&
        kota.id !== null &&
        !Number.isNaN(Number(kota.id)) &&
        Number(kota.id) !== 0 &&
        String(k.id) === String(kota.id);

      const matchNama =
        kota.nama &&
        k.nama &&
        k.nama.trim().toLowerCase() === kota.nama.trim().toLowerCase();

      return matchId || matchNama;
    });
  } catch {
    return false;
  }
}

/**
 * Menambahkan kota ke daftar favorit.
 */
export async function tambahFavorit(kota: KotaFavorit): Promise<KotaFavorit[]> {
  try {
    const daftar = await ambilSemuaFavorit();
    const sudahAda = daftar.some((k) => {
      const matchId =
        kota.id !== undefined &&
        kota.id !== null &&
        !Number.isNaN(Number(kota.id)) &&
        Number(kota.id) !== 0 &&
        String(k.id) === String(kota.id);

      const matchNama =
        kota.nama &&
        k.nama &&
        k.nama.trim().toLowerCase() === kota.nama.trim().toLowerCase();

      return matchId || matchNama;
    });

    if (sudahAda) return daftar;

    const itemBaru: KotaFavorit = {
      id: Number(kota.id) || Date.now(),
      nama: kota.nama,
      latitude: Number(kota.latitude) || 0,
      longitude: Number(kota.longitude) || 0,
    };

    const daftarBaru = [...daftar, itemBaru];
    await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarBaru));
    return daftarBaru;
  } catch {
    return [];
  }
}

/**
 * Menghapus kota dari daftar favorit berdasarkan id dan/atau nama.
 */
export async function hapusFavorit(
  id?: number | string,
  nama?: string
): Promise<KotaFavorit[]> {
  try {
    const daftar = await ambilSemuaFavorit();
    const daftarBaru = daftar.filter((k) => {
      const matchId =
        id !== undefined &&
        id !== null &&
        !Number.isNaN(Number(id)) &&
        Number(id) !== 0 &&
        String(k.id) === String(id);

      const matchNama =
        nama &&
        k.nama &&
        k.nama.trim().toLowerCase() === nama.trim().toLowerCase();

      // Buang item jika ID atau Nama cocok
      return !(matchId || matchNama);
    });

    await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarBaru));
    return daftarBaru;
  } catch {
    return [];
  }
}
