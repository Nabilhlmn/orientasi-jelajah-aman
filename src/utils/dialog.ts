import { Alert, Platform } from "react-native";

/**
 * Menampilkan dialog konfirmasi penghapusan yang kompatibel secara sempurna
 * baik di Expo Go (Android & iOS) maupun di Browser Web.
 *
 * @param judul Judul konfirmasi (misal: "Hapus Cache Kota")
 * @param pesan Pesan penjelasan konfirmasi
 * @param onKonfirmasi Callback yang dipanggil jika pengguna memilih "Hapus" / "OK"
 */
export function konfirmasiHapus(
  judul: string,
  pesan: string,
  onKonfirmasi: () => void | Promise<void>
): void {
  if (Platform.OS === "web") {
    // Pada Browser Web, gunakan window.confirm standar yang responsif dan tidak memicu error konsol
    if (typeof window !== "undefined") {
      const setuju = window.confirm(`${judul}\n\n${pesan}`);
      if (setuju) {
        onKonfirmasi();
      }
    } else {
      onKonfirmasi();
    }
  } else {
    // Pada Mobile (Expo Go), gunakan Alert.alert bawaan React Native dengan tombol Hapus & Batal
    Alert.alert(
      judul,
      pesan,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: onKonfirmasi,
        },
      ],
      { cancelable: true }
    );
  }
}
