import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isOneOf, ALL_ROLES } from '@/lib/access';
import { parseDateISO, formatDateISO } from '@/lib/format';
import { StatCard } from '@/app/components/StatCard';
import { Badge } from '@/app/components/Badge';
import { DashboardFilterBar } from './FilterBar';
import type { Environment, TestStatus, Role } from '@/app/types';
import { Prisma } from '@prisma/client';

interface DashboardPageProps {
  searchParams: Promise<{ env?: string; from?: string; to?: string; qc?: string }>;
}

interface UnresolvedItem {
  sid: string;
  title: string;
  tester: string;
  date: string;
  notes?: string;
}

function EnvironmentCard({
  envName,
  data,
  accentBadge,
}: {
  envName: 'Demo' | 'Production';
  data: { total: number; pass: number; fail: number; pct: number };
  accentBadge: { dot: string; text: string; bg: string };
}) {
  return (
    <div className="bg-surface border border-border rounded-[10px] p-5 lg:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${accentBadge.dot}`} />
            <h2 className="text-[14px] font-semibold text-text">Breakdown Environment: {envName}</h2>
          </div>
          <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-[6px] ${accentBadge.bg} ${accentBadge.text}`}>
            {data.total} total
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-[8px] bg-surface-hover/70 border border-border mb-4 text-center">
          <div>
            <p className="text-[11px] text-text-muted font-medium">Pass</p>
            <p className="text-[17px] font-bold text-pass-fg tabular-nums leading-tight mt-0.5">{data.pass}</p>
          </div>
          <div className="border-x border-border">
            <p className="text-[11px] text-text-muted font-medium">Fail</p>
            <p className="text-[17px] font-bold text-fail-fg tabular-nums leading-tight mt-0.5">{data.fail}</p>
          </div>
          <div>
            <p className="text-[11px] text-text-muted font-medium">Keberhasilan</p>
            <p className="text-[17px] font-bold text-text tabular-nums leading-tight mt-0.5">{data.pct}%</p>
          </div>
        </div>

        <div className="h-2.5 bg-surface-hover rounded-full overflow-hidden flex border border-border">
          {data.total > 0 && (
            <>
              <div
                className="h-full bg-pass-fg transition-all duration-150"
                style={{ width: `${(data.pass / data.total) * 100}%` }}
              />
              <div
                className="h-full bg-fail-fg transition-all duration-150"
                style={{ width: `${(data.fail / data.total) * 100}%` }}
              />
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 pt-2 text-[11px] text-text-muted border-t border-border/50">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pass-fg" /> {data.pass} Pass
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-fail-fg" /> {data.fail} Fail
        </span>
        <span className="ml-auto tabular-nums font-medium">
          {data.total > 0 ? `${data.pct}% pass rate` : 'Belum ada data'}
        </span>
      </div>
    </div>
  );
}

function TesterCard({
  testerRows,
  maxTesterTotal,
  envLabel,
}: {
  testerRows: Array<{ name: string; total: number; pass: number; fail: number; pct: number }>;
  maxTesterTotal: number;
  envLabel?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-[10px] p-5 lg:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-semibold text-text">
          Breakdown per Tester {envLabel ? `(${envLabel})` : ''}
        </h2>
        <span className="text-[12px] text-text-muted tabular-nums font-medium">
          {testerRows.length} tester
        </span>
      </div>
      {testerRows.length === 0 ? (
        <p className="text-[13px] text-text-muted py-2 font-normal">Belum ada data testing dari tester.</p>
      ) : (
        <div className="space-y-4">
          {testerRows.map((t) => (
            <div key={t.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[14px] font-medium text-text">{t.name}</span>
                <span className="text-[12px] text-text-muted tabular-nums">
                  {t.total} testing &middot; {t.pct}% pass
                </span>
              </div>
              <div className="w-full bg-surface-hover h-2.5 rounded-full overflow-hidden border border-border flex">
                <div className="h-full flex" style={{ width: `${(t.total / maxTesterTotal) * 100}%` }}>
                  <div
                    className="bg-pass-fg h-full transition-all duration-150"
                    style={{ width: `${t.total > 0 ? (t.pass / t.total) * 100 : 0}%` }}
                  />
                  <div
                    className="bg-fail-fg h-full transition-all duration-150"
                    style={{ width: `${t.total > 0 ? (t.fail / t.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getSession();
  if (!session || !isOneOf(session.role, ALL_ROLES)) {
    redirect('/403');
  }

  const isPM = session.role === 'PRODUCT_MANAGER';
  const sp = await searchParams;
  const qcParam = (sp.qc || '').trim().toLowerCase();

  let targetRole: Role | null = null;
  if (isPM) {
    if (qcParam === 'web') targetRole = 'QC_WEB';
    else if (qcParam === 'mobile') targetRole = 'QC_MOBILE';
    else if (qcParam === 'api') targetRole = 'QC_API';
  } else {
    // Role QC Web, QC Mobile, QC API terkunci hanya melihat divisi masing-masing
    targetRole = session.role as Role;
  }

  const env: 'DEMO' | 'PRODUCTION' | null =
    sp.env?.toUpperCase() === 'DEMO'
      ? 'DEMO'
      : sp.env?.toUpperCase() === 'PRODUCTION'
        ? 'PRODUCTION'
        : null;
  const from = sp.from ? parseDateISO(sp.from) : null;
  const to = sp.to ? parseDateISO(sp.to) : null;
  const toExclusive = to
    ? new Date(new Date(to).setDate(to.getDate() + 1))
    : null;

  const where: Prisma.TestResultWhereInput = {};
  if (targetRole) {
    where.tester = { role: targetRole };
  }
  if (env) where.environment = env;
  if (from || toExclusive) {
    where.testedAt = {};
    if (from) where.testedAt.gte = from;
    if (toExclusive) where.testedAt.lt = toExclusive;
  }

  const conditions: Prisma.Sql[] = [Prisma.sql`TRUE`];
  if (targetRole) conditions.push(Prisma.sql`u.role = ${targetRole}::"Role"`);
  if (env) conditions.push(Prisma.sql`t.environment = ${env}::"Environment"`);
  if (from) conditions.push(Prisma.sql`t."testedAt" >= ${from}`);
  if (toExclusive) conditions.push(Prisma.sql`t."testedAt" < ${toExclusive}`);
  const whereSql = Prisma.join(conditions, ' AND ');

  let total: number;
  let pass: number;
  let envRows: Array<{ env: Environment; total: number; pass: number; fail: number; pct: number }>;
  let testerRows: Array<{ name: string; total: number; pass: number; fail: number; pct: number }>;
  let unresolved: UnresolvedItem[];

  try {
    const [totalCount, passCount, envGroups, testerGroups, unresolvedRaw, testers] = await Promise.all([
      prisma.testResult.count({ where }),
      prisma.testResult.count({ where: { AND: [where, { status: 'PASS' }] } }),
      prisma.testResult.groupBy({ by: ['environment', 'status'], where, _count: { _all: true } }),
      prisma.testResult.groupBy({ by: ['testerId', 'status'], where, _count: { _all: true } }),
      prisma.$queryRaw<Array<{
        sid: string;
        taskTitle: string;
        status: TestStatus;
        note: string | null;
        testedAt: Date;
        testerName: string;
      }>>(
        Prisma.sql`
          SELECT DISTINCT ON (t.sid)
            t.sid, t."taskTitle", t.status, t.note, t."testedAt" AS "testedAt", u.name AS "testerName"
          FROM "TestResult" t
          JOIN "User" u ON u.id = t."testerId"
          WHERE ${whereSql}
          ORDER BY t.sid, t."createdAt" DESC
        `
      ),
      prisma.user.findMany({ select: { id: true, name: true } }),
    ]);

    total = totalCount;
    pass = passCount;

    const envNames: Environment[] = ['Demo', 'Production'];
    envRows = envNames.map((name) => {
      const dbEnv = name === 'Demo' ? 'DEMO' : 'PRODUCTION';
      const envTotal = envGroups
        .filter((g) => g.environment === dbEnv)
        .reduce((sum, g) => sum + g._count._all, 0);
      const envPass = envGroups
        .filter((g) => g.environment === dbEnv && g.status === 'PASS')
        .reduce((sum, g) => sum + g._count._all, 0);
      return {
        env: name,
        total: envTotal,
        pass: envPass,
        fail: envTotal - envPass,
        pct: envTotal > 0 ? Math.round((envPass / envTotal) * 100) : 0,
      };
    });

    const testerNameById = new Map(testers.map((u) => [u.id, u.name]));
    const testerMap = new Map<string, { total: number; pass: number }>();
    for (const g of testerGroups) {
      const cur = testerMap.get(g.testerId) ?? { total: 0, pass: 0 };
      cur.total += g._count._all;
      if (g.status === 'PASS') cur.pass += g._count._all;
      testerMap.set(g.testerId, cur);
    }
    testerRows = Array.from(testerMap.entries())
      .map(([testerId, data]) => ({
        name: testerNameById.get(testerId) ?? '(Tester dihapus)',
        ...data,
        fail: data.total - data.pass,
        pct: data.total > 0 ? Math.round((data.pass / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    unresolved = unresolvedRaw
      .filter((r) => r.status === 'FAIL')
      .map((r) => ({
        sid: r.sid,
        title: r.taskTitle,
        tester: r.testerName,
        date: formatDateISO(r.testedAt),
        notes: r.note ?? undefined,
      }));
  } catch {
    return (
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-text tracking-[-0.02em] leading-tight mb-2">
            Dashboard Rekap
          </h1>
          <p className="text-[14px] text-text-muted font-normal">
            Ringkasan hasil testing. Setiap entri dihitung terpisah, termasuk retest.
          </p>
        </div>
        <div className="border border-border rounded-[10px] bg-surface px-4 sm:px-6 py-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[14px] text-fail-fg font-medium">
            Gagal memuat data dashboard dari database.
          </p>
          <p className="text-[13px] text-text-muted mt-2">
            Periksa koneksi database, lalu{' '}
            <a href="/dashboard" className="text-accent font-semibold hover:underline">
              coba lagi
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  let qcTitle = 'Dashboard Rekap';
  let qcSubtitle = 'Ringkasan hasil testing seluruh divisi QC. Setiap entri dihitung terpisah, termasuk retest.';
  if (targetRole === 'QC_WEB') {
    qcTitle = 'Dashboard — QC Web 🌐';
    qcSubtitle = 'Ringkasan performa dan hasil pengujian khusus divisi Web.';
  } else if (targetRole === 'QC_MOBILE') {
    qcTitle = 'Dashboard — QC Mobile 📱';
    qcSubtitle = 'Ringkasan performa dan hasil pengujian khusus divisi Mobile App.';
  } else if (targetRole === 'QC_API') {
    qcTitle = 'Dashboard — QC API ⚡';
    qcSubtitle = 'Ringkasan performa dan hasil pengujian khusus divisi Backend & API.';
  }

  const fail = total - pass;
  const pct = total > 0 ? Math.round((pass / total) * 100) : 0;
  const hasActiveFilter = Boolean(qcParam || env || from || to);
  const maxTesterTotal = Math.max(...testerRows.map((t) => t.total), 1);

  const demoRow = envRows.find((r) => r.env === 'Demo') ?? {
    env: 'Demo' as const,
    total: 0,
    pass: 0,
    fail: 0,
    pct: 0,
  };
  const prodRow = envRows.find((r) => r.env === 'Production') ?? {
    env: 'Production' as const,
    total: 0,
    pass: 0,
    fail: 0,
    pct: 0,
  };

  const envParam = env === 'DEMO' ? 'demo' : env === 'PRODUCTION' ? 'production' : '';
  const fromParam = from ? formatDateISO(from) : '';
  const toParam = to ? formatDateISO(to) : '';

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-text tracking-[-0.02em] leading-tight mb-2">
          {qcTitle}
        </h1>
        <p className="text-[14px] text-text-muted font-normal">
          {qcSubtitle}
        </p>
      </div>

      <DashboardFilterBar
        key={`${isPM ? qcParam : 'isolated'}-${fromParam}-${toParam}-${envParam}`}
        qc={isPM ? qcParam : ''}
        env={envParam}
        from={fromParam}
        to={toParam}
        hasActiveFilter={hasActiveFilter}
        isPM={isPM}
      />

      {total === 0 ? (
        <div className="border border-border rounded-[10px] bg-surface px-4 sm:px-6 py-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[14px] text-text-muted">
            {hasActiveFilter
              ? 'Tidak ada data testing yang cocok dengan filter saat ini. Coba perluas rentang tanggal atau pilih environment lain.'
              : 'Belum ada data testing. Mulai dari menu Input Testing untuk melihat rekap di sini.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-[10px] overflow-hidden border border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] mb-6">
            <StatCard
              label="Total Testing"
              value={total}
              sub={hasActiveFilter ? `${total} entri (terfilter)` : `${total} entri`}
              variant="default"
            />
            <StatCard
              label="Total Pass"
              value={pass}
              sub={`${pct}% dari total`}
              variant="pass"
            />
            <StatCard
              label="Total Fail"
              value={fail}
              sub={total > 0 ? `${Math.round((fail / total) * 100)}% dari total` : undefined}
              variant="fail"
            />
            <StatCard
              label="Keberhasilan"
              value={`${pct}%`}
              sub={`${pass} pass dari ${total} testing`}
              variant="accent"
            />
          </div>
          <p className="text-[12px] text-text-muted mb-6 font-normal">
            Persentase keberhasilan = entri PASS &divide; total entri &times; 100%. Setiap entri, termasuk retest, dihitung terpisah.
          </p>

          {/* Breakdown Environment & Tester */}
          {!env ? (
            /* Jika filter "Semua": Masukkan keduanya (Demo & Production) ke dalam 1 kartu Breakdown per Environment, berdampingan dengan Tester */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-surface border border-border rounded-[10px] p-5 lg:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[14px] font-semibold text-text">Breakdown per Environment</h2>
                  <span className="text-[12px] text-text-muted tabular-nums font-medium">
                    {total} total testing
                  </span>
                </div>
                <div className="space-y-4">
                  {[demoRow, prodRow].map((row) => {
                    const isDemo = row.env === 'Demo';
                    const dotColor = isDemo ? 'bg-blue-500' : 'bg-emerald-500';
                    return (
                      <div key={row.env} className="p-3.5 rounded-[8px] bg-surface-hover/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                            <span className="text-[14px] font-semibold text-text">{row.env}</span>
                          </div>
                          <span className="text-[12px] text-text-muted tabular-nums font-medium">
                            {row.pass} pass, {row.fail} fail &mdash; {row.pct}%
                          </span>
                        </div>

                        <div className="h-2.5 bg-surface-hover rounded-full overflow-hidden flex border border-border">
                          {row.total > 0 && (
                            <>
                              <div
                                className="h-full bg-pass-fg transition-all duration-150"
                                style={{ width: `${(row.pass / row.total) * 100}%` }}
                              />
                              <div
                                className="h-full bg-fail-fg transition-all duration-150"
                                style={{ width: `${(row.fail / row.total) * 100}%` }}
                              />
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-text-muted">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-pass-fg" /> Pass ({row.pass})
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-fail-fg" /> Fail ({row.fail})
                          </span>
                          <span className="ml-auto tabular-nums font-medium">
                            {row.total > 0 ? `${row.pct}% pass rate` : 'Belum ada data'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <TesterCard testerRows={testerRows} maxTesterTotal={maxTesterTotal} />
            </div>
          ) : (
            /* Jika difilter per Environment: Tampilkan hanya environment tersebut (Demo sendiri atau Production sendiri) berdampingan dengan Tester */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {env === 'DEMO' && (
                <EnvironmentCard
                  envName="Demo"
                  data={demoRow}
                  accentBadge={{ dot: 'bg-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/10' }}
                />
              )}
              {env === 'PRODUCTION' && (
                <EnvironmentCard
                  envName="Production"
                  data={prodRow}
                  accentBadge={{ dot: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10' }}
                />
              )}
              <TesterCard
                testerRows={testerRows}
                maxTesterTotal={maxTesterTotal}
                envLabel={env === 'DEMO' ? 'Demo' : 'Production'}
              />
            </div>
          )}

          <div className="bg-surface border border-border rounded-[10px] p-5 lg:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold text-text">
                  SDG Belum Resolved
                </h2>
                <p className="text-[12px] text-text-muted mt-0.5 font-normal">
                  SDG dengan status testing terakhir masih FAIL dan belum ada retest PASS
                </p>
              </div>
              {unresolved.length > 0 && (
                <span className="text-[12px] text-fail-fg font-semibold bg-[var(--fail-bg)] px-2.5 py-1 rounded-[6px] border border-[var(--fail-fg)]/20">
                  {unresolved.length} perlu tindak lanjut
                </span>
              )}
            </div>
            {unresolved.length === 0 ? (
              <p className="text-[14px] text-text-muted py-3 font-normal">
                Semua SDG yang pernah FAIL sudah memiliki retest PASS. Tidak ada isu terbuka yang perlu ditindaklanjuti.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {unresolved.map((item) => (
                  <div key={item.sid} className="py-3.5 first:pt-0 last:pb-0 hover:bg-surface-hover rounded-[8px] px-2 -mx-2 transition-colors duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[13px] font-semibold text-text">{item.sid}</span>
                          <Badge status="FAIL" size="sm" />
                        </div>
                        <p className="text-[14px] font-medium text-text break-words whitespace-normal leading-snug">{item.title}</p>
                        {item.notes && (
                          <p className="text-[12px] text-text-muted mt-1 break-words whitespace-normal leading-relaxed">{item.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start shrink-0 text-left sm:text-right pt-1.5 sm:pt-0 border-t border-border/40 sm:border-t-0 text-[12px]">
                        <p className="font-semibold text-text">{item.tester}</p>
                        <p className="text-text-muted tabular-nums sm:mt-0.5">{item.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
