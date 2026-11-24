import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { isOneOf, ALL_ROLES } from '@/lib/access';
import { prisma } from '@/lib/db';
import { formatDateISO, parseDateISO } from '@/lib/format';
import { RiwayatTable } from './RiwayatTable';
import { RiwayatFilterBar } from './RiwayatFilterBar';
import type { TestResultRow, Role } from '@/app/types';
import { Prisma } from '@prisma/client';

const PAGE_SIZE = 10;

interface RiwayatPageProps {
  searchParams: Promise<{
    sid?: string;
    sdg?: string;
    page?: string;
    qc?: string;
    env?: string;
    status?: string;
    from?: string;
    to?: string;
    month?: string;
  }>;
}

function getPaginationItems(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export default async function RiwayatPage({ searchParams }: RiwayatPageProps) {
  const session = await getSession();
  if (!session || !isOneOf(session.role, ALL_ROLES)) {
    redirect('/login');
  }

  const isPM = session.role === 'PRODUCT_MANAGER';
  const sp = await searchParams;
  const sidQuery = (sp.sid || sp.sdg || '').trim();
  const qcParam = (sp.qc || '').trim().toLowerCase();
  const envParam = (sp.env || '').trim().toLowerCase();
  const statusParam = (sp.status || '').trim().toLowerCase();
  const fromParam = (sp.from || '').trim();
  const toParam = (sp.to || '').trim();
  const monthParam = (sp.month || '').trim();
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);

  let qcRole: Role | null = null;
  if (isPM) {
    if (qcParam === 'web') qcRole = 'QC_WEB';
    else if (qcParam === 'mobile') qcRole = 'QC_MOBILE';
    else if (qcParam === 'api') qcRole = 'QC_API';
  } else {
    // Non-PM terkunci hanya dapat melihat hasil testing divisinya sendiri
    qcRole = session.role as Role;
  }

  const where: Prisma.TestResultWhereInput = {};

  if (qcRole) {
    where.tester = { role: qcRole };
  }

  if (sidQuery) {
    where.sid = { contains: sidQuery, mode: 'insensitive' };
  }

  if (envParam === 'demo') {
    where.environment = 'DEMO';
  } else if (envParam === 'production' || envParam === 'prod') {
    where.environment = 'PRODUCTION';
  }

  if (statusParam === 'pass') {
    where.status = 'PASS';
  } else if (statusParam === 'fail') {
    where.status = 'FAIL';
  }

  let fromDate: Date | null = null;
  let toExclusiveDate: Date | null = null;

  if (fromParam) {
    fromDate = parseDateISO(fromParam);
  }
  if (toParam) {
    const toDate = parseDateISO(toParam);
    if (toDate) {
      toExclusiveDate = new Date(new Date(toDate).setDate(toDate.getDate() + 1));
    }
  }

  // Fallback jika monthParam terisi tanpa from/to
  if (!fromDate && !toExclusiveDate && monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [year, month] = monthParam.split('-').map(Number);
    fromDate = new Date(year, month - 1, 1);
    toExclusiveDate = new Date(year, month, 1);
  }

  if (fromDate || toExclusiveDate) {
    where.testedAt = {};
    if (fromDate) where.testedAt.gte = fromDate;
    if (toExclusiveDate) where.testedAt.lt = toExclusiveDate;
  }

  let total: number;
  let rows: TestResultRow[];
  let exportRows: TestResultRow[];

  try {
    const [count, results, allResults] = await prisma.$transaction([
      prisma.testResult.count({ where }),
      prisma.testResult.findMany({
        where,
        orderBy: [{ testedAt: 'desc' }, { createdAt: 'desc' }],
        include: { tester: { select: { name: true } } },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.testResult.findMany({
        where,
        orderBy: [{ testedAt: 'desc' }, { createdAt: 'desc' }],
        include: { tester: { select: { name: true } } },
      }),
    ]);

    total = count;
    const serialize = (
      items: Array<typeof results[number]>
    ): TestResultRow[] =>
      items.map((r) => ({
        id: r.id,
        sid: r.sid,
        title: r.taskTitle,
        tester: r.tester.name,
        date: formatDateISO(r.testedAt),
        environment: r.environment === 'PRODUCTION' ? ('Production' as const) : ('Demo' as const),
        status: r.status,
        notes: r.note ?? undefined,
        attemptNumber: r.attemptNumber,
      }));

    rows = serialize(results);
    exportRows = serialize(allResults);
  } catch {
    return (
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-text tracking-[-0.02em] leading-tight mb-2">
            Riwayat Testing
          </h1>
          <p className="text-[14px] text-text-muted font-normal">
            Seluruh catatan hasil testing, diurutkan dari yang terbaru.
          </p>
        </div>
        <div className="border border-border rounded-[10px] bg-surface px-4 sm:px-6 py-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[14px] text-fail-fg font-medium">
            Gagal memuat data riwayat dari database.
          </p>
          <p className="text-[13px] text-text-muted mt-2">
            Periksa koneksi database, lalu{' '}
            <a href="/riwayat" className="text-accent font-semibold hover:underline">
              coba lagi
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  function buildPageUrl(targetPage: number): string {
    const params = new URLSearchParams();
    if (sidQuery) params.set('sid', sidQuery);
    if (isPM && qcParam) params.set('qc', qcParam);
    if (envParam) params.set('env', envParam);
    if (statusParam) params.set('status', statusParam);
    if (fromParam) params.set('from', fromParam);
    if (toParam) params.set('to', toParam);
    if (monthParam) params.set('month', monthParam);
    if (targetPage > 1) params.set('page', String(targetPage));
    const qs = params.toString();
    return `/riwayat${qs ? `?${qs}` : ''}`;
  }

  const firstRow = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastRow = Math.min(currentPage * PAGE_SIZE, total);

  const envLabel =
    envParam === 'demo'
      ? 'Demo'
      : envParam === 'production' || envParam === 'prod'
      ? 'Production'
      : '';

  const statusLabel = statusParam ? statusParam.toUpperCase() : '';

  const activeFilterBadges: string[] = [];
  if (isPM) {
    if (qcParam === 'web') activeFilterBadges.push('Divisi: QC Web');
    else if (qcParam === 'mobile') activeFilterBadges.push('Divisi: QC Mobile');
    else if (qcParam === 'api') activeFilterBadges.push('Divisi: QC API');
  } else {
    if (session.role === 'QC_WEB') activeFilterBadges.push('Divisi: QC Web');
    else if (session.role === 'QC_MOBILE') activeFilterBadges.push('Divisi: QC Mobile');
    else if (session.role === 'QC_API') activeFilterBadges.push('Divisi: QC API');
  }
  if (envLabel) activeFilterBadges.push(`Env: ${envLabel}`);
  if (statusLabel) activeFilterBadges.push(`Status: ${statusLabel}`);
  if (fromParam && toParam) activeFilterBadges.push(`Periode: ${fromParam} s/d ${toParam}`);
  else if (fromParam) activeFilterBadges.push(`Mulai: ${fromParam}`);
  else if (toParam) activeFilterBadges.push(`Hingga: ${toParam}`);
  else if (monthParam) activeFilterBadges.push(`Bulan: ${monthParam}`);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-text tracking-[-0.02em] leading-tight mb-2">
          Riwayat Testing
        </h1>
        <p className="text-[14px] text-text-muted font-normal">
          Seluruh catatan hasil testing, diurutkan dari yang terbaru.
        </p>
      </div>

      {/* Filter Bar: Pencarian SDG, 3 Dropdown (Divisi QC, Environment & Status), Filter Kalender, Reset & Export */}
      <RiwayatFilterBar
        currentSid={sidQuery}
        currentQc={isPM ? qcParam : ''}
        currentEnv={envParam}
        currentStatus={statusParam}
        currentFrom={fromParam}
        currentTo={toParam}
        exportRows={exportRows}
        isPM={isPM}
      />

      {/* Tabel Hasil Testing */}
      <RiwayatTable
        rows={rows}
        searchQuery={sidQuery}
        envFilter={envParam}
        statusFilter={statusParam}
        dateFilter={{ from: fromParam, to: toParam, month: monthParam }}
      />

      {rows.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-text-muted font-normal tabular-nums text-center sm:text-left">
            Menampilkan {firstRow}&ndash;{lastRow} dari {total} hasil
            {activeFilterBadges.length > 0 ? ` [${activeFilterBadges.join(' | ')}]` : ''}
            {sidQuery ? ` untuk \u201c${sidQuery}\u201d` : ''}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-[6px] flex-wrap justify-center sm:justify-end">
              {/* Previous Button */}
              {currentPage > 1 ? (
                <a
                  href={buildPageUrl(currentPage - 1)}
                  className="h-[36px] px-[14px] text-[14px] font-medium rounded-[6px] border border-border bg-surface text-accent hover:bg-surface-hover hover:border-accent transition-colors flex items-center justify-center cursor-pointer select-none"
                >
                  Previous
                </a>
              ) : (
                <span className="h-[36px] px-[14px] text-[14px] font-medium rounded-[6px] border border-border/50 bg-surface/40 text-text-muted/40 cursor-not-allowed flex items-center justify-center select-none">
                  Previous
                </span>
              )}

              {/* Numbered Page Buttons & Ellipsis */}
              {getPaginationItems(currentPage, totalPages).map((item, idx) => {
                if (typeof item === 'string') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="min-w-[36px] h-[36px] px-[8px] rounded-[6px] border border-border bg-surface/60 text-text-muted text-[14px] font-normal flex items-center justify-center cursor-default select-none"
                    >
                      ...
                    </span>
                  );
                }

                const isCurrent = item === currentPage;
                if (isCurrent) {
                  return (
                    <span
                      key={item}
                      className="min-w-[36px] h-[36px] px-[10px] rounded-[6px] bg-accent border border-accent text-white font-semibold text-[14px] flex items-center justify-center select-none shadow-xs"
                    >
                      {item}
                    </span>
                  );
                }

                return (
                  <a
                    key={item}
                    href={buildPageUrl(item)}
                    className="min-w-[36px] h-[36px] px-[10px] rounded-[6px] bg-surface border border-border hover:border-accent text-accent hover:bg-surface-hover font-medium text-[14px] flex items-center justify-center transition-colors cursor-pointer select-none"
                  >
                    {item}
                  </a>
                );
              })}

              {/* Next Button */}
              {currentPage < totalPages ? (
                <a
                  href={buildPageUrl(currentPage + 1)}
                  className="h-[36px] px-[14px] text-[14px] font-medium rounded-[6px] border border-border bg-surface text-accent hover:bg-surface-hover hover:border-accent transition-colors flex items-center justify-center cursor-pointer select-none"
                >
                  Next
                </a>
              ) : (
                <span className="h-[36px] px-[14px] text-[14px] font-medium rounded-[6px] border border-border/50 bg-surface/40 text-text-muted/40 cursor-not-allowed flex items-center justify-center select-none">
                  Next
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
