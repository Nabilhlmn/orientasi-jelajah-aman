// src/app/(tabs)/riwayat.tsx
import { useFocusEffect, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Button, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import {
  ambilRiwayatPencarian,
  hapusSatuRiwayatPencarian,
  hapusSemuaRiwayatPencarian,
  RiwayatPencarianKota,
} from "../../services/searchHistoryStorage";
import { KotaFavorit } from "../../types/favorit";

function formatWaktu(ms: number): string {
  const selisihDetik = Math.floor((Date.now() - ms) / 1000);
  if (selisihDetik < 60) return "Baru saja";
  const selisihMenit = Math.floor(selisihDetik / 60);
  if (selisihMenit < 60) return `${selisihMenit} menit lalu`;
  const selisihJam = Math.floor(selisihMenit / 60);
  if (selisihJam < 24) return `${selisihJam} jam lalu`;
  const selisihHari = Math.floor(selisihJam / 24);
  return `${selisihHari} hari lalu`;
}

export default function TabRiwayat() {
  const [tabAktif, setTabAktif] = useState<"favorit" | "riwayat">("favorit");
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarRiwayat, setDaftarRiwayat] = useState<RiwayatPencarianKota[]>([]);

  const muatData = useCallback(async () => {
    try {
      const [fav, riw] = await Promise.all([
        ambilSemuaFavorit(),
        ambilRiwayatPencarian(),
      ]);
      setDaftarFavorit(fav);
      setDaftarRiwayat(riw);
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatData();
    }, [muatData])
  );

  async function handleHapusFavorit(kota: KotaFavorit) {
    Alert.alert(
      "Konfirmasi",
      `Yakin hapus ${kota.nama} dari favorit?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            await hapusFavorit(kota.id, kota.nama);
            muatData();
          },
        },
      ]
    );

    if (Platform.OS === "web") {
      if (window.confirm(`Yakin hapus ${kota.nama} dari favorit?`)) {
        await hapusFavorit(kota.id, kota.nama);
        muatData();
      }
    }
  }

  function bukaKotaDiBeranda(item: {
    id: number;
    nama: string;
    latitude: number;
    longitude: number;
  }) {
    router.navigate({
      pathname: "/(tabs)",
      params: {
        cariId: String(item.id),
        cariNama: item.nama,
        cariLat: String(item.latitude),
        cariLon: String(item.longitude),
        t: String(Date.now()),
      },
    });
  }

  async function handleHapusSatuRiwayat(item: RiwayatPencarianKota) {
    const sisa = await hapusSatuRiwayatPencarian(item.id, item.nama);
    setDaftarRiwayat(sisa);
  }

  async function handleHapusSemuaRiwayat() {
    await hapusSemuaRiwayatPencarian();
    setDaftarRiwayat([]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tabButton, tabAktif === "favorit" && styles.tabButtonActive]}
          onPress={() => setTabAktif("favorit")}
        >
          <Text style={[styles.tabText, tabAktif === "favorit" && styles.tabTextActive]}>
            Kota Favorit ({daftarFavorit.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tabAktif === "riwayat" && styles.tabButtonActive]}
          onPress={() => setTabAktif("riwayat")}
        >
          <Text style={[styles.tabText, tabAktif === "riwayat" && styles.tabTextActive]}>
            Riwayat Pencarian ({daftarRiwayat.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tabAktif === "favorit" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.heading}>Kota Favorit Tersimpan</Text>
            {daftarFavorit.length === 0 ? (
              <Text style={styles.teksKosong}>Belum ada kota favorit yang disimpan.</Text>
            ) : (
              daftarFavorit.map((kota) => (
                <View key={kota.id} style={styles.itemCard}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() =>
                      bukaKotaDiBeranda({
                        id: kota.id,
                        nama: kota.nama,
                        latitude: kota.latitude,
                        longitude: kota.longitude,
                      })
                    }
                  >
                    <Text style={styles.itemTitle}>{kota.nama}</Text>
                  </TouchableOpacity>
                  <Button title="Hapus" onPress={() => handleHapusFavorit(kota)} />
                </View>
              ))
            )}
          </View>
        )}

        {tabAktif === "riwayat" && (
          <View style={styles.sectionWrap}>
            <View style={styles.rowBetween}>
              <Text style={styles.heading}>10 Pencarian Terakhir</Text>
              {daftarRiwayat.length > 0 && (
                <Button title="Hapus Semua" onPress={handleHapusSemuaRiwayat} />
              )}
            </View>

            {daftarRiwayat.length === 0 ? (
              <Text style={styles.teksKosong}>Belum ada riwayat pencarian.</Text>
            ) : (
              daftarRiwayat.map((item) => (
                <View key={`${item.id}-${item.waktu}`} style={styles.itemCard}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => bukaKotaDiBeranda(item)}
                  >
                    <Text style={styles.itemTitle}>{item.nama}</Text>
                    <Text style={styles.itemSub}>
                      {[item.country, formatWaktu(item.waktu)].filter(Boolean).join(" • ")}
                    </Text>
                  </TouchableOpacity>
                  <Button title="Hapus" onPress={() => handleHapusSatuRiwayat(item)} />
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  tabButtonActive: {
    backgroundColor: "#0284C7",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  sectionWrap: {
    gap: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teksKosong: {
    color: "#94A3B8",
    fontStyle: "italic",
    paddingVertical: 8,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
});
