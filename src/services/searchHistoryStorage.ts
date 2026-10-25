import AsyncStorage from "@react-native-async-storage/async-storage";

export interface RiwayatPencarianKota {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  waktu: number; // timestamp ms
}

const KUNCI_STORAGE = "@jelajah_aman:riwayat_pencarian";
const MAKSIMAL_RIWAYAT = 10;

/**
 * Mengambil seluruh riwayat pencarian terakhir yang tersimpan di perangkat.
 */
export async function ambilRiwayatPencarian(): Promise<RiwayatPencarianKota[]> {
  try {
    const raw = await AsyncStorage.getItem(KUNCI_STORAGE);
    if (!raw) return [];
    const parsed: RiwayatPencarianKota[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Menambahkan kota ke riwayat pencarian (maksimal 10 item).
 * Jika kota sudah ada sebelumnya, posisinya akan dinaikkan ke paling atas.
 */
export async function tambahRiwayatPencarian(
  kota: Omit<RiwayatPencarianKota, "waktu">
): Promise<RiwayatPencarianKota[]> {
  try {
    const daftar = await ambilRiwayatPencarian();

    // Hapus duplikasi berdasarkan nama (case-insensitive) atau id jika id valid (> 0)
    const disaring = daftar.filter((k) => {
      if (kota.id > 0 && k.id === kota.id) return false;
      return k.nama.trim().toLowerCase() !== kota.nama.trim().toLowerCase();
    });

    const itemBaru: RiwayatPencarianKota = {
      ...kota,
      waktu: Date.now(),
    };

    const daftarBaru = [itemBaru, ...disaring].slice(0, MAKSIMAL_RIWAYAT);
    await AsyncStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftarBaru));
    return daftarBaru;
  } catch {
    return [];
  }
}

/**
 * Menghapus satu item dari riwayat pencarian.
 */
export async function hapusSatuRiwayatPencarian(
  id: number,
  nama?: string
): Promise<RiwayatPencarianKota[]> {
  try {
    const daftar = await ambilRiwayatPencarian();
    const daftarBaru = daftar.filter((k) => {
      if (id > 0 && k.id === id) return false;
      if (nama && k.nama.trim().toLowerCase() === nama.trim().toLowerCase()) return false;
      return true;
    });
    await AsyncStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftarBaru));
    return daftarBaru;
  } catch {
    return [];
  }
}

/**
 * Menghapus seluruh riwayat pencarian.
 */
export async function hapusSemuaRiwayatPencarian(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KUNCI_STORAGE);
  } catch {
    // abaikan error
  }
}
