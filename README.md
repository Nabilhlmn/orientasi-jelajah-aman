# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

---

# LAPORAN PRAKTIKUM PEMROGRAMAN BERBASIS PLATFORM
## Penyempurnaan Fitur Jelajah Aman: Ikon Navigasi, Riwayat Pencarian, Manajemen Cache, dan Tema Gelap/Terang

Nama: [Isi Nama Anda]  
NIM: [Isi NIM Anda]  
Program Studi: Informatika — Fakultas Sains dan Teknologi  
Institusi: UIN K.H. Abdurrahman Wahid Pekalongan  

### 1. Persiapan Awal & Analisis Arsitektur
Menganalisis struktur proyek Expo Router dan modul yang ada (navigasi tabs, service geocoding, cuaca repository offline-first, penyimpanan favorit, dan database SQLite/Web). Melakukan instalasi pustaka `@expo/vector-icons` yang kompatibel dengan Expo SDK 57 untuk mendukung kustomisasi ikon tab bar universal.
[TEMPEL SCREENSHOT DI SINI]
Komentar: Taruh screenshot terminal saat proses instalasi `@expo/vector-icons` berhasil atau pengecekan `package.json` yang menampilkan dependensi baru.

### 2. Tahap 1: Kustomisasi Ikon Tab Bar & Perbaikan Label Navigasi
Mengganti ikon segitiga bawaan default pada Expo Router Tabs (`src/app/(tabs)/_layout.tsx`) dengan pustaka `@expo/vector-icons` (`Ionicons`). Setiap tab diberikan ikon representatif unik: Beranda (`home`/`home-outline`), Riwayat & Favorit (`bookmark`/`bookmark-outline`), Pengaturan (`settings`/`settings-outline`), dan Tentang (`information-circle`/`information-circle-outline`). Memperbaiki label tab kedua dari yang semula hanya "Riwayat" menjadi "Riwayat & Favorit" agar fungsi peninjauan data favorit dan riwayat lebih intuitif, serta mengintegrasikan gaya tab bar dengan tema dinamis aplikasi.
[TEMPEL SCREENSHOT DI SINI]
Komentar: Taruh screenshot kode `src/app/(tabs)/_layout.tsx` di VS Code dan screenshot tampilan tab navigasi bawah pada emulator/browser yang memperlihatkan 4 ikon representatif beserta label "Riwayat & Favorit".

### 3. Tahap 2: Fitur Riwayat Pencarian Terakhir (Recent Search History)
Membangun modul penyimpanan lokal `src/services/searchHistoryStorage.ts` menggunakan AsyncStorage (`@jelajah_aman:riwayat_pencarian`). Menetapkan batas maksimal 10 pencarian terakhir dengan mekanisme deduplikasi (mengangkat kota ke urutan teratas jika dicari ulang). Mengintegrasikan fungsi pencatatan otomatis saat kota dipilih di `src/app/(tabs)/index.tsx`, menyajikan daftar riwayat dengan waktu relatif di `src/app/(tabs)/riwayat.tsx`, serta menerapkan fungsionalitas klik pada item riwayat yang secara otomatis mengarahkan ke Beranda dan mengeksekusi pencarian cuaca kota tersebut.
[TEMPEL SCREENSHOT DI SINI]
Komentar: Taruh screenshot potongan kode `src/services/searchHistoryStorage.ts` di VS Code dan screenshot tab Riwayat yang menampilkan daftar riwayat pencarian terakhir lengkap dengan informasi waktu relatif serta aksi klik otomatis ke Beranda.

### 4. Tahap 3: Penghapusan Cache Kota & Dialog Konfirmasi Lintas Platform (Mobile & Web)
Memastikan mekanisme cache offline menyimpan dan menampilkan data suhu kota secara akurat dari `cuaca_json`. Menambahkan fungsi `hapusCacheKota(kunci)` pada `src/services/cacheRepository.ts` dan menyelaraskan penanganan query `DELETE FROM CACHE_CUACA WHERE KUNCI = ?` pada adapter `src/db/database.web.ts`. Membuat modul dialog konfirmasi universal `src/utils/dialog.ts` (`Alert.alert` di Mobile dan `window.confirm` di Browser Web tanpa error konsol). Menyematkan tombol hapus cache pada item kota tersimpan di halaman Beranda (`src/app/(tabs)/index.tsx`) dan tab Riwayat (`src/app/(tabs)/riwayat.tsx`) yang mewajibkan konfirmasi pengguna sebelum data dihapus dari perangkat.
[TEMPEL SCREENSHOT DI SINI]
Komentar: Taruh screenshot potongan kode `src/utils/dialog.ts` dan screenshot dialog konfirmasi penghapusan cache saat tombol sampah diklik pada emulator (Alert native) dan browser web (dialog konfirmasi).

### 5. Tahap 4: Implementasi Tema Gelap / Terang (Dark/Light Mode) Dinamis
Memperluas token warna pada `src/constants/theme.ts` dan membangun state management tema `src/context/ThemeContext.tsx` yang mendukung tiga opsi: Terang, Gelap, dan Ikuti Sistem, dengan persistensi lokal di AsyncStorage (`@jelajah_aman:theme_mode`). Menambahkan menu pemilihan tema berbasis radio card di `src/app/(tabs)/pengaturan.tsx` serta menghubungkan hook `useTheme()` secara reaktif ke seluruh komponen dan layar aplikasi (`Beranda`, `Riwayat & Favorit`, `Pengaturan`, `Tentang`, `WeatherCard`, `SearchBox`, `StatusData`, dan modal).
[TEMPEL SCREENSHOT DI SINI]
Komentar: Taruh screenshot menu Pengaturan yang menampilkan pilihan mode tampilan (Terang, Gelap, Ikuti Sistem) dan screenshot perbandingan layar aplikasi dalam mode Terang vs mode Gelap.

### 6. Tahap 5: Pengujian Lintas Platform (Expo Go Mobile & Browser Web)
Melakukan pengujian menyeluruh pada platform Android/iOS (Expo Go) dan Browser Web: (1) Verifikasi navigasi dan ikon tab bar, (2) Uji pencarian kota dan otomatisasi klik riwayat, (3) Uji offline-first cache beserta penghapusan cache dengan konfirmasi, (4) Uji peralihan tema Terang/Gelap secara instan di semua halaman, dan (5) Pemeriksaan konsol web browser untuk memastikan nol error (`0 errors, 0 warnings`).
[TEMPEL SCREENSHOT DI SINI]
Komentar: Taruh screenshot aplikasi yang sedang berjalan di Browser Web (localhost:8081) dan/atau Expo Go Mobile beserta tampilan konsol browser yang bersih dari pesan error.

### 7. Tahap 6: Verifikasi Kualitas Kode (TypeScript & Linting)
Menjalankan audit kualitas kode secara statis menggunakan perintah `npx tsc --noEmit` untuk validasi tipe TypeScript dan `npm run lint` (`expo lint`) untuk memastikan kepatuhan terhadap React 19 compiler rules (menghilangkan set-state-in-effect, impure functions, dan unescaped entities).
[TEMPEL SCREENSHOT DI SINI]
Komentar: Taruh screenshot terminal saat menjalankan perintah `npx tsc --noEmit` dan `npm run lint` yang berhasil lulus tanpa error (exit code 0).

### 8. Riwayat Commit & Bukti Pengumpulan
Mendokumentasikan commit git bertahap yang mencerminkan setiap tahap implementasi fitur penyempurnaan dan sinkronisasi ke repositori GitHub.
[TEMPEL SCREENSHOT DI SINI]
Komentar: Taruh screenshot terminal yang menjalankan perintah `git log --oneline -n 10` atau riwayat commit pada halaman repositori GitHub.

### Kesimpulan Singkat:
Implementasi 4 fitur penyempurnaan pada aplikasi "Jelajah Aman" berhasil diselesaikan secara menyeluruh. Kustomisasi tab bar menggunakan `@expo/vector-icons` dan perbaikan label "Riwayat & Favorit" meningkatkan kejelasan navigasi. Penyimpanan riwayat pencarian (maksimal 10 item) dengan navigasi otomatis mempermudah pencarian ulang kota oleh pengguna. Mekanisme penghapusan cache yang dilengkapi dialog konfirmasi universal menjamin keamanan data offline dan kompatibilitas lintas platform (Expo Go dan Web). Terakhir, sistem tema dinamis (Terang, Gelap, Ikuti Sistem) berbasis ThemeContext memberikan kenyamanan visual yang konsisten di seluruh layar aplikasi. Seluruh kode telah diverifikasi bebas dari error TypeScript maupun linting.

