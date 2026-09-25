import { useState } from 'react';

const faqs = [
  {
    section: 'Produk',
    items: [
      { q: 'Apa material yang digunakan untuk tumbler Amsterdam Store?', a: 'Semua tumbler kami terbuat dari stainless steel food-grade 18/8 yang bebas BPA, aman untuk kesehatan, dan tahan lama.' },
      { q: 'Berapa lama tumbler bisa menjaga suhu minuman?', a: 'Tumbler kami menggunakan teknologi double-wall vacuum insulation yang dapat menjaga minuman dingin hingga 24 jam dan minuman panas hingga 12 jam.' },
      { q: 'Apakah tumbler bisa dicuci dengan mesin cuci piring (dishwasher)?', a: 'Sebagian besar produk kami dishwasher safe, kecuali yang memiliki lapisan powder coat. Kami menyarankan mencuci dengan tangan untuk menjaga kualitas jangka panjang.' },
      { q: 'Apakah tumbler cocok untuk minuman berkarbonasi?', a: 'Tidak disarankan karena tekanan dari minuman berkarbonasi dapat membuat tutup sulit dibuka dan berpotensi merusak seal.' },
    ],
  },
  {
    section: 'Pemesanan & Pengiriman',
    items: [
      { q: 'Berapa lama proses pengiriman?', a: 'Reguler: 3-5 hari kerja, Express: 1-2 hari kerja, Same Day: hari yang sama (khusus Jabodetabek).' },
      { q: 'Apakah ada gratis ongkos kirim?', a: 'Ya! Gratis ongkos kirim ke seluruh Indonesia untuk pembelian minimum Rp 200.000. Gunakan kode FREEONGKIR saat checkout.' },
      { q: 'Bisakah saya melacak pesanan saya?', a: 'Ya, setelah pesanan diproses Anda akan menerima nomor resi via email/SMS. Gunakan halaman Lacak Pesanan untuk memantau status pengiriman.' },
      { q: 'Apakah bisa COD (bayar di tempat)?', a: 'Ya, kami mendukung COD untuk area Jabodetabek, Surabaya, Bandung, Medan, dan beberapa kota besar lainnya.' },
    ],
  },
  {
    section: 'Pembayaran',
    items: [
      { q: 'Apa saja metode pembayaran yang tersedia?', a: 'Kami menerima Transfer Bank (BCA, Mandiri, BNI, BRI), GoPay, OVO, DANA, ShopeePay, QRIS, dan COD.' },
      { q: 'Apakah transaksi aman?', a: 'Ya, semua transaksi dilindungi dengan enkripsi SSL 256-bit. Kami tidak menyimpan informasi kartu kredit Anda.' },
    ],
  },
  {
    section: 'Garansi & Pengembalian',
    items: [
      { q: 'Apa yang tercakup dalam garansi produk?', a: 'Garansi 2 tahun mencakup cacat produksi seperti kebocoran, kerusakan insulasi, dan masalah pada tutup. Tidak mencakup kerusakan akibat pemakaian tidak wajar.' },
      { q: 'Bagaimana cara mengajukan pengembalian barang?', a: 'Produk dapat dikembalikan dalam 30 hari jika belum digunakan dan dalam kondisi original. Hubungi CS kami via WhatsApp atau email untuk proses pengembalian.' },
      { q: 'Berapa lama proses refund?', a: 'Refund diproses dalam 3-7 hari kerja setelah barang diterima dan diverifikasi oleh tim kami.' },
    ],
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      <div style={{ background: 'var(--primary)', padding: '64px 16px', textAlign: 'center' }}>
        <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }} className="uppercase mb-3">FAQ</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: '#fff' }} className="text-4xl font-bold mb-3">Pertanyaan yang Sering Diajukan</h1>
        <p style={{ color: 'rgba(245,240,232,0.65)' }}>Temukan jawaban atas pertanyaan umum seputar produk dan layanan kami</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        {faqs.map(section => (
          <div key={section.section} className="mb-10">
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: '16px', fontSize: '1.4rem', fontWeight: 700 }}>{section.section}</h2>
            <div className="space-y-3">
              {section.items.map((item, i) => {
                const key = `${section.section}-${i}`;
                return (
                  <div key={key} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <button
                      onClick={() => setOpen(open === key ? null : key)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '16px 20px', textAlign: 'left', color: 'var(--foreground)', fontWeight: 600, fontSize: '14px' }}
                    >
                      <span>{item.q}</span>
                      <span style={{ color: 'var(--accent)', fontSize: '18px', flexShrink: 0, marginLeft: '12px', transition: 'transform 0.2s', display: 'inline-block', transform: open === key ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                    </button>
                    {open === key && (
                      <div style={{ padding: '0 20px 16px', color: 'var(--muted-foreground)', fontSize: '14px', lineHeight: '1.7', borderTop: '1px solid var(--border)' }}>
                        <div style={{ paddingTop: '14px' }}>{item.a}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ background: 'var(--muted)', borderRadius: '16px', padding: '28px', textAlign: 'center', border: '1px solid var(--border)' }}>
          <h3 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>Tidak menemukan jawaban yang dicari?</h3>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '16px' }}>Tim CS kami siap membantu kamu melalui berbagai saluran</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="https://wa.me/6287711263928" style={{ background: '#25D366', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600 }} className="hover:opacity-90">WhatsApp</a>
            <a href="mailto:support@amsterdam.store" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600 }} className="hover:opacity-90">Email</a>
          </div>
        </div>
      </div>
    </div>
  );
}
