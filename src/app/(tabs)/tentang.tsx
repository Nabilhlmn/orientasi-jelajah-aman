// src/app/(tabs)/tentang.tsx
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from "../../context/ThemeContext";

export default function TabTentang() {
  const { theme } = useThemeContext();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Banner Kartu Header */}
        <View
          style={[
            styles.bannerCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Ionicons name="cloudy-night" size={40} color={theme.primary} />
          </View>
          <Text
            accessibilityLabel="Judul halaman Tentang"
            style={[styles.judul, { color: theme.text }]}
          >
            Jelajah Aman
          </Text>
          <Text style={[styles.subjudul, { color: theme.primary }]}>
            Pemantau Cuaca & Kualitas Udara Cerdas
          </Text>
          <Text style={[styles.versiTag, { color: theme.textSecondary }]}>
            Versi 1.0.0
          </Text>
        </View>

        {/* Seksi Detail Pengembang & Fitur */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardHeader, { color: theme.text }]}>
            Informasi Proyek
          </Text>

          <View style={[styles.rowItem, { borderBottomColor: theme.border }]}>
            <Ionicons name="person-outline" size={18} color={theme.primary} />
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>
              Pengembang:
            </Text>
            <Text style={[styles.rowValue, { color: theme.text }]}>
              Muhammad Nabil Hilman
            </Text>
          </View>

          <View style={[styles.rowItem, { borderBottomColor: theme.border }]}>
            <Ionicons name="school-outline" size={18} color={theme.primary} />
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>
              Praktikum:
            </Text>
            <Text style={[styles.rowValue, { color: theme.text }]}>
              Pemrograman Basis Platform
            </Text>
          </View>

          <View style={[styles.rowItem, { borderBottomColor: theme.border }]}>
            <Ionicons name="layers-outline" size={18} color={theme.primary} />
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>
              Teknologi:
            </Text>
            <Text style={[styles.rowValue, { color: theme.text }]}>
              Expo SDK 57, React Native 0.86
            </Text>
          </View>

          <View style={[styles.rowItem, { borderBottomWidth: 0 }]}>
            <Ionicons name="server-outline" size={18} color={theme.primary} />
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>
              Penyimpanan:
            </Text>
            <Text style={[styles.rowValue, { color: theme.text }]}>
              SQLite (Mobile) & AsyncStorage (Web)
            </Text>
          </View>
        </View>

        {/* Catatan Keterangan */}
        <View
          style={[
            styles.keteranganBox,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color={theme.success} />
          <Text style={[styles.keterangan, { color: theme.textSecondary }]}>
            Aplikasi ini mendukung arsitektur Offline-First, pencarian instan, riwayat pencarian
            lokal, penghapusan cache yang aman, dan pergantian tema gelap/terang secara dinamis.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  bannerCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  judul: {
    fontSize: 24,
    fontWeight: "700",
  },
  subjudul: {
    fontSize: 14,
    fontWeight: "600",
  },
  versiTag: {
    fontSize: 12,
    marginTop: 2,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  keteranganBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  keterangan: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
