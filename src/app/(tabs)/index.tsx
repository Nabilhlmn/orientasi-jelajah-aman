// src/app/(tabs)/index.tsx 
import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";
import { useDebounce } from "../../hooks/use-debounce";
import { useThemeContext } from "../../context/ThemeContext";
import { cariKota } from "../../services/geocodingService";
import { ambilCuacaOfflineFirst, BATAS_CACHE_MS } from "../../services/cuacaRepository";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
  hapusCacheKota,
} from "../../services/cacheRepository";
import { tambahRiwayatPencarian } from "../../services/searchHistoryStorage";
import {
  cekApakahFavorit,
  tambahFavorit,
  hapusFavorit,
} from "../../services/favoritStorage";
import { mintaIzinLokasi, ambilKoordinatSaatIni } from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../types/geocoding";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { konfirmasiHapus } from "../../utils/dialog";

export default function HalamanUtama() {
  const { theme, isDark } = useThemeContext();
  const params = useLocalSearchParams<{
    cariNama?: string;
    cariLat?: string;
    cariLon?: string;
    cariId?: string;
    t?: string;
  }>();

  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>([]);
  const [sudahFavorit, setSudahFavorit] = useState(false);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition 

  const muatKotaTersimpan = useCallback(async () => {
    try {
      const data = await daftarKotaTersimpan();
      setKotaTersimpan(data);
    } catch {
      setKotaTersimpan([]);
    }
  }, []);

  const pilihKota = useCallback(
    async (kota: HasilGeocoding, paksaPerbarui = false) => {
      setKotaTerpilih(kota);
      const idSaatIni = ++requestIdRef.current;
      setSedangMemuat(true);
      setPesanError(null);

      // Cek apakah kota sudah masuk daftar favorit
      if (kota.name && kota.name !== "Lokasi Saat Ini") {
        cekApakahFavorit({ id: kota.id, nama: kota.name }).then(setSudahFavorit);
      } else {
        setSudahFavorit(false);
      }

      // Simpan ke riwayat pencarian terakhir (maks 10)
      if (kota.name && kota.name !== "Lokasi Saat Ini") {
        tambahRiwayatPencarian({
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
          country: kota.country,
          admin1: kota.admin1,
        }).catch(() => {});
      }

      try {
        const data = await ambilCuacaOfflineFirst(
          { id: kota.id, nama: kota.name, latitude: kota.latitude, longitude: kota.longitude },
          { paksaPerbarui }
        );
        if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan 
        setHasil(data);
        muatKotaTersimpan();
      } catch {
        if (idSaatIni !== requestIdRef.current) return;
        setHasil(null);
        setPesanError(
          "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
        );
      } finally {
        if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
      }
    },
    [muatKotaTersimpan]
  );

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan 
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, [muatKotaTersimpan]);

  // Tangani navigasi otomatis dari tab Riwayat ketika item riwayat / favorit diklik
  useEffect(() => {
    if (params.cariNama && params.cariLat && params.cariLon) {
      const nama = params.cariNama;
      const lat = Number(params.cariLat);
      const lon = Number(params.cariLon);
      const id = Number(params.cariId) || 0;

      const timer = setTimeout(() => {
        setTeksCari(nama);
        pilihKota({
          id,
          name: nama,
          latitude: lat,
          longitude: lon,
          country: "",
        });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [params.t, params.cariNama, params.cariLat, params.cariLon, params.cariId, pilihKota]);

  useEffect(() => {
    let aktif = true;
    if (teksTertunda.trim().length === 0) {
      return;
    }
    cariKota(teksTertunda)
      .then((data) => {
        if (aktif) setHasilPencarian(data);
      })
      .catch(() => {
        if (aktif) setHasilPencarian([]);
      });

    return () => {
      aktif = false;
    };
  }, [teksTertunda]);

  const hasilPencarianTampil =
    teksTertunda.trim().length === 0 ? [] : hasilPencarian;

  useFocusEffect(
    useCallback(() => {
      if (kotaTerpilih && kotaTerpilih.name !== "Lokasi Saat Ini") {
        cekApakahFavorit({ id: kotaTerpilih.id, nama: kotaTerpilih.name }).then(setSudahFavorit);
      }
    }, [kotaTerpilih])
  );

  async function handleToggleFavorit() {
    if (!kotaTerpilih) return;
    if (sudahFavorit) {
      konfirmasiHapus(
        "Hapus Favorit",
        `Apakah Anda yakin ingin menghapus "${kotaTerpilih.name}" dari daftar favorit?`,
        async () => {
          await hapusFavorit(kotaTerpilih.id, kotaTerpilih.name);
          setSudahFavorit(false);
        }
      );
    } else {
      await tambahFavorit({
        id: kotaTerpilih.id || Date.now(),
        nama: kotaTerpilih.name,
        latitude: kotaTerpilih.latitude,
        longitude: kotaTerpilih.longitude,
      });
      setSudahFavorit(true);
    }
  }

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();

    if (status === "denied") {
      setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.");
      return;
    }

    setPesanLokasi(null);
    try {
      const koordinat = await ambilKoordinatSaatIni();
      pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch {
      setPesanLokasi("Gagal mengambil koordinat saat ini.");
    }
  }

  function handleHapusCacheKota(kota: RingkasanKotaTersimpan) {
    konfirmasiHapus(
      "Hapus Cache Kota",
      `Apakah Anda yakin ingin menghapus data cuaca tersimpan untuk kota "${kota.nama}"?`,
      async () => {
        await hapusCacheKota(kota.kunci);
        await muatKotaTersimpan();
      }
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Kolom Pencarian */}
        <SearchBox onCari={setTeksCari} nilai={teksCari} />

        {/* Tombol Lokasi Saat Ini */}
        <TouchableOpacity
          style={[
            styles.tombolLokasi,
            {
              backgroundColor: theme.primaryLight,
              borderColor: theme.primary,
            },
          ]}
          onPress={gunakanLokasiSaatIni}
          activeOpacity={0.7}
        >
          <Ionicons name="location" size={18} color={theme.primary} />
          <Text style={[styles.teksTombolLokasi, { color: theme.primary }]}>
            Gunakan Lokasi Saat Ini
          </Text>
        </TouchableOpacity>

        {pesanLokasi && (
          <View
            style={[
              styles.pesanBox,
              { backgroundColor: theme.warningLight, borderColor: theme.warning },
            ]}
          >
            <Text style={{ color: isDark ? "#FCD34D" : "#B45309", fontSize: 13 }}>
              {pesanLokasi}
            </Text>
          </View>
        )}

        {/* Hasil Pencarian Geocoding Langsung */}
        {hasilPencarianTampil.length > 0 && (
          <View
            style={[
              styles.hasilCariCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginBottom: 8 }]}>
              Hasil Pencarian:
            </Text>
            {hasilPencarianTampil.map((kota, idx) => (
              <TouchableOpacity
                key={`${kota.id}-${idx}`}
                style={[
                  styles.itemPencarian,
                  { borderBottomColor: theme.border },
                  idx === hasilPencarian.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => {
                  setHasilPencarian([]);
                  setTeksCari(kota.name);
                  pilihKota(kota);
                }}
              >
                <Ionicons name="location-outline" size={18} color={theme.primary} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.namaKotaCari, { color: theme.text }]}>
                    {kota.name}
                  </Text>
                  {(kota.admin1 || kota.country) && (
                    <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                      {[kota.admin1, kota.country].filter(Boolean).join(", ")}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Daftar Tersimpan di Perangkat (Bisa Dibuka Offline) */}
        {kotaTersimpan.length > 0 && (
          <View
            style={[
              styles.cacheSection,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="cloud-offline-outline" size={18} color={theme.primary} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Tersimpan di Perangkat (Offline)
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                {kotaTersimpan.length} kota
              </Text>
            </View>

            {kotaTersimpan.map((k) => (
              <View
                key={k.kunci}
                style={[
                  styles.itemCacheRow,
                  { borderTopColor: theme.border },
                ]}
              >
                <TouchableOpacity
                  style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}
                  onPress={() =>
                    pilihKota({
                      id: k.id,
                      name: k.nama,
                      latitude: k.latitude,
                      longitude: k.longitude,
                      country: "",
                    })
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemCacheNama, { color: theme.text }]}>
                      {k.nama}
                    </Text>
                    <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                      Klik untuk melihat cuaca tersimpan
                    </Text>
                  </View>
                  {k.suhu !== undefined && (
                    <Text style={[styles.itemCacheSuhu, { color: theme.primary }]}>
                      {Math.round(k.suhu)}°C
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Tombol Hapus Cache dengan dialog konfirmasi */}
                <TouchableOpacity
                  style={[
                    styles.tombolHapusCache,
                    { backgroundColor: theme.dangerLight },
                  ]}
                  onPress={() => handleHapusCacheKota(k)}
                  accessibilityLabel={`Hapus cache ${k.nama}`}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Loading Indicator */}
        {sedangMemuat && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ color: theme.textSecondary, marginTop: 8, fontSize: 13 }}>
              Memuat data cuaca...
            </Text>
          </View>
        )}

        {/* Pesan Error */}
        {pesanError && (
          <View
            style={[
              styles.errorCard,
              { backgroundColor: theme.dangerLight, borderColor: theme.danger },
            ]}
          >
            <Ionicons name="alert-circle" size={24} color={theme.danger} />
            <Text
              accessibilityLabel={pesanError}
              style={{ color: theme.danger, textAlign: "center", fontSize: 14 }}
            >
              {pesanError}
            </Text>
            <TouchableOpacity
              style={[styles.tombolAksi, { backgroundColor: theme.danger }]}
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            >
              <Text style={{ color: "#FFF", fontWeight: "600" }}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tampilan Detail Cuaca Kota Terpilih */}
        {hasil && kotaTerpilih && !sedangMemuat && (
          <View style={{ gap: 12 }}>
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
            />
            <View
              style={[
                styles.kondisiCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                Kondisi:{" "}
                <Text style={{ color: theme.text, fontWeight: "600" }}>
                  {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
                </Text>{" "}
                {"\u2022"} Kecepatan Angin:{" "}
                <Text style={{ color: theme.text, fontWeight: "600" }}>
                  {hasil.cuaca.saatIni.kecepatanAngin} km/j
                </Text>
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={[
                  styles.tombolAksi,
                  { flex: 1, backgroundColor: theme.primary },
                ]}
                onPress={() => pilihKota(kotaTerpilih, true)}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.teksTombolAksi}>Perbarui Sekarang</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tombolAksi,
                  {
                    flex: 1,
                    backgroundColor: sudahFavorit ? theme.dangerLight : theme.surface,
                    borderWidth: 1,
                    borderColor: sudahFavorit ? theme.danger : theme.primary,
                  },
                ]}
                onPress={handleToggleFavorit}
                activeOpacity={0.8}
                accessibilityLabel={sudahFavorit ? "Hapus dari Favorit" : "Tambah ke Favorit"}
              >
                <Ionicons
                  name={sudahFavorit ? "heart-dislike" : "heart"}
                  size={16}
                  color={sudahFavorit ? theme.danger : theme.primary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.teksTombolAksi,
                    { color: sudahFavorit ? theme.danger : theme.primary },
                  ]}
                >
                  {sudahFavorit ? "Hapus Favorit" : "Tambah Favorit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    gap: 16,
  },
  tombolLokasi: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  teksTombolLokasi: {
    fontSize: 14,
    fontWeight: "600",
  },
  pesanBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  hasilCariCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  itemPencarian: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  namaKotaCari: {
    fontSize: 15,
    fontWeight: "600",
  },
  cacheSection: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCacheRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  itemCacheNama: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemCacheSuhu: {
    fontSize: 18,
    fontWeight: "700",
  },
  tombolHapusCache: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  errorCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
  },
  kondisiCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  tombolAksi: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  teksTombolAksi: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});