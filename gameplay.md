# XENUS SETTLEMENT: Panduan Mekanisme Gameplay

XENUS_SETTLEMENT adalah simulasi *city-builder* miniatur yang bersifat 100% deterministik. Artinya, dengan input (seed) dan interaksi yang sama, *game state* yang dihasilkan akan selalu identik. Game ini berjalan secara otonom dalam siklus *Tick* (5 Frame per detik), di mana mesin Rust (WebAssembly) memproses logika dunia.

Berikut adalah alur permainan dari awal hingga akhir (Endgame).

## 1. Fase Persiapan (Awal Permainan)
Saat permainan dimulai (Tick 0), pemain diberikan:
- **Grid:** Peta berukuran 12x12.
- **Bangunan Awal:** Sebuah `NODE_CORE` otomatis ditempatkan di koordinat (5,5) sebagai pusat peradaban.
- **Sumber Daya Awal (Resources):**
  - **ENERGY:** 100 (Batas: 500)
  - **NODES:** 50 (Batas: 300)
  - **TOKENS:** 10 (Batas: 100)

## 2. Ekonomi & Sumber Daya
Pemain harus menempatkan berbagai jenis bangunan untuk menghasilkan dan mengelola sumber daya. Setiap bangunan memiliki efek produksi (delta) yang diaplikasikan setiap *tick*:

| Bangunan | Ikon | Efek per Tick | Strategi Penggunaan |
|---|---|---|---|
| **NODE_CORE** | ⬡ | +5 NODES | Sumber utama material mentah. |
| **ENERGY_CELL** | ▣ | +10 ENERGY | Wajib dibangun untuk menyuplai energi bangunan lain. |
| **RELAY_TOWER** | ◈ | +1 NODES | Meningkatkan efisiensi jaringan node. |
| **VAULT** | ⬖ | -1 ENERGY | Mencegah *overflow* (Blokir 50 EVENT Drain). |
| **MINER** | ⬠ | -2 ENG, -1 NODE, +2 TOKENS | Penghasil mata uang/Token (Syarat: HOUSING). |
| **HOUSING** | ◉ | -1 ENERGY, -1 NODE | Mempercepat *Building Progress* (Syarat: RELAY). |
| **SHIELD_NODE** | ⬡ | -2 ENG, +1 NODE | Memblokir 250 EVENT Drain (Syarat: MINER). |
| **PROTOCOL_HUB** | ◬ | -5 ENG, +5 NODE, +5 TOKENS | Output masif (Syarat: SHIELD). |

## 3. Siklus Simulasi (The 5 Phases)
Ketika pemain menekan tombol **START**, siklus permainan berjalan dan mengeksekusi 5 fase secara berurutan dalam sepersekian milidetik:

1. **RESOURCE:** Mesin membaca seluruh bangunan aktif di atas grid.
2. **PRODUCTION:** Mengalkulasikan surplus (pendapatan) dan *drain* (pengeluaran). Nilai tersebut langsung ditambahkan ke jumlah Resources saat ini (tidak bisa melebihi batas maksimal / *cap*).
3. **POPULATION:** Mengecek apakah kota makmur dan layak tumbuh. Jika kota memiliki surplus daya (>50 ENERGY & >30 NODES), maka populasi akan bertumbuh (+1 per tick) sampai memenuhi kapasitas maksimal dari `HOUSING`.
4. **EVENT:** Menghasilkan kejadian acak yang *pseudo-random* namun deterministik berdasarkan perhitungan `Seed + Tick`:
   - **STORM DRAIN:** Dimulai setelah **Tick 100**. Badai anomali mulai menguras cadangan energi setiap tick (lihat indicator `Expected Drain`).
   - *Bonus Event:* Penduduk menemukan sumber daya (+5 TOKENS jika Populasi > 10).
   - *Drain Event:* Kejadian mendadak menguras cadangan (-20 ENERGY).
   - *Neutral Event:* Kondisi stabil.
5. **SNAPSHOT:** Menyimpan wujud final state menjadi JSON, memeriksa apakah pemain sudah mencapai *Win Condition*, lalu siap dikirimkan untuk dirender ke *frontend* React.

## 4. Alur Strategi (Gameplay Loop)
Pemain harus membangun kota secara paralel, memastikan pasokan tidak tekor:
- **Langkah 1:** Perbanyak `ENERGY_CELL` untuk memastikan defisit energi tidak mencapai titik kritis (0).
- **Langkah 2:** Ekspansi dengan `NODE_CORE` tambahan agar suplai perakitan (Nodes) selalu melimpah untuk menutupi *drain* dari event kosmik yang dipicu oleh fase EVENT.
- **Langkah 3:** Dirikan `MINER` untuk mulai memanen `TOKENS`, sambil terus menyeimbangkan konsumsi energi yang besar akibat Miner.
- **Langkah 4:** Bangun `HOUSING` untuk mengundang populasi agar peradaban terus hidup, lalu bangun arsitektur mutakhir seperti `PROTOCOL_HUB`.

## 5. Endgame (The Protocol Unlock)
Tujuan mutlak dari *XENUS SETTLEMENT* adalah membuka kunci sistem inti, yaitu **XENØR PROTOCOL**.
- **Syarat Menang:** Sistem WebAssembly mendeteksi penyimpanan mencapai minimal **2500 NODES**, **1500 TOKENS**, dan memiliki **1 PROTOCOL_HUB** aktif.
- **Catatan Kesulitan:** Badai anomali (Storm Drain) akan semakin kuat seiring bertambahnya waktu (Tick). Pastikan pertahanan energi mencukupi sebelum memasuki *late-game*.
- Saat kedua angka ini tercapai secara beriringan, flag `protocol_active` akan menyala (bernilai `TRUE`).
- *Gameplay loop* berakhir pada kemenangan pemain; fase ini memicu tombol interaktif **"EXECUTE PROTOCOL"** untuk menyala, mempersilakan User beralih ke fitur lanjutan (atau aplikasi utamanya).
