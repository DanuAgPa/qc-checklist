'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ExportButton } from './RiwayatTable';
import type { TestResultRow } from '@/app/types';

interface RiwayatFilterBarProps {
  currentSid: string;
  currentQc: string;
  currentEnv: string;
  currentStatus: string;
  currentFrom: string;
  currentTo: string;
  exportRows: TestResultRow[];
  isPM?: boolean;
}

export function RiwayatFilterBar({
  currentSid,
  currentQc,
  currentEnv,
  currentStatus,
  currentFrom,
  currentTo,
  exportRows,
  isPM = false,
}: RiwayatFilterBarProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(currentSid);
  const [fromValue, setFromValue] = useState(currentFrom);
  const [toValue, setToValue] = useState(currentTo);

  function pushParams(next: {
    sid?: string;
    qc?: string;
    env?: string;
    status?: string;
    from?: string;
    to?: string;
  }) {
    const params = new URLSearchParams();
    const nextSid = next.sid !== undefined ? next.sid.trim() : currentSid;
    const nextQc = next.qc !== undefined ? next.qc.trim() : (currentQc || '');
    const nextEnv = next.env !== undefined ? next.env.trim() : currentEnv;
    const nextStatus = next.status !== undefined ? next.status.trim() : currentStatus;
    const nextFrom = next.from !== undefined ? next.from.trim() : fromValue;
    const nextTo = next.to !== undefined ? next.to.trim() : toValue;

    if (nextSid) params.set('sid', nextSid);
    if (isPM && nextQc) params.set('qc', nextQc);
    if (nextEnv) params.set('env', nextEnv);
    if (nextStatus) params.set('status', nextStatus);
    if (nextFrom) params.set('from', nextFrom);
    if (nextTo) params.set('to', nextTo);

    const qs = params.toString();
    router.push(`/riwayat${qs ? `?${qs}` : ''}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ sid: searchValue });
  }

  function handleFromChange(val: string) {
    setFromValue(val);
    pushParams({ from: val });
  }

  function handleToChange(val: string) {
    setToValue(val);
    pushParams({ to: val });
  }

  function resetAll() {
    setSearchValue('');
    setFromValue('');
    setToValue('');
    router.push('/riwayat');
  }

  const hasActiveDate = Boolean(fromValue || toValue);
  const hasActiveFilter = Boolean(currentSid || currentQc || currentEnv || currentStatus || hasActiveDate);

  return (
    <div className="space-y-3 mb-6">
      {/* Baris 1: Pencarian SDG, Filter Dropdown (Divisi QC, Environment, Status), Reset & Export */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Sisi Kiri: Search Input & 3 Filter Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 flex-wrap">
          {/* Form Pencarian SDG */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] sm:max-w-[240px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Cari berdasarkan SDG..."
              className="w-full pl-9 pr-3.5 text-[14px] rounded-[8px] border border-border bg-surface text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-focus-ring/10 transition-colors duration-150 font-mono h-[44px]"
            />
          </form>

          {/* Filter Dropdown 1: Divisi QC (Hanya ditampilkan untuk Product Manager) */}
          {isPM && (
            <div className="relative flex-1 sm:flex-initial sm:w-[170px]">
              <select
                value={currentQc || ''}
                onChange={(e) => pushParams({ qc: e.target.value })}
                className="w-full h-[44px] appearance-none rounded-[8px] border border-border bg-surface text-text pl-3.5 pr-9 text-[14px] font-medium focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-focus-ring/10 transition-colors duration-150 cursor-pointer"
                title="Filter Divisi QC"
              >
                <option value="" className="bg-surface text-text">Semua Divisi QC</option>
                <option value="web" className="bg-surface text-text">🌐 QC Web</option>
                <option value="mobile" className="bg-surface text-text">📱 QC Mobile</option>
                <option value="api" className="bg-surface text-text">⚡ QC API</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          {/* Filter Dropdown 2: Environment (Semua, Demo, Production) */}
          <div className="relative flex-1 sm:flex-initial sm:w-[165px]">
            <select
              value={currentEnv}
              onChange={(e) => pushParams({ env: e.target.value })}
              className="w-full h-[44px] appearance-none rounded-[8px] border border-border bg-surface text-text pl-3.5 pr-9 text-[14px] font-medium focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-focus-ring/10 transition-colors duration-150 cursor-pointer"
              title="Filter Environment"
            >
              <option value="" className="bg-surface text-text">Semua Environment</option>
              <option value="demo" className="bg-surface text-text">Demo</option>
              <option value="production" className="bg-surface text-text">Production</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Filter Dropdown 3: Status (Semua, PASS, FAIL) */}
          <div className="relative flex-1 sm:flex-initial sm:w-[145px]">
            <select
              value={currentStatus}
              onChange={(e) => pushParams({ status: e.target.value })}
              className="w-full h-[44px] appearance-none rounded-[8px] border border-border bg-surface text-text pl-3.5 pr-9 text-[14px] font-medium focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-focus-ring/10 transition-colors duration-150 cursor-pointer"
              title="Filter Status Hasil"
            >
              <option value="" className="bg-surface text-text">Semua Status</option>
              <option value="pass" className="bg-surface text-text">PASS</option>
              <option value="fail" className="bg-surface text-text">FAIL</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sisi Kanan: Reset Filter & Export Button */}
        <div className="flex items-center gap-2.5 sm:self-end xl:self-auto shrink-0">
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetAll}
              className="h-[44px] px-3.5 text-[13px] sm:text-[14px] font-semibold text-text-muted hover:text-text transition-colors duration-150 rounded-[8px] border border-border bg-surface hover:bg-surface-hover flex items-center justify-center whitespace-nowrap cursor-pointer"
            >
              Reset Filter
            </button>
          )}

          <ExportButton
            rows={exportRows}
            envFilter={currentEnv}
            statusFilter={currentStatus}
            dateFilter={{ from: currentFrom, to: currentTo }}
          />
        </div>
      </div>

      {/* Baris 2: Filter Kalender Rentang Tanggal (Dari & s/d) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-[8px] border border-border bg-surface/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 shrink-0 text-text-muted">
          <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[12px] sm:text-[13px] font-semibold text-text whitespace-nowrap">
            Filter Kalender:
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <span className="absolute -top-2 left-2 px-1 text-[10px] font-semibold text-text-muted bg-surface rounded">
              Dari
            </span>
            <input
              type="date"
              value={fromValue}
              onChange={(e) => handleFromChange(e.target.value)}
              className="w-full h-[38px] px-2.5 text-[12px] sm:text-[13px] rounded-[6px] border border-border bg-surface text-text font-mono focus:outline-none focus:border-accent focus:ring-[2px] focus:ring-focus-ring/10 transition-colors"
              title="Tanggal Awal"
            />
          </div>

          <span className="text-[12px] text-text-muted shrink-0 font-medium">s/d</span>

          <div className="relative flex-1">
            <span className="absolute -top-2 left-2 px-1 text-[10px] font-semibold text-text-muted bg-surface rounded">
              Sampai
            </span>
            <input
              type="date"
              value={toValue}
              onChange={(e) => handleToChange(e.target.value)}
              className="w-full h-[38px] px-2.5 text-[12px] sm:text-[13px] rounded-[6px] border border-border bg-surface text-text font-mono focus:outline-none focus:border-accent focus:ring-[2px] focus:ring-focus-ring/10 transition-colors"
              title="Tanggal Akhir"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
