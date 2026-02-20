# 🏠 HOME Booklet Generator

Web application untuk mengotomatisasi pembuatan PDF **Bahan Sharing** dari transkrip khotbah YouTube (Ibadah Hari Minggu). Aplikasi ini dirancang untuk bekerja berdampingan dengan **Google Gemini AI** demi mempercepat proses ekstraksi poin khotbah menjadi dokumen siap cetak.

## 📖 Workflow Cara Penggunaan (Untuk Editor)
1. Dapatkan Transkrip: Buka video Ibadah Minggu, salin URL-nya.
2. Ekstraksi AI: Berikan URL tersebut kepada Google Gemini Gem.
3. Copy JSON: Gemini akan mengeluarkan rangkuman dalam bentuk kode JSON. Copy seluruh kode JSON tersebut.
4. Paste di App: Buka web app ini, masuk ke tab "🤖 Input Data Gemini", dan paste JSON tersebut.
5. Load & Edit: Klik "Load Data ke Form". Pindah ke tab "✏️ Edit & Preview" untuk merapikan teks jika diperlukan.
6. Download: Klik "Generate & Download PDF". Selesai!
