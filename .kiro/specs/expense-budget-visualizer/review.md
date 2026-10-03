# Kiro Review — Expense & Budget Visualizer

Reviewer: Kiro (sesi Kiro IDE, 3 Oktober 2026).  
Project: Ruang Uang · Mini Project RevoU Coding Camp, batch 28 September 2026.  
Author: Reza Febriadi Rauf.

---

## Catatan metode

Review ini dilakukan **melalui pembacaan statis kode** di dalam Kiro IDE. Pengujian fungsional yang tercatat di `VERIFICATION.md` (validasi form, persistence, pie chart, layout responsif, dll.) dilaksanakan secara terpisah melalui browser dan bukan bagian dari sesi review statis Kiro ini.

---

## 1. Ketentuan wajib brief — status per item

| Ketentuan | Status | Catatan |
|---|---|---|
| HTML + CSS + Vanilla JS, tanpa framework | ✅ Terpenuhi | Tidak ada import/bundler/framework |
| Client-side only, Local Storage | ✅ Terpenuhi | Tidak ada fetch/XHR ke server |
| Tepat satu CSS di `css/`, satu JS di `js/` | ✅ Terpenuhi | `css/style.css`, `js/script.js` |
| Form: Item Name, Amount positif, Category Food/Transport/Fun, validasi | ✅ Terpenuhi | Validasi bertahap dengan `aria-invalid` dan fokus |
| Daftar transaksi scrollable: nama/jumlah/kategori, bisa hapus | ✅ Terpenuhi | `max-height` + `overflow-y:auto`, hapus via delegated event |
| Total balance/pengeluaran di atas, update otomatis | ✅ Terpenuhi | `render()` dipanggil setiap tambah/hapus/budget |
| Pie chart kategori update otomatis | ✅ Terpenuhi | Native SVG, `renderChart()` dipanggil di `render()` |
| Mobile-friendly | ✅ Terpenuhi | Breakpoints 760 / 580 / 360px; single-column di bawah 580px |
| Sort by amount/category | ✅ Terpenuhi | `sort-order` select; salinan array diurut, urutan asli tidak berubah |
| Spending limit highlight | ✅ Terpenuhi | Class `over-budget`, progress bar merah, teks peringatan |
| Dark/light mode | ✅ Terpenuhi | CSS custom properties, `data-theme`, persisten di Local Storage |

---

## 2. Temuan dari analisis statis kode (Kiro)

### BUG 1 — Field budget kosong memicu error validasi (diperbaiki)

**File:** `js/script.js`, handler `$("budget-form").addEventListener("submit", …)`

**Kondisi:** User menghapus/mengosongkan nilai di field `#budget-limit` lalu menekan tombol **Simpan**. `$("budget-limit").value` menghasilkan string kosong `""`. `parseAmount("")` memanggil regex `^\d+(?:\.\d{1,2})?$` atas string kosong — regex tidak cocok — sehingga fungsi mengembalikan `null`. Handler menampilkan error *"Masukkan batas anggaran yang valid. Isi 0 untuk menonaktifkan."* dan memfokus field, tanpa menyimpan apapun.

**Dampak:** User tidak dapat menonaktifkan budget dengan mengosongkan field. Mereka harus mengetik literal `0`; opsi ini sudah dijelaskan pada teks bantuan sebelumnya. Perubahan memperluas perilaku agar field kosong juga menonaktifkan budget.

**Perbaikan yang diterapkan:**
```js
// Sebelum
const value = parseAmount($("budget-limit").value);
if (value === null) { notice("Masukkan batas anggaran yang valid. Isi 0 untuk menonaktifkan.", true); … }

// Sesudah
const raw = $("budget-limit").value.trim();
const value = raw === "" ? 0 : parseAmount(raw);
if (value === null) { notice("Masukkan batas anggaran yang valid. Isi 0 atau kosongkan untuk menonaktifkan.", true); … }
```
Teks help di `#budget-help` (HTML statis dan `renderBudget`) juga diperbarui agar konsisten.

---

### BUG 2 — `aria-invalid` tidak diset saat error overflow total (diperbaiki)

**File:** `js/script.js`, handler `$("transaction-form").addEventListener("submit", …)`

**Kondisi:** Validasi field (nama/amount/kategori) lolos dan `aria-invalid` di-remove dari semua field. Kemudian cek overflow integer:
```js
if (!Number.isSafeInteger(total + amount)) {
  $("form-error").textContent = "Total terlalu besar…";
  return;   // ← tidak ada aria-invalid, tidak ada focus
}
```
`#form-error` diisi pesan kesalahan, tetapi field `#amount` tidak mendapat `aria-invalid="true"` dan fokus tidak dipindahkan. Screen reader yang memantau `role="alert"` akan mengumumkan pesan, tetapi program bantu berbasis navigasi form tidak akan menemukan field yang bermasalah.

**Dampak:** Aksesibilitas berkurang pada kondisi edge (agregat sangat besar). Kondisi ini jarang terjadi di dunia nyata (memerlukan total mendekati `Number.MAX_SAFE_INTEGER` / 100), namun tetap merupakan inkonsistensi perilaku dibandingkan cabang error lainnya.

**Perbaikan yang diterapkan:**
```js
// Sesudah
if (!Number.isSafeInteger(total + amount)) {
  $("form-error").textContent = "Total terlalu besar untuk dihitung dengan aman.";
  $("amount").setAttribute("aria-invalid", "true");
  $("amount").focus();
  return;
}
```

---

### CELAH LOCAL STORAGE — `createdAt` tidak dibatasi panjang sebelum `Date.parse` (diperbaiki)

**File:** `js/script.js`, fungsi `validTransaction`

**Kondisi:** Field `item.id` dibatasi 100 karakter, `item.name` dibatasi 80 karakter, namun `item.createdAt` hanya dicek dengan `Number.isFinite(Date.parse(item.createdAt))` tanpa verifikasi tipe string atau batas panjang terlebih dahulu. Data korupsi atau yang sengaja dimodifikasi di DevTools bisa menyisipkan nilai `createdAt` sebagai non-string (misalnya angka, array) atau string sangat panjang. `Date.parse` akan dipanggil atas nilai tersebut sebelum filter membuangnya.

**Dampak:** Risiko sangat rendah dalam konteks Local Storage same-origin, dan tidak menyebabkan crash karena `Date.parse` mengembalikan `NaN` yang kemudian ditolak `Number.isFinite`. Namun tanpa guard tipe dan panjang, sebuah string jutaan karakter akan diproses sebelum ditolak.

**Perbaikan yang diterapkan:**
```js
// Sebelum
Object.hasOwn(CATEGORIES, item.category) && Number.isFinite(Date.parse(item.createdAt));

// Sesudah
Object.hasOwn(CATEGORIES, item.category) &&
  typeof item.createdAt === "string" && item.createdAt.length <= 40 &&
  Number.isFinite(Date.parse(item.createdAt));
```
Batas 40 karakter cukup longgar untuk ISO 8601 (24 karakter) dan format dengan timezone eksplisit, sambil menolak string arbitrarily long.

---

### Temuan yang tidak memerlukan perbaikan

| Temuan | Keputusan |
|---|---|
| `loadData` tidak mereset state sebelum memuat | Tidak perlu: fungsi hanya dipanggil sekali saat init. Pemanggilan ulang (storage event) mereset state secara manual sebelum memanggil `loadData`. Tidak ada jalur kode yang memanggil `loadData` kedua kali tanpa reset. |
| `parseAmount` menolak leading dot (`.5`) | Disengaja dan konsisten dengan brief yang mensyaratkan format rupiah standar. |
| `localStorage.setItem` quota exceeded | Sudah ditangani: `saveData` menangkap exception, menampilkan notice, dan mengembalikan `false`. Caller menampilkan notice tambahan atau membiarkan state in-memory tetap valid. |
| Tidak ada mekanisme "undo" hapus transaksi | Di luar scope brief. |

---

## 3. Pengujian fungsional browser

Pengujian berikut tercatat di `VERIFICATION.md` dan dilakukan melalui browser Chromium pada 3 Oktober 2026, terpisah dari review statis Kiro.

| Pengujian | Hasil tercatat |
|---|---|
| Sintaks JavaScript (`node --check`) | Lulus |
| Validasi form: kosong, nol, tanpa kategori | Error muncul; tidak ada transaksi dibuat |
| Tiga kategori Rp35.000 / Rp20.000 / Rp45.000 | Total Rp100.000; distribusi 35% / 20% / 45% |
| Batas anggaran Rp80.000 dengan total Rp100.000 | Indikator merah, kelebihan Rp20.000 ditampilkan |
| Persistence setelah reload | Transaksi, budget, dan tema dark tersimpan |
| Hapus satu transaksi | Total dan chart diperbarui |
| Hapus semua transaksi | Empty state dan Rp0 dikembalikan |
| Desimal 0,10 + 0,20 | Tampil Rp0,3 (integer hundredths benar) |
| Teks literal HTML markup | Ditampilkan sebagai teks, tidak dieksekusi |
| Viewport 320 / 390 / 1280px | Tidak ada horizontal overflow |
| Konsol browser | Tidak ada error atau warning |

Catatan VERIFICATION.md: Firefox, Edge, dan Safari tidak diuji secara terpisah. Simulasi storage unavailable/corrupt tidak dilakukan di browser.

---

## 4. Rangkuman perubahan yang dilakukan Kiro

| File | Perubahan |
|---|---|
| `js/script.js` | Bug 1: tambah `raw === ""` guard di budget handler; pesan error diperbarui |
| `js/script.js` | Bug 2: tambah `aria-invalid` + `focus()` di branch overflow-total |
| `js/script.js` | Celah LS: tambah `typeof … === "string" && length <= 40` di `validTransaction` |
| `js/script.js` | `renderBudget`: teks help diperbarui agar konsisten dengan pesan error baru |
| `index.html` | Teks statis `#budget-help` diperbarui agar konsisten dengan `renderBudget` |

Tidak ada perubahan pada `css/style.css`, struktur file, atau desain visual.
