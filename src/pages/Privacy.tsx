export default function Privacy() {
  const sections = [
    { title: '1. Informasi yang Kami Kumpulkan', content: 'Kami mengumpulkan informasi yang Anda berikan secara langsung, seperti nama, email, nomor telepon, dan alamat saat mendaftar atau melakukan pemesanan. Kami juga mengumpulkan data penggunaan website secara otomatis melalui cookies dan teknologi serupa.' },
    { title: '2. Penggunaan Informasi', content: 'Informasi yang kami kumpulkan digunakan untuk: memproses pesanan dan pembayaran, mengirimkan konfirmasi dan update pesanan, memberikan layanan pelanggan, mengirimkan komunikasi pemasaran (jika diizinkan), menganalisis dan meningkatkan layanan kami.' },
    { title: '3. Berbagi Informasi', content: 'Kami tidak menjual informasi pribadi Anda kepada pihak ketiga. Kami dapat berbagi informasi dengan: mitra logistik untuk pengiriman, penyedia layanan pembayaran, dan otoritas hukum jika diwajibkan oleh hukum.' },
    { title: '4. Keamanan Data', content: 'Kami menggunakan enkripsi SSL 256-bit untuk melindungi data yang ditransmisikan. Informasi sensitif seperti data kartu kredit diproses langsung oleh penyedia pembayaran berlisensi. Kami menerapkan kontrol akses ketat untuk melindungi informasi Anda.' },
    { title: '5. Cookies', content: 'Kami menggunakan cookies untuk meningkatkan pengalaman berbelanja Anda, seperti mengingat preferensi dan item keranjang belanja. Anda dapat mengelola pengaturan cookies melalui browser Anda, namun hal ini mungkin mempengaruhi beberapa fungsi website.' },
    { title: '6. Hak Pengguna', content: 'Anda berhak untuk: mengakses data pribadi yang kami miliki, meminta koreksi data yang tidak akurat, meminta penghapusan data Anda, menolak pemrosesan data untuk tujuan pemasaran, dan mendapatkan portabilitas data.' },
    { title: '7. Retensi Data', content: 'Kami menyimpan data Anda selama diperlukan untuk memberikan layanan atau sesuai persyaratan hukum. Data transaksi disimpan minimal 5 tahun sesuai peraturan perpajakan Indonesia.' },
    { title: '8. Perubahan Kebijakan', content: 'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan signifikan akan dikomunikasikan melalui email atau pemberitahuan di website.' },
    { title: '9. Kontak', content: 'Untuk pertanyaan terkait kebijakan privasi atau untuk menggunakan hak-hak Anda, hubungi kami di: privacy@amsterdam.store atau melalui form kontak di halaman Kontak kami.' },
  ];

  return (
    <div>
      <div style={{ background: 'var(--primary)', padding: '64px 16px', textAlign: 'center' }}>
        <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }} className="uppercase mb-3">Legal</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: '#fff' }} className="text-4xl font-bold mb-3">Kebijakan Privasi</h1>
        <p style={{ color: 'rgba(245,240,232,0.65)', fontSize: '14px' }}>Terakhir diperbarui: 1 September 2026</p>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.8', marginBottom: '32px' }}>
          Privasi Anda penting bagi kami. Kebijakan ini menjelaskan bagaimana Amsterdam Store mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
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
