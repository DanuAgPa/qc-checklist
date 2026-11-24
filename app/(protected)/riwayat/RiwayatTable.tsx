'use client';

import { Fragment, useState, useCallback, useEffect, useRef } from 'react';
import { Badge } from '@/app/components/Badge';
import * as XLSX from 'xlsx';
import type { TestResultRow } from '@/app/types';

function attemptLabel(attemptNumber: number): string {
  return attemptNumber === 1 ? 'Test awal' : `Retest ke-${attemptNumber - 1}`;
}

/* Deteksi apakah teks benar-benar terpotong (scrollHeight > clientHeight). */
function useIsTruncated(ref: React.RefObject<HTMLSpanElement | null>): boolean {
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setTruncated(el.scrollHeight > el.clientHeight);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return truncated;
}

function TruncatedNote({
  notes,
  entryId,
  expandedIds,
  setExpandedIds,
}: {
  notes: string;
  entryId: string;
  expandedIds: Set<string>;
  setExpandedIds: (ids: Set<string>) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isTruncated = useIsTruncated(ref);
  const isExpanded = expandedIds.has(entryId);

  const toggle = () => {
    const next = new Set(expandedIds);
    if (isExpanded) {
      next.delete(entryId);
    } else {
      next.add(entryId);
    }
    setExpandedIds(next);
  };

  if (!notes) return null;

  return (
    <div className="space-y-1.5">
      <span
        ref={ref}
        className={`block text-[13px] text-text-muted break-words whitespace-normal leading-relaxed ${
          isExpanded ? '' : 'line-clamp-2'
        }`}
      >
        {notes}
      </span>
      {(isTruncated || notes.length > 50) && (
        <button
          type="button"
          onClick={toggle}
          className="text-[12px] font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          aria-expanded={isExpanded}
          aria-controls={`detail-${entryId}`}
        >
          {isExpanded ? 'Tutup' : 'Selengkapnya'}
        </button>
      )}
    </div>
  );
}

export function RiwayatTable({
  rows,
  searchQuery,
  envFilter,
  statusFilter,
  dateFilter,
}: {
  rows: TestResultRow[];
  searchQuery: string;
  envFilter?: string;
  statusFilter?: string;
  dateFilter?: { from?: string; to?: string; month?: string };
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (rows.length === 0) {
    const envLabel =
      envFilter === 'demo'
        ? 'Demo'
        : envFilter === 'production' || envFilter === 'prod'
        ? 'Production'
        : '';

    const statusLabel = statusFilter ? statusFilter.toUpperCase() : '';

    const activeFilters: string[] = [];
    if (searchQuery) activeFilters.push(`SDG "${searchQuery}"`);
    if (envLabel) activeFilters.push(`Environment ${envLabel}`);
    if (statusLabel) activeFilters.push(`Status ${statusLabel}`);
    if (dateFilter?.from && dateFilter?.to) {
      activeFilters.push(`Periode ${dateFilter.from} s/d ${dateFilter.to}`);
    } else if (dateFilter?.from) {
      activeFilters.push(`Mulai ${dateFilter.from}`);
    } else if (dateFilter?.to) {
      activeFilters.push(`Hingga ${dateFilter.to}`);
    } else if (dateFilter?.month) {
      activeFilters.push(`Bulan ${dateFilter.month}`);
    }

    return (
      <div className="border border-border rounded-[10px] bg-surface px-4 sm:px-6 py-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {activeFilters.length > 0 ? (
          <p className="text-[14px] text-text-muted">
            Tidak ada hasil testing untuk{' '}
            <span className="font-semibold text-text">{activeFilters.join(', ')}</span>.
            Coba periksa kembali filter atau{' '}
            <a href="/riwayat" className="text-accent font-semibold hover:underline">
              hapus filter
            </a>{' '}
            untuk melihat semua data.
          </p>
        ) : (
          <p className="text-[14px] text-text-muted">
            Belum ada hasil testing. Mulai dari menu{' '}
            <a href="/input" className="text-accent font-semibold hover:underline">
              Input Testing
            </a>
            .
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="lg:hidden">
        <div className="space-y-3">
          {rows.map((entry) => {
            const hasNotes = !!entry.notes;
            return (
              <div
                key={entry.id}
                className="border border-border rounded-[10px] overflow-hidden bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-mono text-text text-[13px] font-bold break-all">
                        {entry.sid}
                      </span>
                      <span className="w-fit h-[20px] px-[6px] py-[1px] rounded-[4px] bg-surface-hover text-text-muted text-[11px] font-medium inline-flex items-center whitespace-nowrap">
                        {attemptLabel(entry.attemptNumber)}
                      </span>
                    </div>
                    <Badge status={entry.status} size="sm" />
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[14px] font-medium text-text break-words whitespace-normal leading-snug mb-2.5">
                    {entry.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[12px] text-text-muted mb-2.5">
                    <span className="tabular-nums">{entry.tester}</span>
                    <span className="tabular-nums">{entry.date}</span>
                    <span className={`text-[12px] font-semibold ${
                      entry.environment === 'Production' ? 'text-text' : 'text-text-muted'
                    }`}>
                      {entry.environment}
                    </span>
                  </div>
                  {hasNotes && (
                    <TruncatedNote
                      notes={entry.notes ?? ''}
                      entryId={entry.id}
                      expandedIds={expandedIds}
                      setExpandedIds={setExpandedIds}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="border border-border rounded-[10px] overflow-hidden bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto w-full">
            <table className="min-w-[950px] w-full text-[14px] text-left">
              <colgroup>
                <col className="w-[170px]" />
                <col className="w-auto min-w-[200px]" />
                <col className="w-[100px]" />
                <col className="w-[110px]" />
                <col className="w-[100px]" />
                <col className="w-[90px]" />
                <col className="w-[280px]" />
              </colgroup>
              <thead>
                <tr className="bg-surface-hover border-b border-border sticky top-0 z-10">
                  <th className="px-3.5 py-3 font-semibold text-text-muted text-[11px] uppercase tracking-wider">SDG</th>
                  <th className="px-3.5 py-3 font-semibold text-text-muted text-[11px] uppercase tracking-wider">Judul Task</th>
                  <th className="px-3.5 py-3 font-semibold text-text-muted text-[11px] uppercase tracking-wider">Tester</th>
                  <th className="px-3.5 py-3 font-semibold text-text-muted text-[11px] uppercase tracking-wider">Tanggal</th>
                  <th className="px-3.5 py-3 font-semibold text-text-muted text-[11px] uppercase tracking-wider">Env</th>
                  <th className="px-3.5 py-3 font-semibold text-text-muted text-[11px] uppercase tracking-wider">Status</th>
                  <th className="px-3.5 py-3 font-semibold text-text-muted text-[11px] uppercase tracking-wider">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => {
                  const hasNotes = !!entry.notes;
                  return (
                    <Fragment key={entry.id}>
                      <tr
                        key={`row-${entry.id}`}
                        className={`border-b border-border min-h-[56px] transition-colors duration-150 ${
                          expandedIds.has(entry.id) ? 'bg-surface-hover/60' : 'hover:bg-surface-hover/50'
                        }`}
                      >
                        <td className="px-3.5 py-3 align-top">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="font-mono text-text text-[13px] font-bold break-all leading-tight">
                              {entry.sid}
                            </span>
                            <span className="px-[6px] py-[1px] rounded-[4px] bg-surface-hover text-text-muted text-[11px] font-medium inline-flex items-center whitespace-nowrap">
                              {attemptLabel(entry.attemptNumber)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 align-top text-text font-normal break-words whitespace-normal leading-snug">
                          {entry.title}
                        </td>
                        <td className="px-3.5 py-3 align-top text-text-muted font-normal tabular-nums">{entry.tester}</td>
                        <td className="px-3.5 py-3 align-top text-text-muted tabular-nums font-normal">{entry.date}</td>
                        <td className="px-3.5 py-3 align-top">
                          <span className={`text-[12px] font-semibold ${
                            entry.environment === 'Production' ? 'text-text' : 'text-text-muted'
                          }`}>
                            {entry.environment}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 align-top">
                          <Badge status={entry.status ?? 'PASS'} size="sm" />
                        </td>
                        <td className="px-3.5 py-3 align-top text-text-muted">
                          {hasNotes ? (
                            <TruncatedNote
                              notes={entry.notes ?? ''}
                              entryId={entry.id}
                              expandedIds={expandedIds}
                              setExpandedIds={setExpandedIds}
                            />
                          ) : (
                            <span className="text-text-muted/40">&mdash;</span>
                          )}
                        </td>
                      </tr>
                      {expandedIds.has(entry.id) && hasNotes && (
                        <tr key={`detail-${entry.id}`}>
                          <td colSpan={7} className="px-4 py-3 bg-surface-hover/80 border-b border-border">
                            <p className="text-[12px] font-semibold text-text-muted mb-1">Catatan lengkap:</p>
                            <p className="text-[13px] leading-relaxed max-w-[80ch] text-text break-words whitespace-pre-wrap">{entry.notes}</p>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-surface-hover border-t border-border px-3.5 py-2.5 text-[12px] text-text-muted font-normal">
            Riwayat bersifat append-only &mdash; entri tidak dapat diubah atau dihapus.
          </div>
        </div>
      </div>
    </>
  );
}

export function ExportButton({
  rows,
  envFilter,
  statusFilter,
  dateFilter,
}: {
  rows: TestResultRow[];
  envFilter?: string;
  statusFilter?: string;
  dateFilter?: { from?: string; to?: string; month?: string };
}) {
  const handleExport = useCallback(() => {
    if (rows.length === 0) return;

    const data = rows.map((entry) => ({
      SDG: `${entry.sid} (${attemptLabel(entry.attemptNumber)})`,
      'Judul Task': entry.title,
      Tester: entry.tester,
      Tanggal: entry.date,
      Environment: entry.environment,
      Status: entry.status,
      'Attempt': entry.attemptNumber,
      'Catatan QC': entry.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    const parts: string[] = [];
    if (envFilter) {
      parts.push(envFilter.toUpperCase());
    }
    if (statusFilter) {
      parts.push(statusFilter.toUpperCase());
    }
    if (dateFilter?.month) {
      parts.push(dateFilter.month);
    } else if (dateFilter?.from && dateFilter?.to) {
      parts.push(`${dateFilter.from}_sd_${dateFilter.to}`);
    } else if (dateFilter?.from) {
      parts.push(`sejak_${dateFilter.from}`);
    } else if (dateFilter?.to) {
      parts.push(`hingga_${dateFilter.to}`);
    }
    const sheetTitle = parts.length > 0 ? `Riwayat (${parts.join(' - ')})` : 'Riwayat Testing';

    XLSX.utils.book_append_sheet(wb, ws, sheetTitle);

    const colWidths = Object.keys(data[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...data.map((r) => String(r[key as keyof (typeof data)[number]]).length)
      ) + 2,
    }));
    ws['!cols'] = colWidths;

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let envSuffix = '';
    if (envFilter === 'demo') envSuffix = '-demo';
    else if (envFilter === 'production' || envFilter === 'prod') envSuffix = '-production';

    let statusSuffix = '';
    if (statusFilter?.toLowerCase() === 'pass') statusSuffix = '-pass';
    else if (statusFilter?.toLowerCase() === 'fail') statusSuffix = '-fail';

    let dateSuffix = '';
    if (dateFilter?.month) {
      dateSuffix = `-${dateFilter.month}`;
    } else if (dateFilter?.from && dateFilter?.to) {
      dateSuffix = `-${dateFilter.from}_sd_${dateFilter.to}`;
    } else if (dateFilter?.from) {
      dateSuffix = `-sejak_${dateFilter.from}`;
    } else if (dateFilter?.to) {
      dateSuffix = `-hingga_${dateFilter.to}`;
    }

    XLSX.writeFile(wb, `riwayat-testing${envSuffix}${statusSuffix}${dateSuffix}-${dateStr}.xlsx`);
  }, [rows, envFilter, statusFilter, dateFilter]);

  const activeLabels: string[] = [];
  if (envFilter === 'demo') activeLabels.push('Demo');
  else if (envFilter === 'production' || envFilter === 'prod') activeLabels.push('Production');
  if (statusFilter) activeLabels.push(statusFilter.toUpperCase());
  if (dateFilter?.month) activeLabels.push(`Bulan: ${dateFilter.month}`);
  else if (dateFilter?.from && dateFilter?.to) activeLabels.push(`${dateFilter.from} s/d ${dateFilter.to}`);
  else if (dateFilter?.from) activeLabels.push(`Sejak ${dateFilter.from}`);
  else if (dateFilter?.to) activeLabels.push(`Hingga ${dateFilter.to}`);

  const filterTooltip = activeLabels.length > 0 ? ` (${activeLabels.join(', ')})` : '';

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={rows.length === 0}
      title={
        rows.length === 0
          ? 'Tidak ada data untuk diekspor'
          : `Ekspor ${rows.length} hasil testing${filterTooltip} ke file Excel`
      }
      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-[44px] px-4 text-[13px] sm:text-[14px] font-semibold rounded-[8px] border border-border bg-surface text-text hover:bg-surface-hover hover:border-accent/30 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap"
    >
      <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export Excel
    </button>
  );
}
