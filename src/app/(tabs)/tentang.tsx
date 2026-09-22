import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../constants/styles";

export default function TabTentang() {
  return (
    <SafeAreaView style={styles.container}>
      <Text
        accessibilityLabel="Judul halaman Tentang"
        style={styles.judul}
      >
        Jelajah Aman
      </Text>
      <Text style={styles.subjudul}>Aplikasi Pemantau Cuaca & Kualitas Udara</Text>
      <Text style={styles.isi}>Versi: 1.0.0</Text>
      <Text style={styles.isi}>Pembuat: Muhammad Nabil Hilman</Text>
      <Text style={styles.keterangan}>
        Dikembangkan untuk latihan praktikum Pemrograman Basis Platform.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.sedang,
    gap: spacing.kecil,
  },
  judul: {
    fontSize: typeScale.judul,
    fontWeight: "bold",
  },
  subjudul: {
    fontSize: typeScale.subjudul,
    fontWeight: "600",
  },
  isi: {
    fontSize: typeScale.isi,
  },
  keterangan: {
    fontSize: typeScale.keterangan,
    color: "#666",
  },
});
