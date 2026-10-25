// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";

import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { ambilCuacaOfflineFirst, BATAS_CACHE_MS } from "../../services/cuacaRepository";
import { bersihkanCacheLama, daftarKotaTersimpan } from "../../services/cacheRepository";
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

export default function HalamanUtama() {
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
  const requestIdRef = useRef(0);

  const muatKotaTersimpan = useCallback(async () => {
    try {
      const data = await daftarKotaTersimpan();
      setKotaTersimpan(data);
    } catch {
      setKotaTersimpan([]);
    }
  }, []);

  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, [muatKotaTersimpan]);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda).then(setHasilPencarian).catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

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

      // Simpan ke riwayat pencarian terakhir (maks 10, deduplikasi)
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
          {
            id: kota.id,
            nama: kota.name,
            latitude: kota.latitude,
            longitude: kota.longitude,
          },
          { paksaPerbarui }
        );
        if (idSaatIni !== requestIdRef.current) return;
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

  // Otomatisasi: buka kota yang diklik dari riwayat pencarian
  useEffect(() => {
    if (params.cariNama && params.cariLat && params.cariLon) {
      const lat = parseFloat(params.cariLat);
      const lon = parseFloat(params.cariLon);
      const id = params.cariId ? parseInt(params.cariId, 10) : 0;

      if (!isNaN(lat) && !isNaN(lon)) {
        pilihKota({
          id: isNaN(id) ? 0 : id,
          name: params.cariNama,
          latitude: lat,
          longitude: lon,
          country: "",
        });
      }
    }
  }, [params.cariNama, params.cariLat, params.cariLon, params.cariId, params.t, pilihKota]);

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
    const koordinat = await ambilKoordinatSaatIni();
    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    });
  }

  async function toggleFavorit() {
    if (!kotaTerpilih) return;
    if (sudahFavorit) {
      await hapusFavorit(kotaTerpilih.id, kotaTerpilih.name);
      setSudahFavorit(false);
    } else {
      await tambahFavorit({
        id: kotaTerpilih.id,
        nama: kotaTerpilih.name,
        latitude: kotaTerpilih.latitude,
        longitude: kotaTerpilih.longitude,
      });
      setSudahFavorit(true);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={setTeksCari} />

        <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
        {pesanLokasi && <Text accessibilityLabel={pesanLokasi}>{pesanLokasi}</Text>}

        {hasilPencarian.map((kota) => (
          <TouchableOpacity
            key={kota.id}
            onPress={() => pilihKota(kota)}
            style={styles.itemPencarian}
          >
            <Text style={styles.namaPencarian}>{kota.name}</Text>
            {kota.country ? (
              <Text style={styles.negaraPencarian}>
                {[kota.admin1, kota.country].filter(Boolean).join(", ")}
              </Text>
            ) : null}
          </TouchableOpacity>
        ))}

        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "bold" }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>
            {kotaTersimpan.map((k) => (
              <TouchableOpacity
                key={k.kunci}
                onPress={() =>
                  pilihKota({
                    id: k.id,
                    name: k.nama,
                    latitude: k.latitude,
                    longitude: k.longitude,
                    country: "",
                  })
                }
                style={styles.itemTersimpan}
              >
                <Text>{k.nama}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {sedangMemuat && <ActivityIndicator size="large" />}

        {pesanError && (
          <View style={styles.errorBox}>
            <Text accessibilityLabel={pesanError} style={styles.errorTeks}>
              {pesanError}
            </Text>
            <Button
              title="Coba Lagi"
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
            />
            <Text style={{ fontSize: 12, color: "#888888" }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)} {"\u2022"} Angin{" "}
              {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>
            <Button
              title="Perbarui Sekarang"
              onPress={() => pilihKota(kotaTerpilih, true)}
            />
            <Button
              title={sudahFavorit ? "Hapus dari Favorit" : "Tambahkan ke Favorit"}
              onPress={toggleFavorit}
            />
          </>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  itemPencarian: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  namaPencarian: {
    fontSize: 16,
    fontWeight: "600",
  },
  negaraPencarian: {
    fontSize: 12,
    color: "#64748B",
  },
  itemTersimpan: {
    padding: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  errorBox: {
    padding: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    gap: 8,
  },
  errorTeks: {
    color: "#DC2626",
  },
});