// src/app/(tabs)/riwayat.tsx
import { useFocusEffect, router } from "expo-router";
import { useCallback, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import {
  ambilRiwayatPencarian,
  hapusSatuRiwayatPencarian,
  hapusSemuaRiwayatPencarian,
  RiwayatPencarianKota,
} from "../../services/searchHistoryStorage";
import {
  daftarKotaTersimpan,
  hapusCacheKota,
  hapusSemuaCache,
} from "../../services/cacheRepository";
import { KotaFavorit } from "../../types/favorit";
import { RingkasanKotaTersimpan } from "../../types/cache";
import { konfirmasiHapus } from "../../utils/dialog";

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
  const [tabAktif, setTabAktif] = useState<"favorit" | "riwayat" | "cache">("favorit");
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarRiwayat, setDaftarRiwayat] = useState<RiwayatPencarianKota[]>([]);
  const [daftarCache, setDaftarCache] = useState<RingkasanKotaTersimpan[]>([]);

  const muatData = useCallback(async () => {
    try {
      const [fav, riw, cch] = await Promise.all([
        ambilSemuaFavorit(),
        ambilRiwayatPencarian(),
        daftarKotaTersimpan(),
      ]);
      setDaftarFavorit(fav);
      setDaftarRiwayat(riw);
      setDaftarCache(cch);
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatData();
    }, [muatData])
  );

  function handleHapusFavorit(kota: KotaFavorit) {
    konfirmasiHapus(
      "Hapus Favorit",
      `Apakah Anda yakin ingin menghapus kota "${kota.nama}" dari daftar favorit?`,
      async () => {
        await hapusFavorit(kota.id, kota.nama);
        muatData();
      }
    );
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

  function handleHapusSatuRiwayat(item: RiwayatPencarianKota) {
    konfirmasiHapus(
      "Hapus Riwayat",
      `Hapus riwayat pencarian untuk kota "${item.nama}"?`,
      async () => {
        const sisa = await hapusSatuRiwayatPencarian(item.id, item.nama);
        setDaftarRiwayat(sisa);
      }
    );
  }

  function handleHapusSemuaRiwayat() {
    konfirmasiHapus(
      "Hapus Semua Riwayat",
      "Apakah Anda yakin ingin menghapus seluruh riwayat pencarian?",
      async () => {
        await hapusSemuaRiwayatPencarian();
        setDaftarRiwayat([]);
      }
    );
  }

  function handleHapusCacheKota(k: RingkasanKotaTersimpan) {
    konfirmasiHapus(
      "Hapus Cache Kota",
      `Apakah Anda yakin ingin menghapus cache data cuaca kota "${k.nama}" dari perangkat?`,
      async () => {
        await hapusCacheKota(k.kunci);
        muatData();
      }
    );
  }

  function handleHapusSemuaCache() {
    konfirmasiHapus(
      "Kosongkan Cache",
      "Apakah Anda yakin ingin menghapus seluruh data cache cuaca tersimpan?",
      async () => {
        await hapusSemuaCache();
        muatData();
      }
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tabButton, tabAktif === "favorit" && styles.tabButtonActive]}
          onPress={() => setTabAktif("favorit")}
        >
          <Text style={[styles.tabText, tabAktif === "favorit" && styles.tabTextActive]}>
            Favorit ({daftarFavorit.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tabAktif === "riwayat" && styles.tabButtonActive]}
          onPress={() => setTabAktif("riwayat")}
        >
          <Text style={[styles.tabText, tabAktif === "riwayat" && styles.tabTextActive]}>
            Riwayat ({daftarRiwayat.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tabAktif === "cache" && styles.tabButtonActive]}
          onPress={() => setTabAktif("cache")}
        >
          <Text style={[styles.tabText, tabAktif === "cache" && styles.tabTextActive]}>
            Cache ({daftarCache.length})
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
                  <Button title="Hapus" onPress={() => handleHapusFavorit(kota)} color="#EF4444" />
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
                <Button title="Hapus Semua" onPress={handleHapusSemuaRiwayat} color="#EF4444" />
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
                  <Button title="Hapus" onPress={() => handleHapusSatuRiwayat(item)} color="#EF4444" />
                </View>
              ))
            )}
          </View>
        )}

        {tabAktif === "cache" && (
          <View style={styles.sectionWrap}>
            <View style={styles.rowBetween}>
              <Text style={styles.heading}>Cache Cuaca Offline</Text>
              {daftarCache.length > 0 && (
                <Button title="Kosongkan" onPress={handleHapusSemuaCache} color="#EF4444" />
              )}
            </View>

            {daftarCache.length === 0 ? (
              <Text style={styles.teksKosong}>Belum ada data cache cuaca tersimpan.</Text>
            ) : (
              daftarCache.map((k) => (
                <View key={k.kunci} style={styles.itemCard}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() =>
                      bukaKotaDiBeranda({
                        id: k.id,
                        nama: k.nama,
                        latitude: k.latitude,
                        longitude: k.longitude,
                      })
                    }
                  >
                    <Text style={styles.itemTitle}>{k.nama}</Text>
                    <Text style={styles.itemSub}>
                      Disimpan {formatWaktu(k.disimpanPada)}
                      {k.suhu !== undefined ? ` • Suhu: ${Math.round(k.suhu)}°C` : ""}
                    </Text>
                  </TouchableOpacity>
                  <Button title="Hapus" onPress={() => handleHapusCacheKota(k)} color="#EF4444" />
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
    fontSize: 12,
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
