// src/components/WeatherCard.tsx
import { Text, View } from "react-native";
import { spacing, typeScale } from "../constants/styles";
import { TingkatAQI, WeatherCardProps } from "../types/cuaca";
import { useThemeContext } from "../context/ThemeContext";

const warnaPerTingkat: Record<TingkatAQI, string> = {
  BAIK: "#10B981",
  SEDANG: "#F59E0B",
  TIDAK_SEHAT: "#F97316",
  BERBAHAYA: "#EF4444",
};

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
}: WeatherCardProps) {
  const { theme } = useThemeContext();

  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} (${tingkatAQI})`
      : `AQI: ${tingkatAQI}`;
  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: spacing.sedang,
        borderRadius: 16,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: typeScale.judul, color: theme.text }}>
        {kota}
      </Text>
      <Text style={{ fontSize: 40, fontWeight: "700", color: theme.text, marginVertical: 4 }}>
        {suhu}°C
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: warnaPerTingkat[tingkatAQI],
            marginRight: 6,
          }}
        />
        <Text
          style={{
            color: warnaPerTingkat[tingkatAQI],
            fontSize: typeScale.isi,
            fontWeight: "600",
          }}
        >
          {teksAQI}
        </Text>
      </View>
    </View>
  );
}
