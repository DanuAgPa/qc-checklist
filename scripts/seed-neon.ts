import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Neon database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create or update users
  const pm = await prisma.user.upsert({
    where: { email: 'pm@qc.local' },
    update: { role: 'PRODUCT_MANAGER', passwordHash },
    create: {
      email: 'pm@qc.local',
      name: 'Product Manager',
      passwordHash,
      role: 'PRODUCT_MANAGER',
    },
  });

  const qcWeb = await prisma.user.upsert({
    where: { email: 'qcweb@qc.local' },
    update: { role: 'QC_WEB', passwordHash },
    create: {
      email: 'qcweb@qc.local',
      name: 'QC Web',
      passwordHash,
      role: 'QC_WEB',
    },
  });

  const qcMobile = await prisma.user.upsert({
    where: { email: 'qcmobile@qc.local' },
    update: { role: 'QC_MOBILE', passwordHash },
    create: {
      email: 'qcmobile@qc.local',
      name: 'QC Mobile',
      passwordHash,
      role: 'QC_MOBILE',
    },
  });

  const qcApi = await prisma.user.upsert({
    where: { email: 'qcapi@qc.local' },
    update: { role: 'QC_API', passwordHash },
    create: {
      email: 'qcapi@qc.local',
      name: 'QC API',
      passwordHash,
      role: 'QC_API',
    },
  });

  const tester = await prisma.user.upsert({
    where: { email: 'tester@qc.local' },
    update: { role: 'QC_WEB', passwordHash },
    create: {
      email: 'tester@qc.local',
      name: 'Tester',
      passwordHash,
      role: 'QC_WEB',
    },
  });

  console.log('Users created successfully:');
  console.log('- pm@qc.local (PRODUCT_MANAGER)');
  console.log('- qcweb@qc.local (QC_WEB)');
  console.log('- qcmobile@qc.local (QC_MOBILE)');
  console.log('- qcapi@qc.local (QC_API)');
  console.log('- tester@qc.local (QC_WEB)');

  // Clear existing test results in Neon before populating
  await prisma.testResult.deleteMany();

  // 2. 14 Dummy Records for QC Web
  const webData = [
    { sid: 'SDG-001', taskTitle: 'Implementasi Form Login & Validasi Email RFC-5322', environment: 'DEMO' as const, status: 'PASS' as const, date: '2026-01-10T09:00:00Z', note: 'Validasi regex email bekerja sesuai spesifikasi' },
    { sid: 'SDG-002', taskTitle: 'Responsive Navbar Drawer di Resolusi Tablet (< 768px)', environment: 'DEMO' as const, status: 'FAIL' as const, date: '2026-01-25T14:30:00Z', note: 'Drawer menu tertutup overlay backdrop saat scrolling' },
    { sid: 'SDG-002', taskTitle: 'Responsive Navbar Drawer di Resolusi Tablet (< 768px)', environment: 'DEMO' as const, status: 'PASS' as const, date: '2026-01-28T11:00:00Z', note: 'Retest fix z-index overlay dan scroll lock berhasil' },
    { sid: 'SDG-003', taskTitle: 'Ekspor Data Tabel Riwayat ke Format Spreadsheet Excel (.xlsx)', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-02-15T10:15:00Z', note: 'Ekspor 5000 baris terekspor dalam 1.2 detik tanpa freeze UI' },
    { sid: 'SDG-004', taskTitle: 'Dark Mode Switcher & Persistent LocalStorage Theme', environment: 'DEMO' as const, status: 'PASS' as const, date: '2026-03-12T16:00:00Z', note: 'Flicker transisi tema berhasil diatasi dengan inline script tag' },
    { sid: 'SDG-005', taskTitle: 'Filter Date Range Kalender Picker di Laporan Keuangan', environment: 'DEMO' as const, status: 'FAIL' as const, date: '2026-04-18T13:45:00Z', note: 'Timezone offset menyebabkan tanggal terpilih mundur 1 hari' },
    { sid: 'SDG-005', taskTitle: 'Filter Date Range Kalender Picker di Laporan Keuangan', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-04-22T09:30:00Z', note: 'Retest ISO UTC parsing fix tervalidasi di client & server' },
    { sid: 'SDG-006', taskTitle: 'Infinite Scroll Pagination pada Halaman Katalog Produk', environment: 'DEMO' as const, status: 'PASS' as const, date: '2026-05-20T11:20:00Z', note: 'Intersection Observer bekerja lancar tanpa re-render berulang' },
    { sid: 'SDG-007', taskTitle: 'Integrasi WYSIWYG Editor untuk Artikel Blog Publik', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-06-14T15:00:00Z', note: 'Sanitasi HTML XSS bekerja aman' },
    { sid: 'SDG-008', taskTitle: 'Multi-step Form Registrasi Vendor Rekanan', environment: 'DEMO' as const, status: 'FAIL' as const, date: '2026-07-19T10:00:00Z', note: 'State form hilang saat user klik tombol kembali di browser' },
    { sid: 'SDG-008', taskTitle: 'Multi-step Form Registrasi Vendor Rekanan', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-07-25T14:10:00Z', note: 'Retest session storage sync form berhasil tervalidasi' },
    { sid: 'SDG-009', taskTitle: 'Breadcrumb Navigation Dynamic Route pada Portal Admin', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-08-16T09:40:00Z', note: 'Semua slug route terpetakan ke label breadcrumb' },
    { sid: 'SDG-010', taskTitle: 'Dashboard Chart Widget Analytics Web Vitals', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-09-22T13:15:00Z', note: 'Grafik rendering SVG lancar 60fps di Chrome dan Safari' },
    { sid: 'SDG-011', taskTitle: 'Upload attachment dokumen KYC drag-and-drop file uploader', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-11-20T10:00:00Z', note: 'Validasi mime-type dan batas ukuran 5MB bekerja dengan aman' },
  ];

  // 3. 14 Dummy Records for QC Mobile
  const mobileData = [
    { sid: 'SDG-001', taskTitle: 'Integrasi Biometric Fingerprint & Face ID Login di Android & iOS', environment: 'DEMO' as const, status: 'PASS' as const, date: '2026-01-12T10:00:00Z', note: 'Prompt otentikasi biometrik berhasil diverifikasi di Android 14 dan iOS 17' },
    { sid: 'SDG-002', taskTitle: 'Push Notification background handler via FCM saat layar terkunci', environment: 'DEMO' as const, status: 'FAIL' as const, date: '2026-02-14T15:20:00Z', note: 'Notifikasi tidak muncul jika battery optimization aktif di Samsung One UI' },
    { sid: 'SDG-002', taskTitle: 'Push Notification background handler via FCM saat layar terkunci', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-02-18T11:30:00Z', note: 'Retest high priority FCM payload berhasil bypass doze mode' },
    { sid: 'SDG-003', taskTitle: 'Offline Mode Caching SQLite & Sinkronisasi Data Transaksi', environment: 'DEMO' as const, status: 'PASS' as const, date: '2026-03-08T09:15:00Z', note: 'Data draft tersimpan di SQLite lokal dan auto-sync saat koneksi kembali' },
    { sid: 'SDG-004', taskTitle: 'Scan Barcode / QR Code Scanner menggunakan Kamera Ponsel', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-04-11T14:40:00Z', note: 'Deteksi kode QR di pencahayaan rendah sangat responsif (< 300ms)' },
    { sid: 'SDG-005', taskTitle: 'Fitur Kompresi Gambar Kamera sebelum Upload Bukti Struk', environment: 'DEMO' as const, status: 'FAIL' as const, date: '2026-05-16T16:00:00Z', note: 'Aplikasi crash Out-of-Memory saat proses kompresi gambar resolusi 48MP' },
    { sid: 'SDG-005', taskTitle: 'Fitur Kompresi Gambar Kamera sebelum Upload Bukti Struk', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-05-21T10:00:00Z', note: 'Retest bitmap downsampling berhasil menurunkan memori usage ke 12MB' },
    { sid: 'SDG-006', taskTitle: 'Deteksi Root / Jailbreak Security Guard saat Startup App', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-06-25T11:45:00Z', note: 'Magisk dan checkra1n terdeteksi akurat, aplikasi exit secara aman' },
    { sid: 'SDG-007', taskTitle: 'Deep Linking Scheme & Universal Links dari SMS Marketing', environment: 'DEMO' as const, status: 'PASS' as const, date: '2026-07-14T13:10:00Z', note: 'Klik link promo langsung membuka halaman checkout yang sesuai' },
    { sid: 'SDG-008', taskTitle: 'Pilihan Bahasa Aplikasi Multi-Language (ID / EN) Tanpa Restart', environment: 'DEMO' as const, status: 'FAIL' as const, date: '2026-08-19T09:30:00Z', note: 'Beberapa teks di dialog konfirmasi masih tersangkut di bahasa default' },
    { sid: 'SDG-008', taskTitle: 'Pilihan Bahasa Aplikasi Multi-Language (ID / EN) Tanpa Restart', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-08-24T15:20:00Z', note: 'Retest i18n context provider re-render tervalidasi menyeluruh' },
    { sid: 'SDG-009', taskTitle: 'GPS Geofencing Absensi Lapangan Karyawan Mobile', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-09-18T10:15:00Z', note: 'Radius toleransi 50 meter akurat diuji di 5 titik lokasi berbeda' },
    { sid: 'SDG-010', taskTitle: 'Splash screen cold-boot startup benchmark (< 1.5 detik)', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-10-21T16:00:00Z', note: 'Inisialisasi SDK dipindahkan ke background coroutine, cold boot turun drastis' },
    { sid: 'SDG-011', taskTitle: 'In-app update dialog (Google Play In-App Updates & iOS Force Update)', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-11-22T14:00:00Z', note: 'Dialog update fleksibel dan immediate teruji akurat di device fisik' },
  ];

  // 4. 14 Dummy Records for QC API
  const apiData = [
    { sid: 'SDG-001', taskTitle: 'Endpoint Auth JWT Token Generation & Refresh Token Rotation', environment: 'DEMO' as const, status: 'PASS' as const, date: '2026-01-15T11:00:00Z', note: 'Revocation list di Redis bekerja sempurna saat refresh token dipakai ulang' },
    { sid: 'SDG-002', taskTitle: 'Rate Limiting Redis Token Bucket pada Public Search API', environment: 'DEMO' as const, status: 'FAIL' as const, date: '2026-02-10T14:00:00Z', note: 'HTTP 429 Too Many Requests tidak menyertakan header Retry-After' },
    { sid: 'SDG-002', taskTitle: 'Rate Limiting Redis Token Bucket pada Public Search API', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-02-14T09:30:00Z', note: 'Retest header Retry-After dan X-RateLimit-Remaining tervalidasi' },
    { sid: 'SDG-003', taskTitle: 'Webhook Handler Notifikasi Pembayaran Payment Gateway (Xendit)', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-03-20T16:15:00Z', note: 'Verifikasi signature HMAC-SHA256 aman dari payload tampering' },
    { sid: 'SDG-004', taskTitle: 'Pagination Metadata Cursor-Based pada Endpoint /v1/transactions', environment: 'DEMO' as const, status: 'PASS' as const, date: '2026-04-05T10:20:00Z', note: 'Next cursor base64 terenkripsi dan response time konsisten 15ms' },
    { sid: 'SDG-005', taskTitle: 'Export Async Batch Job Endpoint Menggunakan Message Queue RabbitMQ', environment: 'DEMO' as const, status: 'FAIL' as const, date: '2026-05-18T13:40:00Z', note: 'Dead-letter queue gagal memproses payload berukuran > 10MB' },
    { sid: 'SDG-005', taskTitle: 'Export Async Batch Job Endpoint Menggunakan Message Queue RabbitMQ', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-05-23T11:00:00Z', note: 'Retest chunking message queue berhasil menyelesaikan 50.000 batch data' },
    { sid: 'SDG-006', taskTitle: 'Idempotency Key Middleware pada Endpoint Create Order POST /v1/orders', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-06-19T15:30:00Z', note: 'Double submit request mengembalikan response yang sama tanpa duplicate order' },
    { sid: 'SDG-007', taskTitle: 'GraphQL Query Complexity & Depth Limiting Security Guard', environment: 'DEMO' as const, status: 'PASS' as const, date: '2026-07-22T09:00:00Z', note: 'Nested query kedalaman > 5 tingkat otomatis ditolak dengan pesan error yang jelas' },
    { sid: 'SDG-008', taskTitle: 'Endpoint Integrasi Notifikasi SMS & WhatsApp OTP Provider Eksternal', environment: 'DEMO' as const, status: 'FAIL' as const, date: '2026-08-11T14:15:00Z', note: 'Timeout 504 Gateway saat vendor SMS mengalami degradasi jaringan' },
    { sid: 'SDG-008', taskTitle: 'Endpoint Integrasi Notifikasi SMS & WhatsApp OTP Provider Eksternal', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-08-16T10:45:00Z', note: 'Retest circuit breaker fallback ke SMS provider sekunder berjalan mulus' },
    { sid: 'SDG-009', taskTitle: 'Database Connection Pool Scaling under Load Test 10.000 RPM', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-09-30T13:00:00Z', note: 'PgBouncer connection pooler stabil di p99 latency 28ms' },
    { sid: 'SDG-010', taskTitle: 'Audit log & distributed tracing OpenTelemetry pada microservices', environment: 'DEMO' as const, status: 'FAIL' as const, date: '2026-10-25T11:20:00Z', note: 'Trace context W3C traceparent header hilang saat request melalui async queue' },
    { sid: 'SDG-010', taskTitle: 'Audit log & distributed tracing OpenTelemetry pada microservices', environment: 'PRODUCTION' as const, status: 'PASS' as const, date: '2026-10-28T16:00:00Z', note: 'Trace context propagator ditambahkan pada metadata producer/consumer, tracing tersambung' },
  ];

  async function insertEntries(items: typeof webData, testerId: string, division: 'QC_WEB' | 'QC_MOBILE' | 'QC_API') {
    const attemptCounts: Record<string, number> = {};
    for (const item of items) {
      const currentAttempt = (attemptCounts[item.sid] || 0) + 1;
      attemptCounts[item.sid] = currentAttempt;

      await prisma.testResult.create({
        data: {
          sid: item.sid,
          taskTitle: item.taskTitle,
          environment: item.environment,
          status: item.status,
          testedAt: new Date(item.date),
          note: item.note,
          attemptNumber: currentAttempt,
          testerId,
          division,
        },
      });
    }
  }

  console.log('Inserting QC Web test results...');
  await insertEntries(webData, qcWeb.id, 'QC_WEB');

  console.log('Inserting QC Mobile test results...');
  await insertEntries(mobileData, qcMobile.id, 'QC_MOBILE');

  console.log('Inserting QC API test results...');
  await insertEntries(apiData, qcApi.id, 'QC_API');

  const total = await prisma.testResult.count();
  console.log(`Neon Seeding Complete! Total records in cloud DB: ${total}`);
}

main()
  .catch((e) => {
    console.error('Error seeding Neon:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
