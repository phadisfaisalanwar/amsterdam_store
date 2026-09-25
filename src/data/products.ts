import image500 from '../../WhatsApp Image 2026-09-22 500 ml.jpeg';
import image600 from '../../WhatsApp Image 2026-09-22 600 ml.jpeg';
import image710 from '../../WhatsApp Image 2026-09-22 710 ml.jpeg';
import image750 from '../../WhatsApp Image 2026-09-22 750 ml.jpeg';
import image900 from '../../WhatsApp Image 2026-09-22 900 ml.jpeg';
import faizPhoto from '../../WhatsApp Image 2026-09-24 faiz.jpeg';
import farisPhoto from '../../WhatsApp Image 2026-09-24 faris.jpeg';
import kikiPhoto from '../../WhatsApp Image 2026-09-24 kiki.jpeg';
import phadisPhoto from '../../WhatsApp Image 2026-09-24 phadis.jpeg';
import riyadiPhoto from '../../WhatsApp Image 2026-09-24 riyadi.jpeg';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  longDescription: string;
  capacity: string;
  material: string;
  color: string;
  image: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  features: string[];
  sku: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Amsterdam Classic 500ml',
    category: 'Classic',
    price: 95000,
    originalPrice: 150000,
    description: 'Tumbler stainless steel premium dengan lapisan vacuum insulation double-wall untuk menjaga minuman tetap segar.',
    longDescription: 'Amsterdam Classic hadir dengan desain minimalis khas Belanda. Teknologi double-wall vacuum insulation menjaga minuman dingin hingga 24 jam dan panas hingga 12 jam. Cocok untuk aktivitas sehari-hari.',
    capacity: '500ml',
    material: 'Stainless Steel 18/8',
    color: 'Navy Blue',
    image: image500,
    images: [image500],
    stock: 45,
    rating: 4.8,
    reviewCount: 128,
    badge: 'Best Seller',
    features: ['Double-wall vacuum', 'BPA Free', 'Leak-proof lid', 'Dishwasher safe'],
    sku: 'AMS-CLX-500-NVY',
  },
  {
    id: 2,
    name: 'Amsterdam Premium 750ml',
    category: 'Premium',
    price: 165000,
    description: 'Kapasitas besar dengan teknologi insulasi terbaik untuk menemani petualanganmu seharian penuh.',
    longDescription: 'Amsterdam Premium dirancang untuk mereka yang butuh hidrasi lebih. Kapasitas 750ml cukup untuk satu hari penuh aktivitas. Material stainless 18/8 grade food-safe, bebas BPA.',
    capacity: '750ml',
    material: 'Stainless Steel 18/8',
    color: 'Forest Green',
    image: image750,
    images: [image750],
    stock: 32,
    rating: 4.9,
    reviewCount: 89,
    badge: 'New',
    features: ['Double-wall vacuum', 'BPA Free', 'Wide mouth', 'Carry handle'],
    sku: 'AMS-PRM-750-GRN',
  },
  {
    id: 3,
    name: 'Amsterdam Elite 900ml',
    category: 'Elite',
    price: 175000,
    description: 'Untuk para petualang sejati. Kapasitas 1 liter dengan ketahanan ekstra dan desain ergonomis.',
    longDescription: 'Amsterdam Elite adalah tumbler terbesar dalam koleksi kami. Ideal untuk gym, hiking, dan aktivitas outdoor. Dilengkapi grip ergonomis dan tutup yang aman dari tumpahan.',
    capacity: '900ml',
    material: 'Stainless Steel 18/8',
    color: 'Matte Black',
    image: image900,
    images: [image900],
    stock: 18,
    rating: 4.7,
    reviewCount: 67,
    features: ['Double-wall vacuum', 'BPA Free', 'Ergonomic grip', 'Straw included'],
    sku: 'AMS-ELT-900-BLK',
  },
  {
    id: 4,
    name: 'Amsterdam Slim 710ml',
    category: 'Classic',
    price: 224000,
    originalPrice: 185000,
    description: 'Desain ramping yang muat di cup holder mobil. Pilihan sempurna untuk commuter dan traveler.',
    longDescription: 'Amsterdam Slim hadir dengan desain silinder tipis yang pas di cup holder standar. Ringan dan mudah dibawa kemana saja. Tersedia dalam warna Rose Gold yang elegan.',
    capacity: '710ml',
    material: 'Stainless Steel 18/8',
    color: 'Rose Gold',
    image: image710,
    images: [image710],
    stock: 56,
    rating: 4.6,
    reviewCount: 112,
    badge: 'Sale',
    features: ['Slim design', 'BPA Free', 'Cup holder fit', 'Lightweight'],
    sku: 'AMS-SLM-710-RGD',
  },
  {
    id: 5,
    name: 'Amsterdam Sport 600ml',
    category: 'Sport',
    price: 150000,
    description: 'Dirancang khusus untuk aktivitas olahraga dengan tutup flip-top yang mudah dibuka satu tangan.',
    longDescription: 'Amsterdam Sport hadir dengan tutup flip-top yang bisa dibuka dengan satu tangan saat sedang berolahraga. Body ergonomis dengan grip yang nyaman bahkan saat berkeringat.',
    capacity: '600ml',
    material: 'Stainless Steel 18/8',
    color: 'Coral Red',
    image: image600,
    images: [image600],
    stock: 40,
    rating: 4.8,
    reviewCount: 95,
    features: ['Flip-top lid', 'BPA Free', 'Non-slip grip', 'Quick-flow spout'],
    sku: 'AMS-SPT-600-RED',
  },
];

export const categories = ['Semua', 'Classic', 'Premium', 'Elite', 'Sport'];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

export const blogPosts = [
  {
    id: 1,
    title: '5 Alasan Mengapa Tumbler Stainless Lebih Baik dari Plastik',
    excerpt: 'Beralih ke tumbler stainless bukan hanya soal tren, tapi soal kesehatan dan lingkungan...',
    category: 'Tips & Trik',
    date: '15 September 2026',
    image: image500,
    author: 'Tim Amsterdam Store',
    readTime: '5 menit',
  },
  {
    id: 2,
    title: 'Cara Merawat Tumbler Stainless agar Awet Bertahun-tahun',
    excerpt: 'Tumbler stainless yang dirawat dengan benar bisa bertahan lebih dari 10 tahun...',
    category: 'Perawatan',
    date: '10 September 2026',
    image: image750,
    author: 'Tim Amsterdam Store',
    readTime: '4 menit',
  },
  {
    id: 3,
    title: 'Koleksi Terbaru Amsterdam Premium: Hadir dengan Warna-warna Eksklusif',
    excerpt: 'Kami dengan bangga memperkenalkan koleksi terbaru Amsterdam Premium dengan 6 warna pilihan...',
    category: 'Produk Baru',
    date: '5 September 2026',
    image: image900,
    author: 'Tim Amsterdam Store',
    readTime: '3 menit',
  },
  {
    id: 4,
    title: 'Hidrasi Optimal: Berapa Banyak Air yang Harus Diminum Setiap Hari?',
    excerpt: 'Dehidrasi adalah masalah kesehatan yang sering diabaikan. Ketahui kebutuhan air harianmu...',
    category: 'Kesehatan',
    date: '1 September 2026',
    image: image710,
    author: 'Tim Amsterdam Store',
    readTime: '6 menit',
  },
];
export const testimonials = [
  {
    id: 1,
    name: 'Faiz Zulfikar',
    city: 'Jakarta',
    rating: 5,
    text: 'Kualitasnya luar biasa! Sudah pakai Amsterdam Classic selama 6 bulan dan masih bagus sekali. Air tetap dingin sampai 20 jam!',
    product: 'Amsterdam Classic 500ml',
    avatar: faizPhoto,
  },
  {
    id: 2,
    name: 'Phadis Faisal',
    city: 'Surabaya',
    rating: 5,
    text: 'Saya sudah beli 3 tumbler Amsterdam untuk sekeluarga. Pengiriman cepat dan packaging sangat rapi. Recommended!',
    product: 'Amsterdam Premium 750ml',
    avatar: phadisPhoto,
  },
  {
    id: 3,
    name: 'Rina Kusuma',
    city: 'Bandung',
    rating: 5,
    text: 'Amsterdam Luxe ini beneran mewah banget. Jadi hadiah ulang tahun suami dan dia suka banget. Worth every penny!',
    product: 'Amsterdam Luxe 500ml',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format',
  },
  {
    id: 4,
    name: 'Faris Salim',
    city: 'Medan',
    rating: 4,
    text: 'Produk bagus, harga terjangkau. Untuk ukuran 1 liter sangat cocok dibawa gym. Grip-nya nyaman di tangan.',
    product: 'Amsterdam Elite 1000ml',
    avatar: farisPhoto,
  },
  {
    id: 5,
    name: 'Slamet Edi Riyadi',
    city: 'Yogyakarta',
    rating: 5,
    text: 'Customer service sangat ramah dan responsif. Barang sampai lebih cepat dari estimasi. Pasti beli lagi!',
    product: 'Amsterdam Slim 350ml',
    avatar: riyadiPhoto,
  },
  {
    id: 6,
    name: 'Dian Prasetyo',
    city: 'Semarang',
    rating: 5,
    text: 'Amsterdam Sport sangat cocok untuk aktivitas outdoor saya. Tutupnya mudah dibuka satu tangan saat naik sepeda.',
    product: 'Amsterdam Sport 600ml',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format',
  },
];

export const promos = [
  {
    id: 1,
    title: 'Flash Sale 9.9',
    description: 'Diskon 30% untuk semua produk Classic',
    discount: 30,
    code: 'FLASH99',
    endDate: '2026-09-30',
    category: 'Classic',
    image: image500,
    minPurchase: 0,
  },
  {
    id: 2,
    title: 'Gratis Ongkir se-Indonesia',
    description: 'Gratis ongkos kirim untuk pembelian minimum Rp 200.000',
    discount: 0,
    code: 'FREEONGKIR',
    endDate: '2026-10-15',
    category: 'Semua',
    image: image750,
    minPurchase: 200000,
  },
  {
    id: 3,
    title: 'Bundle Hemat Keluarga',
    description: 'Beli 3 tumbler gratis 1 Amsterdam Mini',
    discount: 0,
    code: 'BUNDLE3',
    endDate: '2026-10-31',
    category: 'Semua',
    image: image900,
    minPurchase: 500000,
  },
];
