// src/components/StatusData.tsx 
import { Text, View } from "react-native";
import { SumberData } from "../types/cache";
import { useThemeContext } from "../context/ThemeContext";

interface StatusDataProps {
  sumber: SumberData;
  disimpanPada: number;
}

function formatUmur(disimpanPada: number): string {
  const menit = Math.floor((Date.now() - disimpanPada) / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return menit + " menit lalu";
  const jam = Math.floor(menit / 60);
  if (jam < 24) return jam + " jam lalu";
  return Math.floor(jam / 24) + " hari lalu";
}

function labelSumber(sumber: SumberData): string {
  if (sumber === "jaringan") return "Data terbaru dari internet";
  if (sumber === "cache-segar") return "Data tersimpan di cache (masih segar)";
  return "Mode offline - data tersimpan mungkin sudah usang";
}

export default function StatusData({ sumber, disimpanPada }: StatusDataProps) {
  const { isDark } = useThemeContext();
  const basi = sumber === "cache-basi";
  const label = labelSumber(sumber);
  const umur = formatUmur(disimpanPada);

  const bgWarna = basi
    ? isDark
      ? "#451A03"
      : "#FEF3C7"
    : isDark
    ? "#064E3B"
    : "#D1FAE5";

  const teksWarna = basi
    ? isDark
      ? "#FCD34D"
      : "#B45309"
    : isDark
    ? "#6EE7B7"
    : "#065F46";

  return (
    <View
      accessible
      accessibilityLabel={label + ", diperbarui " + umur}
      style={{
        padding: 10,
        borderRadius: 10,
        backgroundColor: bgWarna,
        borderWidth: 1,
        borderColor: basi ? (isDark ? "#78350F" : "#FDE68A") : isDark ? "#047857" : "#A7F3D0",
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "600", color: teksWarna }}>{label}</Text>
      <Text style={{ fontSize: 11, color: isDark ? "#94A3B8" : "#4B5563", marginTop: 2 }}>
        Diperbarui {umur}
      </Text>
    </View>
  );
}