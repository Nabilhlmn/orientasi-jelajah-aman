import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WeatherCard from "../../components/WeatherCard";
import { useThemeContext } from "../../context/ThemeContext";
import {
  cekApakahFavorit,
  hapusFavorit,
  tambahFavorit,
} from "../../services/favoritStorage";
import { konfirmasiHapus } from "../../utils/dialog";

export default function HalamanDetail() {
  const { kota } = useLocalSearchParams<{ kota: string }>();
  const { theme } = useThemeContext();
  const [sudahFavorit, setSudahFavorit] = useState(false);
  const namaKota = kota || "Kota";

  useEffect(() => {
    if (namaKota) {
      cekApakahFavorit({ nama: namaKota }).then(setSudahFavorit);
    }
  }, [namaKota]);

  async function handleToggleFavorit() {
    if (sudahFavorit) {
      konfirmasiHapus(
        "Hapus Favorit",
        `Apakah Anda yakin ingin menghapus "${namaKota}" dari daftar favorit?`,
        async () => {
          await hapusFavorit(undefined, namaKota);
          setSudahFavorit(false);
        }
      );
    } else {
      await tambahFavorit({
        id: Date.now(),
        nama: namaKota,
        latitude: 0,
        longitude: 0,
      });
      setSudahFavorit(true);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <WeatherCard kota={namaKota} suhu={29} tingkatAQI="BAIK" />
      <TouchableOpacity
        style={[
          styles.tombol,
          {
            backgroundColor: sudahFavorit ? theme.dangerLight : theme.primary,
            borderWidth: sudahFavorit ? 1 : 0,
            borderColor: sudahFavorit ? theme.danger : "transparent",
          },
        ]}
        onPress={handleToggleFavorit}
      >
        <Ionicons
          name={sudahFavorit ? "heart-dislike" : "heart"}
          size={18}
          color={sudahFavorit ? theme.danger : "#FFF"}
          style={{ marginRight: 8 }}
        />
        <Text
          style={[
            styles.teksTombol,
            { color: sudahFavorit ? theme.danger : "#FFFFFF" },
          ]}
        >
          {sudahFavorit ? "Hapus dari Favorit" : "Tambahkan ke Favorit"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  tombol: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  teksTombol: {
    fontSize: 15,
    fontWeight: "600",
  },
});
