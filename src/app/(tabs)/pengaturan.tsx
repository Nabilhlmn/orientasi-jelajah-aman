// src/app/(tabs)/pengaturan.tsx
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ThemeMode, useThemeContext } from "../../context/ThemeContext";

interface OpsiTema {
  id: ThemeMode;
  label: string;
  deskripsi: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const DAFTAR_OPSI_TEMA: OpsiTema[] = [
  {
    id: "light",
    label: "Terang",
    deskripsi: "Tema cerah dengan kontras bersih untuk siang hari",
    icon: "sunny",
  },
  {
    id: "dark",
    label: "Gelap",
    deskripsi: "Tema gelap yang nyaman di mata untuk kondisi minim cahaya",
    icon: "moon",
  },
  {
    id: "system",
    label: "Ikuti Sistem",
    deskripsi: "Menyesuaikan otomatis dengan pengaturan sistem perangkat Anda",
    icon: "phone-portrait-outline",
  },
];

export default function TabPengaturan() {
  const { mode, setMode, theme, isDark } = useThemeContext();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Seksi Pilihan Mode Tampilan */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            MODE TAMPILAN
          </Text>

          <View
            style={[
              styles.cardGroup,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {DAFTAR_OPSI_TEMA.map((opsi, index) => {
              const isSelected = mode === opsi.id;
              const isLast = index === DAFTAR_OPSI_TEMA.length - 1;

              return (
                <TouchableOpacity
                  key={opsi.id}
                  style={[
                    styles.opsiRow,
                    { borderBottomColor: theme.border },
                    !isLast && { borderBottomWidth: 1 },
                    isSelected && {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                    },
                  ]}
                  onPress={() => setMode(opsi.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isSelected
                          ? theme.primaryLight
                          : theme.backgroundElement,
                      },
                    ]}
                  >
                    <Ionicons
                      name={opsi.icon}
                      size={20}
                      color={isSelected ? theme.primary : theme.textSecondary}
                    />
                  </View>

                  <View style={styles.opsiTextWrap}>
                    <Text
                      style={[
                        styles.opsiLabel,
                        {
                          color: isSelected ? theme.primary : theme.text,
                          fontWeight: isSelected ? "700" : "600",
                        },
                      ]}
                    >
                      {opsi.label}
                    </Text>
                    <Text
                      style={[styles.opsiDeskripsi, { color: theme.textSecondary }]}
                    >
                      {opsi.deskripsi}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radioOuter,
                      {
                        borderColor: isSelected
                          ? theme.primary
                          : theme.border,
                      },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: theme.primary },
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Seksi Informasi Aplikasi */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            TENTANG APLIKASI
          </Text>

          <View
            style={[
              styles.cardGroup,
              { backgroundColor: theme.card, borderColor: theme.border, padding: 16 },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: theme.primaryLight, width: 44, height: 44 },
                ]}
              >
                <Ionicons name="compass" size={24} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.appTitle, { color: theme.text }]}>
                  Jelajah Aman
                </Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                  Versi 1.0.0 (Expo SDK 57)
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.divider,
                { backgroundColor: theme.border, marginVertical: 12 },
              ]}
            />

            <Text style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 18 }}>
              Aplikasi pemantau cuaca dan kualitas udara (AQI) berbasis offline-first. Mendukung
              platform Mobile (Android & iOS) serta Web Browser.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  cardGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  opsiRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  opsiTextWrap: {
    flex: 1,
  },
  opsiLabel: {
    fontSize: 15,
  },
  opsiDeskripsi: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    width: "100%",
  },
});
