// src/app/tambah-favorit.tsx 
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from "../context/ThemeContext";
import {
  cekApakahFavorit,
  tambahFavorit,
  hapusFavorit,
} from "../services/favoritStorage";

export default function ModalTambahFavorit() {
  const { theme } = useThemeContext();
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();

  const [sudahAda, setSudahAda] = useState(false);

  useEffect(() => {
    if (nama) {
      cekApakahFavorit({ id, nama }).then(setSudahAda);
    }
  }, [id, nama]);

  async function handleAksi() {
    if (sudahAda) {
      await hapusFavorit(id, nama);
    } else {
      await tambahFavorit({
        id: Number(id) || Date.now(),
        nama: nama || "Kota",
        latitude: Number(lat) || 0,
        longitude: Number(lon) || 0,
      });
    }
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: sudahAda ? theme.dangerLight : theme.primaryLight },
          ]}
        >
          <Ionicons
            name={sudahAda ? "heart-dislike" : "heart"}
            size={32}
            color={sudahAda ? theme.danger : theme.primary}
          />
        </View>

        <Text style={[styles.judul, { color: theme.text }]}>
          {sudahAda ? "Sudah di Favorit" : "Tambah ke Favorit"}
        </Text>
        <Text style={[styles.deskripsi, { color: theme.textSecondary }]}>
          {sudahAda ? (
            <>
              Kota <Text style={{ fontWeight: "700", color: theme.text }}>{nama}</Text> sudah
              tersimpan di daftar favorit Anda.
            </>
          ) : (
            <>
              Apakah Anda ingin menyimpan kota{" "}
              <Text style={{ fontWeight: "700", color: theme.text }}>{nama}</Text> ke daftar
              favorit?
            </>
          )}
        </Text>

        <View style={styles.tombolRow}>
          <TouchableOpacity
            style={[
              styles.tombol,
              { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={{ color: theme.text, fontWeight: "600" }}>Batal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tombol,
              { backgroundColor: sudahAda ? theme.danger : theme.primary },
            ]}
            onPress={handleAksi}
          >
            <Text style={{ color: "#FFF", fontWeight: "700" }}>
              {sudahAda ? "Hapus Favorit" : "Simpan"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  judul: {
    fontSize: 20,
    fontWeight: "700",
  },
  deskripsi: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  tombolRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    width: "100%",
  },
  tombol: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
