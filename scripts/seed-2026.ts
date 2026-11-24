import { PrismaClient, Environment, TestStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tester = await prisma.user.findFirst({
    where: { email: 'tester@qc.local' },
  });
  const qc1 = await prisma.user.findFirst({
    where: { email: 'qc1@qc.local' },
  });

  if (!tester) {
    throw new Error('Tester user not found!');
  }

  const defaultTesterId = tester.id;
  const qc1TesterId = qc1 ? qc1.id : tester.id;

  const dummyData = [
    // === JANUARI 2026 ===
    {
      sid: 'SDG-2026-001',
      taskTitle: 'Integrasi Single Sign-On (SSO) Google Workspace',
      testerId: defaultTesterId,
      testedAt: new Date('2026-01-08T09:30:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'SSO login berhasil untuk domain internal perusahaan',
      attemptNumber: 1,
      createdAt: new Date('2026-01-08T09:30:00Z'),
    },
    {
      sid: 'SDG-2026-002',
      taskTitle: 'Validasi nomor WhatsApp & OTP registrasi',
      testerId: qc1TesterId,
      testedAt: new Date('2026-01-14T11:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'OTP SMS tidak terkirim jika nomor diawali +62',
      attemptNumber: 1,
      createdAt: new Date('2026-01-14T11:00:00Z'),
    },
    {
      sid: 'SDG-2026-002',
      taskTitle: 'Validasi nomor WhatsApp & OTP registrasi',
      testerId: defaultTesterId,
      testedAt: new Date('2026-01-16T14:20:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Normalisasi format nomor telepon sudah diterapkan dan OTP terkirim < 5 detik',
      attemptNumber: 2,
      createdAt: new Date('2026-01-16T14:20:00Z'),
    },
    {
      sid: 'SDG-2026-003',
      taskTitle: 'Pembaruan layout dashboard statistik bulanan',
      testerId: defaultTesterId,
      testedAt: new Date('2026-01-25T10:15:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: null,
      attemptNumber: 1,
      createdAt: new Date('2026-01-25T10:15:00Z'),
    },

    // === FEBRUARI 2026 ===
    {
      sid: 'SDG-2026-004',
      taskTitle: 'Payment Gateway QRIS Dinamis (BCA & Mandiri)',
      testerId: defaultTesterId,
      testedAt: new Date('2026-02-05T08:45:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'QRIS dinamis ter-generate valid dan callback terproses real-time',
      attemptNumber: 1,
      createdAt: new Date('2026-02-05T08:45:00Z'),
    },
    {
      sid: 'SDG-2026-005',
      taskTitle: 'Export Laporan Keuangan ke format Excel (.xlsx)',
      testerId: qc1TesterId,
      testedAt: new Date('2026-02-12T13:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'Memory leak saat export data > 10.000 baris, server crash (out of memory)',
      attemptNumber: 1,
      createdAt: new Date('2026-02-12T13:00:00Z'),
    },
    {
      sid: 'SDG-2026-005',
      taskTitle: 'Export Laporan Keuangan ke format Excel (.xlsx)',
      testerId: defaultTesterId,
      testedAt: new Date('2026-02-18T15:30:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: 'Streaming export berhasil mengatasi memory limit, 50.000 row diexport dalam 4 detik',
      attemptNumber: 2,
      createdAt: new Date('2026-02-18T15:30:00Z'),
    },
    {
      sid: 'SDG-2026-006',
      taskTitle: 'Notifikasi Webhook callback transaksi sukses',
      testerId: defaultTesterId,
      testedAt: new Date('2026-02-24T16:00:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: null,
      attemptNumber: 1,
      createdAt: new Date('2026-02-24T16:00:00Z'),
    },

    // === MARET 2026 ===
    {
      sid: 'SDG-2026-007',
      taskTitle: 'Fitur pencarian autocomplete SKU produk',
      testerId: qc1TesterId,
      testedAt: new Date('2026-03-04T10:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Debounce 300ms bekerja optimal, query hasil pencarian responsif',
      attemptNumber: 1,
      createdAt: new Date('2026-03-04T10:00:00Z'),
    },
    {
      sid: 'SDG-2026-008',
      taskTitle: 'Upload file lampiran KYC (KTP & Foto Selfie)',
      testerId: defaultTesterId,
      testedAt: new Date('2026-03-11T11:30:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'File tipe PNG transparan gagal dikonversi ke WebP, muncul error unhandled exception',
      attemptNumber: 1,
      createdAt: new Date('2026-03-11T11:30:00Z'),
    },
    {
      sid: 'SDG-2026-008',
      taskTitle: 'Upload file lampiran KYC (KTP & Foto Selfie)',
      testerId: defaultTesterId,
      testedAt: new Date('2026-03-13T09:15:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Library sharp di-update, transparansi PNG ditangani dengan background putih otomatis',
      attemptNumber: 2,
      createdAt: new Date('2026-03-13T09:15:00Z'),
    },
    {
      sid: 'SDG-2026-009',
      taskTitle: 'Integrasi kurir logistik JNE & SiCepat tracking API',
      testerId: defaultTesterId,
      testedAt: new Date('2026-03-22T14:45:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: null,
      attemptNumber: 1,
      createdAt: new Date('2026-03-22T14:45:00Z'),
    },

    // === APRIL 2026 ===
    {
      sid: 'SDG-2026-010',
      taskTitle: 'Perhitungan otomatis PPN 12% pada invoice',
      testerId: defaultTesterId,
      testedAt: new Date('2026-04-06T09:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Perhitungan tarif pajak 12% akurat sesuai regulasi perpajakan',
      attemptNumber: 1,
      createdAt: new Date('2026-04-06T09:00:00Z'),
    },
    {
      sid: 'SDG-2026-011',
      taskTitle: 'Push notification promo Ramadhan via Firebase',
      testerId: qc1TesterId,
      testedAt: new Date('2026-04-15T10:30:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'Payload notification klik deep-link mengarah ke halaman 404',
      attemptNumber: 1,
      createdAt: new Date('2026-04-15T10:30:00Z'),
    },
    {
      sid: 'SDG-2026-011',
      taskTitle: 'Push notification promo Ramadhan via Firebase',
      testerId: defaultTesterId,
      testedAt: new Date('2026-04-17T13:00:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: 'Deep-link routing di aplikasi mobile sudah diperbaiki dan lolos uji',
      attemptNumber: 2,
      createdAt: new Date('2026-04-17T13:00:00Z'),
    },
    {
      sid: 'SDG-2026-012',
      taskTitle: 'Fitur klaim voucher diskon flash sale',
      testerId: defaultTesterId,
      testedAt: new Date('2026-04-28T16:30:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: null,
      attemptNumber: 1,
      createdAt: new Date('2026-04-28T16:30:00Z'),
    },

    // === MEI 2026 ===
    {
      sid: 'SDG-2026-013',
      taskTitle: 'Multi-warehouse stock deduction saat checkout',
      testerId: defaultTesterId,
      testedAt: new Date('2026-05-08T11:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'Race condition saat 2 user checkout item terakhir secara bersamaan, stok menjadi -1',
      attemptNumber: 1,
      createdAt: new Date('2026-05-08T11:00:00Z'),
    },
    {
      sid: 'SDG-2026-013',
      taskTitle: 'Multi-warehouse stock deduction saat checkout',
      testerId: defaultTesterId,
      testedAt: new Date('2026-05-12T14:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Pessimistic locking ditambahkan pada transaksi stok database, konsistensi stok terjamin',
      attemptNumber: 2,
      createdAt: new Date('2026-05-12T14:00:00Z'),
    },
    {
      sid: 'SDG-2026-014',
      taskTitle: 'Download Faktur Pajak format PDF',
      testerId: qc1TesterId,
      testedAt: new Date('2026-05-19T10:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: null,
      attemptNumber: 1,
      createdAt: new Date('2026-05-19T10:00:00Z'),
    },
    {
      sid: 'SDG-2026-015',
      taskTitle: 'Sinkronisasi saldo e-wallet refund otomatis',
      testerId: defaultTesterId,
      testedAt: new Date('2026-05-27T15:20:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: 'Proses reverse balance instan dan tercatat di ledger',
      attemptNumber: 1,
      createdAt: new Date('2026-05-27T15:20:00Z'),
    },

    // === JUNI 2026 ===
    {
      sid: 'SDG-2026-016',
      taskTitle: 'Filter laporan transaksi berdasarkan cabang/outlet',
      testerId: defaultTesterId,
      testedAt: new Date('2026-06-04T09:30:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Filter multi-select outlet berfungsi dengan akurat',
      attemptNumber: 1,
      createdAt: new Date('2026-06-04T09:30:00Z'),
    },
    {
      sid: 'SDG-2026-017',
      taskTitle: 'Reset password lewat magic link email',
      testerId: qc1TesterId,
      testedAt: new Date('2026-06-12T10:45:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'Token kadaluarsa tidak menampilkan pesan error yang ramah user',
      attemptNumber: 1,
      createdAt: new Date('2026-06-12T10:45:00Z'),
    },
    {
      sid: 'SDG-2026-017',
      taskTitle: 'Reset password lewat magic link email',
      testerId: defaultTesterId,
      testedAt: new Date('2026-06-15T11:15:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: 'Pesan error ditampilkan dengan tombol kirim ulang link aktivasi baru',
      attemptNumber: 2,
      createdAt: new Date('2026-06-15T11:15:00Z'),
    },
    {
      sid: 'SDG-2026-018',
      taskTitle: 'Penerapan rate limiting login (Max 5 attempt / 15 menit)',
      testerId: defaultTesterId,
      testedAt: new Date('2026-06-25T13:40:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: 'Akun otomatis terkunci selama 15 menit setelah 5 kali gagal',
      attemptNumber: 1,
      createdAt: new Date('2026-06-25T13:40:00Z'),
    },

    // === JULI 2026 ===
    {
      sid: 'SDG-2026-019',
      taskTitle: 'Dark mode antarmuka pengguna & sync local storage',
      testerId: qc1TesterId,
      testedAt: new Date('2026-07-07T08:30:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Tema gelap responsif dan tidak ada flicker saat reload halaman',
      attemptNumber: 1,
      createdAt: new Date('2026-07-07T08:30:00Z'),
    },
    {
      sid: 'SDG-2026-020',
      taskTitle: 'Integrasi Virtual Account BCA & Mandiri Open API',
      testerId: defaultTesterId,
      testedAt: new Date('2026-07-14T14:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'Signature HMAC SHA256 mismatch pada response staging',
      attemptNumber: 1,
      createdAt: new Date('2026-07-14T14:00:00Z'),
    },
    {
      sid: 'SDG-2026-020',
      taskTitle: 'Integrasi Virtual Account BCA & Mandiri Open API',
      testerId: defaultTesterId,
      testedAt: new Date('2026-07-17T09:30:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Secret key diperbarui sesuai sandbox perbankan dan signature valid',
      attemptNumber: 2,
      createdAt: new Date('2026-07-17T09:30:00Z'),
    },
    {
      sid: 'SDG-2026-021',
      taskTitle: 'Fitur cetak struk bluetooth thermal printer 58mm/80mm',
      testerId: defaultTesterId,
      testedAt: new Date('2026-07-28T16:10:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: 'Format ESC/POS rapi di ukuran kertas 58mm dan 80mm',
      attemptNumber: 1,
      createdAt: new Date('2026-07-28T16:10:00Z'),
    },

    // === AGUSTUS 2026 ===
    {
      sid: 'SDG-2026-022',
      taskTitle: 'Modul absensi karyawan dengan geolokasi GPS & selfie',
      testerId: defaultTesterId,
      testedAt: new Date('2026-08-05T09:15:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Radius toleransi GPS 50 meter terverifikasi akurat',
      attemptNumber: 1,
      createdAt: new Date('2026-08-05T09:15:00Z'),
    },
    {
      sid: 'SDG-2026-023',
      taskTitle: 'Validasi split bill pembayaran kasir POS',
      testerId: qc1TesterId,
      testedAt: new Date('2026-08-13T11:20:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'Jumlah total pecahan nominal tidak valid saat pembagian desimal ganjil',
      attemptNumber: 1,
      createdAt: new Date('2026-08-13T11:20:00Z'),
    },
    {
      sid: 'SDG-2026-023',
      taskTitle: 'Validasi split bill pembayaran kasir POS',
      testerId: defaultTesterId,
      testedAt: new Date('2026-08-15T15:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Rounding math diperbaiki ke satuan rupiah terdekat, total balance pas',
      attemptNumber: 2,
      createdAt: new Date('2026-08-15T15:00:00Z'),
    },
    {
      sid: 'SDG-2026-024',
      taskTitle: 'Audit log aktivitas admin dan perubahan hak akses',
      testerId: defaultTesterId,
      testedAt: new Date('2026-08-26T14:30:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: null,
      attemptNumber: 1,
      createdAt: new Date('2026-08-26T14:30:00Z'),
    },

    // === SEPTEMBER 2026 ===
    {
      sid: 'SDG-2026-025',
      taskTitle: 'Fitur filter kalender dan range tanggal riwayat',
      testerId: defaultTesterId,
      testedAt: new Date('2026-09-03T09:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Filter range tanggal dari dan s/d berjalan sempurna',
      attemptNumber: 1,
      createdAt: new Date('2026-09-03T09:00:00Z'),
    },
    {
      sid: 'SDG-2026-026',
      taskTitle: 'Integrasi chatbot customer service AI via WhatsApp Cloud API',
      testerId: qc1TesterId,
      testedAt: new Date('2026-09-10T10:45:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'Timeout webhook saat pesan masuk bersamaan > 50 req/sec',
      attemptNumber: 1,
      createdAt: new Date('2026-09-10T10:45:00Z'),
    },
    {
      sid: 'SDG-2026-026',
      taskTitle: 'Integrasi chatbot customer service AI via WhatsApp Cloud API',
      testerId: defaultTesterId,
      testedAt: new Date('2026-09-12T14:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'Queue Redis overflow, retry worker gagal memproses antrean pesan',
      attemptNumber: 2,
      createdAt: new Date('2026-09-12T14:00:00Z'),
    },
    {
      sid: 'SDG-2026-026',
      taskTitle: 'Integrasi chatbot customer service AI via WhatsApp Cloud API',
      testerId: defaultTesterId,
      testedAt: new Date('2026-09-15T11:30:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: 'Worker scale-out ke 4 instance, latency turun ke 45ms stabil',
      attemptNumber: 3,
      createdAt: new Date('2026-09-15T11:30:00Z'),
    },
    {
      sid: 'SDG-2026-027',
      taskTitle: 'Pencatatan mutasi kas masuk dan keluar otomatis',
      testerId: defaultTesterId,
      testedAt: new Date('2026-09-21T13:15:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: null,
      attemptNumber: 1,
      createdAt: new Date('2026-09-21T13:15:00Z'),
    },
    {
      sid: 'SDG-2026-028',
      taskTitle: 'Export laporan rekapitulasi pajak SPT PPh 21',
      testerId: qc1TesterId,
      testedAt: new Date('2026-09-28T16:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Format CSV SPT masa PPh 21 sesuai format e-Filing DJP',
      attemptNumber: 1,
      createdAt: new Date('2026-09-28T16:00:00Z'),
    },

    // === OKTOBER 2026 ===
    {
      sid: 'SDG-2026-029',
      taskTitle: 'Verifikasi email domain custom SPF & DKIM record',
      testerId: defaultTesterId,
      testedAt: new Date('2026-10-06T08:30:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Lookup DNS resolver otomatis mendeteksi konfigurasi valid',
      attemptNumber: 1,
      createdAt: new Date('2026-10-06T08:30:00Z'),
    },
    {
      sid: 'SDG-2026-030',
      taskTitle: 'Import massal master produk via file CSV/Excel',
      testerId: qc1TesterId,
      testedAt: new Date('2026-10-13T10:15:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'Header baris pertama tidak terdeteksi jika mengandung karakter spasi ganda',
      attemptNumber: 1,
      createdAt: new Date('2026-10-13T10:15:00Z'),
    },
    {
      sid: 'SDG-2026-030',
      taskTitle: 'Import massal master produk via file CSV/Excel',
      testerId: defaultTesterId,
      testedAt: new Date('2026-10-16T14:40:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: 'Pembersihan spasi dan trim header kolom sebelum mapping berhasil',
      attemptNumber: 2,
      createdAt: new Date('2026-10-16T14:40:00Z'),
    },
    {
      sid: 'SDG-2026-031',
      taskTitle: 'Widget ringkasan KPI performa sales real-time',
      testerId: defaultTesterId,
      testedAt: new Date('2026-10-27T15:50:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: null,
      attemptNumber: 1,
      createdAt: new Date('2026-10-27T15:50:00Z'),
    },

    // === NOVEMBER 2026 ===
    {
      sid: 'SDG-2026-032',
      taskTitle: 'Optimasi query dashboard & caching redis',
      testerId: defaultTesterId,
      testedAt: new Date('2026-11-04T09:20:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Response time endpoint dashboard turun dari 850ms menjadi 60ms',
      attemptNumber: 1,
      createdAt: new Date('2026-11-04T09:20:00Z'),
    },
    {
      sid: 'SDG-2026-033',
      taskTitle: 'Integrasi payment gateway e-wallet ShopeePay & GoPay',
      testerId: qc1TesterId,
      testedAt: new Date('2026-11-09T11:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'Callback URL signature tidak lolos validasi IP whitelist di staging',
      attemptNumber: 1,
      createdAt: new Date('2026-11-09T11:00:00Z'),
    },
    {
      sid: 'SDG-2026-033',
      taskTitle: 'Integrasi payment gateway e-wallet ShopeePay & GoPay',
      testerId: defaultTesterId,
      testedAt: new Date('2026-11-12T13:30:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'IP CIDR payment gateway telah ditambahkan ke security group dan lolos tes',
      attemptNumber: 2,
      createdAt: new Date('2026-11-12T13:30:00Z'),
    },
    {
      sid: 'SDG-2026-034',
      taskTitle: 'Penyesuaian UI & responsive navigation drawer di mobile',
      testerId: defaultTesterId,
      testedAt: new Date('2026-11-19T10:00:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: 'Tampilan rapi dan nyaman digunakan pada resolusi layar mobile (<640px)',
      attemptNumber: 1,
      createdAt: new Date('2026-11-19T10:00:00Z'),
    },
    {
      sid: 'SDG-2026-035',
      taskTitle: 'Export Excel riwayat testing dinamis sesuai filter status & env',
      testerId: defaultTesterId,
      testedAt: new Date('2026-11-23T14:15:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: 'Export Excel otomatis menerapkan filter yang sedang aktif dengan judul file informatif',
      attemptNumber: 1,
      createdAt: new Date('2026-11-23T14:15:00Z'),
    },
  ];

  console.log(`Starting insertion of ${dummyData.length} records for 2026 (Jan–Nov)...`);

  for (const item of dummyData) {
    await prisma.testResult.create({
      data: item,
    });
  }

  console.log('Successfully inserted all 2026 dummy test records!');

  const all2026 = await prisma.testResult.findMany({
    where: {
      testedAt: {
        gte: new Date('2026-01-01T00:00:00Z'),
        lt: new Date('2026-12-01T00:00:00Z'),
      },
    },
    select: {
      testedAt: true,
      environment: true,
      status: true,
    },
  });

  const monthCount: Record<number, number> = {};
  for (const r of all2026) {
    const m = r.testedAt.getMonth() + 1; // 1 to 12
    monthCount[m] = (monthCount[m] || 0) + 1;
  }

  console.log('Record count per month in 2026:');
  for (let m = 1; m <= 11; m++) {
    console.log(`Month ${m}: ${monthCount[m] || 0} records`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
