'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DashboardFilterBarProps {
  qc: string;
  env: string;
  from: string;
  to: string;
  hasActiveFilter: boolean;
  isPM?: boolean;
}

const QC_OPTIONS = [
  { value: '', label: 'Semua QC', icon: '📊' },
  { value: 'web', label: 'QC Web', icon: '🌐' },
  { value: 'mobile', label: 'QC Mobile', icon: '📱' },
  { value: 'api', label: 'QC API', icon: '⚡' },
] as const;

const ENV_OPTIONS = [
  { value: '', label: 'Semua Env' },
  { value: 'demo', label: 'Demo' },
  { value: 'production', label: 'Production' },
] as const;

const INPUT_CLASS =
  'w-full rounded-[8px] border border-border bg-surface px-3 py-2 sm:px-3.5 sm:py-2.5 text-[14px] font-normal text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-focus-ring/10 transition-colors duration-150 h-[44px]';

export function DashboardFilterBar({ qc, env, from, to, hasActiveFilter, isPM = false }: DashboardFilterBarProps) {
  const router = useRouter();
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);

  function pushParams(next: { qc?: string; env?: string; from?: string; to?: string }) {
    const params = new URLSearchParams();
    const nextQc = next.qc !== undefined ? next.qc : qc;
    const nextEnv = next.env !== undefined ? next.env : env;
    const nextFrom = next.from !== undefined ? next.from : fromValue;
    const nextTo = next.to !== undefined ? next.to : toValue;
    if (isPM && nextQc) params.set('qc', nextQc);
    if (nextEnv) params.set('env', nextEnv);
    if (nextFrom) params.set('from', nextFrom);
    if (nextTo) params.set('to', nextTo);
    const qs = params.toString();
    router.push(`/dashboard${qs ? `?${qs}` : ''}`);
  }

  function reset() {
    setFromValue('');
    setToValue('');
    router.push('/dashboard');
  }

  return (
    <div className="space-y-4 mb-6">
      {/* 1. Tab Pemisah Divisi QC: Hanya untuk Product Manager */}
      {isPM && (
        <div className="space-y-1.5">
          <span className="block text-[13px] font-semibold text-label">Pilih Divisi QC</span>
          <div className="flex items-center gap-1.5 p-1 rounded-[10px] border border-border bg-surface overflow-x-auto scrollbar-none">
            {QC_OPTIONS.map((option) => {
              const isActive = (qc === '' && option.value === '') || qc === option.value;
              return (
                <button
                  key={option.value || 'all'}
                  type="button"
                  onClick={() => pushParams({ qc: option.value })}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 h-[40px] text-[13px] sm:text-[14px] font-semibold rounded-[8px] transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover'
                  }`}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Filter Environment & Range Tanggal */}
      <div className="space-y-4 lg:space-y-0 lg:flex lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="space-y-1.5 w-full lg:max-w-[320px]">
          <span className="block text-[13px] font-semibold text-label">Environment</span>
          <div className="flex rounded-[8px] border border-border overflow-hidden w-full">
            {ENV_OPTIONS.map((option) => (
              <button
                key={option.value || 'all'}
                type="button"
                onClick={() => pushParams({ env: option.value })}
                className={`flex-1 h-[44px] text-[13px] sm:text-[14px] font-semibold transition-colors duration-150 cursor-pointer ${
                  env === option.value
                    ? 'bg-accent text-white'
                    : 'bg-surface text-text-muted hover:text-text hover:bg-surface-hover'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
          <div className="space-y-1.5">
            <label htmlFor="df" className="block text-[12px] sm:text-[13px] font-semibold text-label">
              Dari tanggal
            </label>
            <input
              id="df"
              type="date"
              value={fromValue}
              onChange={(e) => {
                setFromValue(e.target.value);
                pushParams({ from: e.target.value });
              }}
              className={INPUT_CLASS}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="dt" className="block text-[12px] sm:text-[13px] font-semibold text-label">
              Sampai tanggal
            </label>
            <input
              id="dt"
              type="date"
              value={toValue}
              onChange={(e) => {
                setToValue(e.target.value);
                pushParams({ to: e.target.value });
              }}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={reset}
            className="w-full lg:w-auto h-[44px] px-4 text-[13px] sm:text-[14px] font-semibold text-text-muted hover:text-text hover:bg-surface-hover rounded-[8px] border border-border transition-colors duration-150 whitespace-nowrap cursor-pointer"
          >
            Reset filter
          </button>
        )}
      </div>
    </div>
  );
}
