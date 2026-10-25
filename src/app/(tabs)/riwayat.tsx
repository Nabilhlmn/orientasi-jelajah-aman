// src/app/(tabs)/riwayat.tsx 
import { useFocusEffect, router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useThemeContext } from "../../context/ThemeContext";
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

type TabPilihan = "favorit" | "riwayat" | "cache";

function formatWaktu(waktuMs: number): string {
  const selisihDetik = Math.floor((Date.now() - waktuMs) / 1000);
  if (selisihDetik < 60) return "Baru saja";
  const menit = Math.floor(selisihDetik / 60);
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  return `${hari} hari lalu`;
}

export default function TabRiwayat() {
  const { theme, isDark } = useThemeContext();
  const [tabAktif, setTabAktif] = useState<TabPilihan>("favorit");
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarRiwayat, setDaftarRiwayat] = useState<RiwayatPencarianKota[]>([]);
  const [daftarCache, setDaftarCache] = useState<RingkasanKotaTersimpan[]>([]);

  const muatSemuaData = useCallback(async () => {
    const [favorit, riwayat, cache] = await Promise.all([
      ambilSemuaFavorit().catch(() => []),
      ambilRiwayatPencarian().catch(() => []),
      daftarKotaTersimpan().catch(() => []),
    ]);
    setDaftarFavorit(favorit);
    setDaftarRiwayat(riwayat);
    setDaftarCache(cache);
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatSemuaData();
    }, [muatSemuaData])
  );

  const navigasiCounterRef = useRef(0);

  // Aksi ketika item kota diklik: navigasikan ke Beranda dan picu pencarian otomatis
  const bukaKotaDiBeranda = useCallback(
    (kota: {
      id: number;
      nama: string;
      latitude: number;
      longitude: number;
    }) => {
      navigasiCounterRef.current += 1;
      router.push({
        pathname: "/",
        params: {
          cariNama: kota.nama,
          cariLat: String(kota.latitude),
          cariLon: String(kota.longitude),
          cariId: String(kota.id),
          t: String(navigasiCounterRef.current),
        },
      });
    },
    []
  );

  // Hapus Favorit
  function handleHapusFavorit(kota: KotaFavorit) {
    konfirmasiHapus(
      "Hapus Favorit",
      `Apakah Anda yakin ingin menghapus "${kota.nama}" dari daftar favorit?`,
      async () => {
        const daftarBaru = await hapusFavorit(kota.id, kota.nama);
        setDaftarFavorit(daftarBaru);
      }
    );
  }

  // Hapus Satu Riwayat Pencarian
  function handleHapusSatuRiwayat(item: RiwayatPencarianKota) {
    konfirmasiHapus(
      "Hapus Riwayat",
      `Hapus pencarian "${item.nama}" dari riwayat?`,
      async () => {
        const baru = await hapusSatuRiwayatPencarian(item.id, item.nama);
        setDaftarRiwayat(baru);
      }
    );
  }

  // Bersihkan Seluruh Riwayat Pencarian
  function handleBersihkanSemuaRiwayat() {
    konfirmasiHapus(
      "Bersihkan Seluruh Riwayat",
      "Apakah Anda yakin ingin menghapus semua riwayat pencarian terakhir?",
      async () => {
        await hapusSemuaRiwayatPencarian();
        setDaftarRiwayat([]);
      }
    );
  }

  // Hapus Satu Cache Kota
  function handleHapusCacheKota(kota: RingkasanKotaTersimpan) {
    konfirmasiHapus(
      "Hapus Cache Kota",
      `Hapus data cache cuaca untuk "${kota.nama}"?`,
      async () => {
        await hapusCacheKota(kota.kunci);
        setDaftarCache((prev) => prev.filter((k) => k.kunci !== kota.kunci));
      }
    );
  }

  // Bersihkan Seluruh Cache
  function handleHapusSemuaCache() {
    konfirmasiHapus(
      "Hapus Seluruh Cache",
      "Apakah Anda yakin ingin mengosongkan semua data cuaca offline?",
      async () => {
        await hapusSemuaCache();
        setDaftarCache([]);
      }
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={["bottom"]}
    >
      {/* Tab Segment Switcher */}
      <View
        style={[
          styles.segmentContainer,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.segmentButton,
            tabAktif === "favorit" && [
              styles.segmentActive,
              { backgroundColor: theme.card },
            ],
          ]}
          onPress={() => setTabAktif("favorit")}
          activeOpacity={0.8}
        >
          <Ionicons
            name={tabAktif === "favorit" ? "heart" : "heart-outline"}
            size={16}
            color={tabAktif === "favorit" ? theme.primary : theme.textSecondary}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: tabAktif === "favorit" ? theme.text : theme.textSecondary,
                fontWeight: tabAktif === "favorit" ? "700" : "500",
              },
            ]}
          >
            Favorit ({daftarFavorit.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            tabAktif === "riwayat" && [
              styles.segmentActive,
              { backgroundColor: theme.card },
            ],
          ]}
          onPress={() => setTabAktif("riwayat")}
          activeOpacity={0.8}
        >
          <Ionicons
            name={tabAktif === "riwayat" ? "time" : "time-outline"}
            size={16}
            color={tabAktif === "riwayat" ? theme.primary : theme.textSecondary}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: tabAktif === "riwayat" ? theme.text : theme.textSecondary,
                fontWeight: tabAktif === "riwayat" ? "700" : "500",
              },
            ]}
          >
            Riwayat ({daftarRiwayat.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            tabAktif === "cache" && [
              styles.segmentActive,
              { backgroundColor: theme.card },
            ],
          ]}
          onPress={() => setTabAktif("cache")}
          activeOpacity={0.8}
        >
          <Ionicons
            name={tabAktif === "cache" ? "cloud-offline" : "cloud-offline-outline"}
            size={16}
            color={tabAktif === "cache" ? theme.primary : theme.textSecondary}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: tabAktif === "cache" ? theme.text : theme.textSecondary,
                fontWeight: tabAktif === "cache" ? "700" : "500",
              },
            ]}
          >
            Cache ({daftarCache.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* KONTEN TAB FAVORIT */}
        {tabAktif === "favorit" && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.heading, { color: theme.text }]}>Kota Favorit</Text>
              <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                {daftarFavorit.length} tersimpan
              </Text>
            </View>

            {daftarFavorit.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="heart-dislike-outline" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Belum ada kota favorit</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Cari kota di Beranda dan tekan &quot;Tambahkan ke Favorit&quot; untuk menyimpannya di sini.
                </Text>
              </View>
            ) : (
              daftarFavorit.map((kota, idx) => (
                <View
                  key={`${kota.id || kota.nama}-${idx}`}
                  style={[
                    styles.itemCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                    onPress={() => bukaKotaDiBeranda(kota)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.itemIconWrap,
                        { backgroundColor: isDark ? "#450A0A" : "#FEE2E2" },
                      ]}
                    >
                      <Ionicons name="heart" size={20} color={theme.danger} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{kota.nama}</Text>
                      <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                        Klik untuk melihat ramalan cuaca
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tombolHapus, { backgroundColor: theme.dangerLight }]}
                    onPress={() => handleHapusFavorit(kota)}
                    accessibilityLabel={`Hapus favorit ${kota.nama}`}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* KONTEN TAB RIWAYAT PENCARIAN TERAKHIR */}
        {tabAktif === "riwayat" && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.heading, { color: theme.text }]}>
                  Riwayat Pencarian Terakhir
                </Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                  Maksimal 10 pencarian terakhir
                </Text>
              </View>

              {daftarRiwayat.length > 0 && (
                <TouchableOpacity
                  onPress={handleBersihkanSemuaRiwayat}
                  style={[styles.tombolHapusSemua, { backgroundColor: theme.dangerLight }]}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: theme.danger }}>
                    Hapus Semua
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {daftarRiwayat.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="search-outline" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Belum ada riwayat pencarian</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Pencarian kota yang Anda lakukan di Beranda akan otomatis dicatat di sini.
                </Text>
              </View>
            ) : (
              daftarRiwayat.map((item) => (
                <View
                  key={`${item.id}-${item.waktu}`}
                  style={[
                    styles.itemCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                    onPress={() => bukaKotaDiBeranda(item)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.itemIconWrap,
                        { backgroundColor: theme.primaryLight },
                      ]}
                    >
                      <Ionicons name="time-outline" size={20} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{item.nama}</Text>
                      <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                        {[item.country, formatWaktu(item.waktu)].filter(Boolean).join(" • ")}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tombolHapus, { backgroundColor: theme.dangerLight }]}
                    onPress={() => handleHapusSatuRiwayat(item)}
                    accessibilityLabel={`Hapus riwayat ${item.nama}`}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* KONTEN TAB DATA CACHE OFFLINE */}
        {tabAktif === "cache" && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.heading, { color: theme.text }]}>
                  Cache Cuaca Offline
                </Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                  Data tersimpan lokal yang bisa dibuka tanpa internet
                </Text>
              </View>

              {daftarCache.length > 0 && (
                <TouchableOpacity
                  onPress={handleHapusSemuaCache}
                  style={[styles.tombolHapusSemua, { backgroundColor: theme.dangerLight }]}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: theme.danger }}>
                    Kosongkan
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {daftarCache.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="cloud-offline-outline" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Belum ada data cache</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Setiap cuaca kota yang Anda lihat saat online akan otomatis disimpan di cache.
                </Text>
              </View>
            ) : (
              daftarCache.map((k) => (
                <View
                  key={k.kunci}
                  style={[
                    styles.itemCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                    onPress={() =>
                      bukaKotaDiBeranda({
                        id: k.id,
                        nama: k.nama,
                        latitude: k.latitude,
                        longitude: k.longitude,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.itemIconWrap,
                        { backgroundColor: isDark ? "#064E3B" : "#ECFDF5" },
                      ]}
                    >
                      <Ionicons name="cloud-done-outline" size={20} color={theme.success} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{k.nama}</Text>
                      <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                        Disimpan {formatWaktu(k.disimpanPada)}
                      </Text>
                    </View>
                    {k.suhu !== undefined && (
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: theme.primary,
                          marginRight: 12,
                        }}
                      >
                        {Math.round(k.suhu)}°C
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tombolHapus, { backgroundColor: theme.dangerLight }]}
                    onPress={() => handleHapusCacheKota(k)}
                    accessibilityLabel={`Hapus cache ${k.nama}`}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </TouchableOpacity>
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
  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  segmentActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  sectionWrap: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
  },
  tombolHapusSemua: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  itemIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  tombolHapus: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
