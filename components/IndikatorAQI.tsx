// components/IndikatorAQI.tsx
import { View, Text } from "react-native";
import { LaporanUdara } from "../types/cuaca";

export type IndikatorAQIProps =
  | LaporanUdara
  | { laporan: LaporanUdara }
  | { data: LaporanUdara };

export default function IndikatorAQI(props: IndikatorAQIProps) {
  const data: LaporanUdara =
    "laporan" in props ? props.laporan : "data" in props ? props.data : props;
  const { kota, indeksAQI, tingkat, diperbaruiPada } = data;

  const getWarnaAQI = (status: LaporanUdara["tingkat"]) => {
    switch (status) {
      case "BAIK":
        return "green";
      case "SEDANG":
        return "orange";
      case "TIDAK_SEHAT":
        return "red";
      case "BERBAHAYA":
        return "purple";
      default:
        return "black";
    }
  };

  const warnaAQI = getWarnaAQI(tingkat);

  return (
    <View style={{ padding: 16, borderRadius: 8, backgroundColor: "#F4F7FA" }}>
      <Text style={{ fontWeight: "bold", fontSize: 18 }}>{kota}</Text>
      <Text style={{ fontSize: 32 }}>AQI: {indeksAQI}</Text>
      <Text style={{ color: warnaAQI, fontWeight: "bold" }}>
        Kualitas Udara: {tingkat}
      </Text>
      {diperbaruiPada ? (
        <Text style={{ fontSize: 12, color: "gray", marginTop: 4 }}>
          Diperbarui pada: {diperbaruiPada}
        </Text>
      ) : null}
    </View>
  );
}
