import { PrismaClient, Role, Environment, TestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Clean up login attempts and any non-seed users
  await prisma.loginAttempt.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: {
        notIn: ['tester@qc.local', 'pm@qc.local'],
      },
    },
  });

  // 2. Ensure Seed Users are in their exact original state
  const tester = await prisma.user.upsert({
    where: { email: 'tester@qc.local' },
    update: {
      name: 'QC Web',
      role: Role.QC_WEB,
      isActive: true,
      passwordHash,
    },
    create: {
      name: 'QC Web',
      email: 'tester@qc.local',
      passwordHash,
      role: Role.QC_WEB,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'pm@qc.local' },
    update: {
      name: 'Product Manager',
      role: Role.PRODUCT_MANAGER,
      isActive: true,
      passwordHash,
    },
    create: {
      name: 'Product Manager',
      email: 'pm@qc.local',
      passwordHash,
      role: Role.PRODUCT_MANAGER,
      isActive: true,
    },
  });

  // 3. Seed TestResults (dummy data matching the current UI)
  const testResultsData = [
    {
      sid: 'SID-2024-001',
      taskTitle: 'Login flow — validasi email kosong',
      testerId: tester.id,
      testedAt: new Date('2024-12-10T09:00:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: null,
      attemptNumber: 1,
      createdAt: new Date('2024-12-10T09:00:00Z'),
    },
    {
      sid: 'SID-2024-002',
      taskTitle: 'Upload dokumen PDF > 5MB',
      testerId: tester.id,
      testedAt: new Date('2024-12-10T10:30:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'Error 500, file tidak tersimpan di storage',
      attemptNumber: 1,
      createdAt: new Date('2024-12-10T10:30:00Z'),
    },
    {
      sid: 'SID-2024-002',
      taskTitle: 'Upload dokumen PDF > 5MB',
      testerId: tester.id,
      testedAt: new Date('2024-12-11T08:15:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: 'Bug fixed, upload berhasil setelah patch',
      attemptNumber: 2,
      createdAt: new Date('2024-12-11T08:15:00Z'),
    },
    {
      sid: 'SID-2024-003',
      taskTitle: 'Filter laporan per tanggal',
      testerId: tester.id,
      testedAt: new Date('2024-12-11T14:00:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: null,
      attemptNumber: 1,
      createdAt: new Date('2024-12-11T14:00:00Z'),
    },
    {
      sid: 'SID-2024-004',
      taskTitle: 'Notifikasi email setelah approval',
      testerId: tester.id,
      testedAt: new Date('2024-12-12T11:00:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.FAIL,
      note: 'Email tidak terkirim, SMTP timeout',
      attemptNumber: 1,
      createdAt: new Date('2024-12-12T11:00:00Z'),
    },
    {
      sid: 'SID-2024-004',
      taskTitle: 'Notifikasi email setelah approval',
      testerId: tester.id,
      testedAt: new Date('2024-12-13T09:00:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.FAIL,
      note: 'Masih timeout, konfigurasi SMTP belum diperbaiki oleh tim infra',
      attemptNumber: 2,
      createdAt: new Date('2024-12-13T09:00:00Z'),
    },
    {
      sid: 'SID-2024-004',
      taskTitle: 'Notifikasi email setelah approval',
      testerId: tester.id,
      testedAt: new Date('2024-12-14T10:00:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: 'SMTP sudah diperbaiki, email terkirim dalam 2 detik',
      attemptNumber: 3,
      createdAt: new Date('2024-12-14T10:00:00Z'),
    },
    {
      sid: 'SID-2024-005',
      taskTitle: 'Export CSV laporan bulanan',
      testerId: tester.id,
      testedAt: new Date('2024-12-13T13:30:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.PASS,
      note: null,
      attemptNumber: 1,
      createdAt: new Date('2024-12-13T13:30:00Z'),
    },
    {
      sid: 'SID-2024-006',
      taskTitle: 'Pagination tabel daftar user',
      testerId: tester.id,
      testedAt: new Date('2024-12-14T11:45:00Z'),
      environment: Environment.DEMO,
      status: TestStatus.FAIL,
      note: 'Halaman ke-3 menampilkan data duplikat dari halaman ke-1',
      attemptNumber: 1,
      createdAt: new Date('2024-12-14T11:45:00Z'),
    },
    {
      sid: 'SID-2024-007',
      taskTitle: 'Hak akses role Viewer tidak bisa edit',
      testerId: tester.id,
      testedAt: new Date('2024-12-15T08:00:00Z'),
      environment: Environment.PRODUCTION,
      status: TestStatus.PASS,
      note: null,
      attemptNumber: 1,
      createdAt: new Date('2024-12-15T08:00:00Z'),
    },
  ];

  const count = await prisma.testResult.count();
  if (count === 0) {
    for (const item of testResultsData) {
      await prisma.testResult.create({
        data: item,
      });
    }
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
