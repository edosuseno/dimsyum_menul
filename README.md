# Dimsum Menul - Website Order Online

Website order online untuk **Dimsum Menul by Bunda Nathan** - UMKM dimsum premium homemade.

## 🌟 Fitur Utama

### Untuk Pelanggan:
- ✅ **Katalog Menu** dengan foto menarik dan deskripsi lengkap
- ✅ **Pilihan Kondisi** - Hot (Siap Makan) atau Frozen (Stok)
- ✅ **Add-ons/Topping** - Chili Oil & Mayonnaise
- ✅ **Pre-Order System** - Pilih tanggal dan slot waktu pengiriman
- ✅ **Keranjang Belanja** dengan floating cart yang interaktif
- ✅ **WhatsApp Integration** - Order langsung via WA dengan format rapi
- ✅ **Testimoni Pelanggan** - Social proof untuk kepercayaan
- ✅ **Info Lengkap** - Jam operasional, area pengiriman, kontak

### Teknologi:
- 🚀 **Pure HTML/CSS/JS** - Tidak perlu framework, cepat dimuat
- 📱 **Mobile-First Design** - Responsif di semua perangkat
- ⚡ **Lazy Loading** - Optimasi loading gambar
- 🎨 **Modern UI/UX** - Animasi smooth dan interaktif
- 🔒 **No Database** - Backendless, langsung ke WhatsApp

## 📂 Struktur File

```
dimsummenul.com/
├── index.html      # Halaman utama
├── styles.css      # Styling lengkap
├── script.js       # Logic aplikasi
├── admin.html      # Dashboard admin (opsional)
└── README.md       # Dokumentasi
```

## 🚀 Cara Menggunakan

1. **Buka file `index.html`** di browser
2. **Ganti nomor WhatsApp** di `script.js` (baris 228):
   ```javascript
   const waNumber = '6281234567890'; // Ganti dengan nomor Anda
   ```
3. **Upload ke hosting** (Netlify, Vercel, atau hosting lainnya)
4. **Selesai!** Website siap digunakan

## 🎨 Kustomisasi

### Mengubah Produk:
Edit array `DATA` di `script.js`:
```javascript
const DATA = [
    { 
        id: 1, 
        name: "Nama Produk", 
        price: 15000, 
        img: "URL_GAMBAR", 
        desc: "Deskripsi produk" 
    },
    // ... tambah produk lainnya
];
```

### Mengubah Warna:
Edit CSS variables di `styles.css`:
```css
:root {
    --primary: #D32F2F;    /* Warna utama */
    --accent: #FFC107;     /* Warna aksen */
    /* ... */
}
```

### Mengubah Info Kontak:
Edit section Info di `index.html` (baris ~120-150)

## 📱 Fitur Mobile-First

- Smooth scroll navigation
- Touch-friendly buttons
- Bottom sheet modals
- Floating cart & WhatsApp button
- Swipeable testimonial slider

## 🔧 Optimasi Performa

- Lazy loading images
- Minimal CSS/JS (no frameworks)
- Preconnect untuk Google Fonts
- Efficient animations dengan CSS transforms
- No external dependencies (kecuali Font Awesome & Google Fonts)

## 📞 Support

Untuk pertanyaan atau bantuan, hubungi:
- WhatsApp: 0812-3456-7890
- Email: info@dimsummenul.com

## 📄 License

© 2024 Dimsum Menul by Bunda Nathan. All rights reserved.

---

**Dibuat dengan ❤️ untuk UMKM Indonesia**
