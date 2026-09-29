export default function Terms() {
  const sections = [
    { title: '1. Penerimaan Syarat', content: 'Dengan mengakses dan menggunakan website Amsterdam Store (amsterdam.store), Anda menyatakan bahwa Anda telah membaca, memahami, dan setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan syarat-syarat ini, mohon untuk tidak menggunakan layanan kami.' },
    { title: '2. Definisi', content: '"Amsterdam Store" merujuk pada PT Amsterdam Store Indonesia yang mengelola toko online ini. "Pengguna" merujuk pada individu yang mengakses atau menggunakan layanan kami. "Produk" merujuk pada semua barang yang dijual melalui platform ini.' },
    { title: '3. Penggunaan Akun', content: 'Pengguna wajib menjaga kerahasiaan informasi akun mereka termasuk username dan password. Setiap aktivitas yang terjadi melalui akun Anda merupakan tanggung jawab Anda. Anda wajib segera melaporkan kepada kami jika terdapat akses tidak sah terhadap akun Anda.' },
    { title: '4. Pemesanan dan Pembayaran', content: 'Semua harga yang tercantum dalam Rupiah Indonesia (IDR) dan sudah termasuk PPN. Pemesanan dianggap sah setelah konfirmasi pembayaran diterima. Kami berhak membatalkan pesanan jika terjadi ketidaksesuaian informasi atau stok tidak tersedia.' },
    { title: '5. Pengiriman', content: 'Pengiriman dilakukan ke seluruh wilayah Indonesia melalui jasa ekspedisi terpercaya. Estimasi waktu pengiriman dapat berubah tergantung kondisi dan lokasi tujuan. Risiko kehilangan atau kerusakan selama pengiriman ditanggung oleh pihak ekspedisi.' },
    { title: '6. Kebijakan Pengembalian', content: 'Produk dapat dikembalikan dalam 30 hari sejak diterima jika terdapat cacat produksi atau tidak sesuai pesanan. Produk yang dikembalikan harus dalam kondisi original dengan kemasan lengkap. Biaya pengembalian ditanggung oleh kami jika kesalahan ada di pihak kami.' },
    { title: '7. Hak Kekayaan Intelektual', content: 'Seluruh konten di website ini termasuk logo, gambar, teks, dan desain merupakan milik Amsterdam Store dan dilindungi oleh hukum hak cipta Indonesia. Pengguna dilarang menyalin atau mendistribusikan konten tanpa izin tertulis.' },
    { title: '8. Batasan Tanggung Jawab', content: 'Amsterdam Store tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan layanan ini. Total tanggung jawab kami tidak akan melebihi nilai transaksi yang diperdebatkan.' },
    { title: '9. Perubahan Syarat', content: 'Kami berhak mengubah Syarat dan Ketentuan ini sewaktu-waktu. Perubahan akan efektif setelah dipublikasikan di website. Penggunaan layanan setelah perubahan dipublikasikan dianggap sebagai penerimaan terhadap syarat yang diperbarui.' },
    { title: '10. Hukum yang Berlaku', content: 'Syarat dan Ketentuan ini diatur oleh hukum Negara Kesatuan Republik Indonesia. Segala perselisihan akan diselesaikan melalui musyawarah, atau jika tidak tercapai kesepakatan, melalui pengadilan yang berwenang di Jakarta.' },
  ];

  return (
    <div>
      <div style={{ background: 'var(--primary)', padding: '64px 16px', textAlign: 'center' }}>
        <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }} className="uppercase mb-3">Legal</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: '#fff' }} className="text-4xl font-bold mb-3">Syarat dan Ketentuan</h1>
        <p style={{ color: 'rgba(245,240,232,0.65)', fontSize: '14px' }}>Terakhir diperbarui: 1 September 2026</p>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.8', marginBottom: '32px' }}>
          Selamat datang di Amsterdam Store. Sebelum menggunakan layanan kami, mohon baca dengan seksama Syarat dan Ketentuan berikut ini. Dokumen ini menjelaskan hak dan kewajiban Anda sebagai pengguna layanan kami.
        </p>
        <div className="space-y-8">
          {sections.map(s => (
            <div key={s.title}>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '10px', fontSize: '1.1rem' }}>{s.title}</h2>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.8', fontSize: '14px' }}>{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
