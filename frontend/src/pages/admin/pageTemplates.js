// Starter templates for the dynamic Page Builder. Each template is a list of
// blocks (without ids — PageBuilder assigns ids on apply). `suggestTitle` is
// used to prefill the page title only when it is still empty.
//
// Block shapes mirror BLOCK_TYPES in PageBuilder.jsx / BlockRenderer.jsx.

const HTML_STARTER = `<section style="padding:56px 24px;max-width:1100px;margin:0 auto;font-family:Inter,system-ui,sans-serif;">
  <p style="text-transform:uppercase;letter-spacing:2px;color:#0066CC;font-weight:600;font-size:0.8rem;margin:0 0 8px;">Halaman Kustom</p>
  <h1 style="font-size:2.2rem;font-weight:700;color:#0B3D7D;margin:0 0 12px;line-height:1.2;">Judul Halaman Anda</h1>
  <p style="color:#4A5568;line-height:1.8;max-width:680px;">Blok HTML ini memberi Anda kontrol penuh atas tata letak. Edit kode di panel admin, gunakan tag HTML dan gaya <em>inline</em> untuk membuat desain lanjutan sesuai kebutuhan.</p>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:32px;">
    <div style="background:#F0F8FF;border:1px solid #E3F2FD;border-radius:14px;padding:24px;">
      <h3 style="margin:0 0 8px;color:#0066CC;font-size:1.1rem;">Fitur Pertama</h3>
      <p style="margin:0;color:#4A5568;line-height:1.6;">Jelaskan poin penting pertama di sini.</p>
    </div>
    <div style="background:#F0F8FF;border:1px solid #E3F2FD;border-radius:14px;padding:24px;">
      <h3 style="margin:0 0 8px;color:#0066CC;font-size:1.1rem;">Fitur Kedua</h3>
      <p style="margin:0;color:#4A5568;line-height:1.6;">Jelaskan poin penting kedua di sini.</p>
    </div>
    <div style="background:#F0F8FF;border:1px solid #E3F2FD;border-radius:14px;padding:24px;">
      <h3 style="margin:0 0 8px;color:#0066CC;font-size:1.1rem;">Fitur Ketiga</h3>
      <p style="margin:0;color:#4A5568;line-height:1.6;">Jelaskan poin penting ketiga di sini.</p>
    </div>
  </div>

  <div style="margin-top:36px;padding:28px;border-radius:16px;background:linear-gradient(135deg,#0066CC,#0B3D7D);color:#fff;text-align:center;">
    <h2 style="margin:0 0 8px;font-size:1.5rem;">Ajakan Bertindak</h2>
    <p style="margin:0 0 16px;opacity:.9;">Tambahkan ajakan atau informasi kontak di sini.</p>
    <a href="/kontak" style="display:inline-block;background:#fff;color:#0066CC;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px;">Hubungi Kami</a>
  </div>
</section>`

export const PAGE_TEMPLATES = [
  {
    id: 'blank',
    name: 'Kosong',
    description: 'Mulai dari nol tanpa blok apa pun.',
    blocks: []
  },
  {
    id: 'profil',
    name: 'Profil / Tentang Kami',
    description: 'Hero, ringkasan, nilai-nilai, dan ajakan kontak.',
    suggestTitle: 'Tentang Kami',
    blocks: [
      { type: 'hero', data: { subtitle: 'Profil', title: 'Tentang Kami', description: 'Mengenal lebih dekat instansi kami', bgColor: '', ctaText: '', ctaLink: '' } },
      { type: 'text', data: { heading: 'Sekilas Tentang Kami', html: '<p>Tuliskan sejarah singkat, visi, misi, dan komitmen instansi pada bagian ini. Anda dapat menggunakan beberapa paragraf untuk menjelaskan secara lengkap.</p>' } },
      { type: 'cards', data: { heading: 'Nilai-Nilai Kami', items: [
        { title: 'Profesional', description: 'Bekerja dengan standar dan kompetensi terbaik.' },
        { title: 'Integritas', description: 'Jujur, transparan, dan bertanggung jawab.' },
        { title: 'Melayani', description: 'Mengutamakan kepuasan dan kebutuhan masyarakat.' }
      ] } },
      { type: 'cta', data: { title: 'Punya Pertanyaan?', description: 'Hubungi kami untuk informasi lebih lanjut.', buttonText: 'Hubungi Kami', buttonLink: '/kontak' } }
    ]
  },
  {
    id: 'layanan',
    name: 'Halaman Layanan',
    description: 'Hero, daftar layanan dalam kartu, dan CTA.',
    suggestTitle: 'Layanan',
    blocks: [
      { type: 'hero', data: { subtitle: 'Layanan', title: 'Layanan Kami', description: 'Berbagai layanan yang kami sediakan untuk masyarakat', bgColor: '', ctaText: '', ctaLink: '' } },
      { type: 'cards', data: { heading: 'Daftar Layanan', items: [
        { title: 'Layanan Pertama', description: 'Deskripsi singkat layanan pertama.', link: '' },
        { title: 'Layanan Kedua', description: 'Deskripsi singkat layanan kedua.', link: '' },
        { title: 'Layanan Ketiga', description: 'Deskripsi singkat layanan ketiga.', link: '' }
      ] } },
      { type: 'cta', data: { title: 'Butuh Bantuan?', description: 'Tim kami siap membantu Anda.', buttonText: 'Hubungi Kami', buttonLink: '/kontak' } }
    ]
  },
  {
    id: 'faq',
    name: 'FAQ / Tanya Jawab',
    description: 'Hero dan daftar pertanyaan-jawaban dalam kartu.',
    suggestTitle: 'Pertanyaan Umum',
    blocks: [
      { type: 'hero', data: { subtitle: 'Bantuan', title: 'Pertanyaan yang Sering Diajukan', description: 'Temukan jawaban atas pertanyaan umum di sini', bgColor: '', ctaText: '', ctaLink: '' } },
      { type: 'cards', data: { heading: '', items: [
        { title: 'Bagaimana cara mengajukan layanan?', description: 'Tuliskan jawaban untuk pertanyaan ini.' },
        { title: 'Berapa lama proses pengurusan?', description: 'Tuliskan jawaban untuk pertanyaan ini.' },
        { title: 'Apa saja persyaratan yang dibutuhkan?', description: 'Tuliskan jawaban untuk pertanyaan ini.' }
      ] } }
    ]
  },
  {
    id: 'program',
    name: 'Landing Program',
    description: 'Hero, penjelasan, galeri foto, dan CTA.',
    suggestTitle: 'Program',
    blocks: [
      { type: 'hero', data: { subtitle: 'Program', title: 'Nama Program', description: 'Penjelasan singkat mengenai program ini', bgColor: '', ctaText: 'Pelajari Lebih Lanjut', ctaLink: '' } },
      { type: 'text', data: { heading: 'Tentang Program', html: '<p>Jelaskan tujuan, sasaran, dan manfaat program pada bagian ini.</p>' } },
      { type: 'gallery', data: { heading: 'Dokumentasi Kegiatan', images: [] } },
      { type: 'cta', data: { title: 'Ikut Berpartisipasi', description: 'Hubungi kami untuk informasi keikutsertaan.', buttonText: 'Hubungi Kami', buttonLink: '/kontak' } }
    ]
  },
  {
    id: 'ppid',
    name: 'PPID / Dokumen Publik',
    description: 'Hero, penjelasan, dan daftar dokumen yang dapat diunduh.',
    suggestTitle: 'PPID',
    blocks: [
      { type: 'hero', data: { subtitle: 'Informasi Publik', title: 'PPID', description: 'Pejabat Pengelola Informasi dan Dokumentasi', bgColor: '', ctaText: '', ctaLink: '' } },
      { type: 'text', data: { heading: 'Tentang PPID', html: '<p>Jelaskan peran PPID dan tata cara permohonan informasi publik di sini.</p>' } },
      { type: 'dokumen', data: { heading: 'Dokumen Publik', kategori: '', limit: '' } }
    ]
  },
  {
    id: 'kontak',
    name: 'Kontak Unit Kerja',
    description: 'Halaman kontak lengkap (info kantor, jam, formulir, peta, sosial) yang bisa dikustomisasi per unit kerja.',
    suggestTitle: 'Hubungi Kami',
    blocks: [
      { type: 'kontak', data: {
        title: 'Hubungi Kami',
        subtitle: 'Kami siap melayani dan membantu kebutuhan Anda',
        badge: '',
        showEmergency: false,
        emergencyNumber: '',
        emergencyText: '',
        officeTitle: 'Kantor Unit Kerja',
        address: 'Tuliskan alamat lengkap kantor unit kerja di sini',
        phone: '(0000) 000000',
        fax: '',
        email: 'email@contoh.go.id',
        website: '',
        workingHoursTitle: 'Jam Operasional',
        workingHours: [
          { day: 'Senin - Kamis', hours: '08.00 - 16.00 WITA' },
          { day: 'Jumat', hours: '08.00 - 16.30 WITA' },
          { day: 'Sabtu, Minggu & Hari Libur', hours: 'Tutup' }
        ],
        workingHoursNote: '',
        showForm: true,
        formTitle: 'Kirim Pesan',
        unitLabel: '',
        mapTitle: 'Lokasi Kantor',
        mapEmbed: '',
        mapsLink: 'https://maps.google.com',
        socialTitle: 'Media Sosial',
        facebook: '', twitter: '', instagram: '', youtube: ''
      } }
    ]
  },
  {
    id: 'html',
    name: 'HTML (Lanjutan)',
    description: 'Satu blok HTML penuh untuk kustomisasi tata letak tingkat lanjut.',
    suggestTitle: 'Halaman Kustom',
    blocks: [
      { type: 'html', data: { html: HTML_STARTER } }
    ]
  }
]
