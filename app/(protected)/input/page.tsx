'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { saveTestResultAction } from './actions';
import { FormField } from '@/app/components/FormField';
import { Badge } from '@/app/components/Badge';
import { testResultSchema, zodFieldErrors } from '@/lib/validation';
import type { Environment, TestStatus, Role } from '@/app/types';

const QC_DIVISIONS = [
  { value: 'QC_WEB' as const, label: 'QC Web', icon: '🌐' },
  { value: 'QC_MOBILE' as const, label: 'QC Mobile', icon: '📱' },
  { value: 'QC_API' as const, label: 'QC API', icon: '⚡' },
] as const;

function getTodayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const INPUT_CLASS =
  'w-full rounded-[8px] border border-border bg-surface px-3.5 py-2.5 text-[14px] font-normal text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-focus-ring/10 transition-colors duration-150';

export default function InputPage() {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement | null>(null);

  const isPM = user?.role === 'PRODUCT_MANAGER';
  const [qcDivision, setQcDivision] = useState<'QC_WEB' | 'QC_MOBILE' | 'QC_API'>('QC_WEB');

  const [sid, setSid] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [environment, setEnvironment] = useState<Environment>('Demo');
  const [status, setStatus] = useState<TestStatus | null>(null);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retestModal, setRetestModal] = useState<string | null>(null);

  function validate(): Record<string, string> {
    const parsed = testResultSchema.safeParse({
      sid,
      title,
      date,
      environment,
      status,
      notes: notes.trim() || undefined,
      qcDivision: isPM ? qcDivision : undefined,
    });
    return parsed.success ? {} : zodFieldErrors(parsed.error);
  }

  async function submit(confirmRetest: boolean) {
    const errs = confirmRetest ? {} : validate();
    setErrors(errs);
    if (!confirmRetest && Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await saveTestResultAction({
        sid,
        title,
        date,
        environment,
        status,
        notes: notes.trim() || undefined,
        confirmRetest: confirmRetest || undefined,
        qcDivision: isPM ? qcDivision : undefined,
      });

      if (res.needsRetestConfirm) {
        setRetestModal('SDG ini sudah berstatus PASS. Tetap simpan sebagai retest?');
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        setErrors({ ...(res.fieldErrors || {}), ...(res.error ? { general: res.error } : {}) });
        setRetestModal(null);
        setIsSubmitting(false);
        return;
      }

      setRetestModal(null);
      setSid('');
      setTitle('');
      setDate(getTodayISO());
      setEnvironment('Demo');
      setStatus(null);
      setNotes('');
      setErrors({});

      setToast(
        res.attemptNumber && res.attemptNumber > 1
          ? `Hasil testing tersimpan sebagai Retest ke-${res.attemptNumber - 1}`
          : 'Hasil testing berhasil dicatat'
      );
      setTimeout(() => setToast(null), 4000);
    } catch {
      setErrors({ general: 'Terjadi kesalahan saat menyimpan hasil testing.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void submit(false);
  }

  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    el.style.paddingBottom = 'calc(64px + env(safe-area-inset-bottom))';
    return () => {
      el.style.paddingBottom = '';
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-text tracking-[-0.02em] leading-tight">
          Input Hasil Testing
        </h1>
        <p className="text-[14px] text-text-muted font-normal">
          Catat hasil testing untuk SDG/tiket yang sudah diuji.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-surface border border-border rounded-[10px] px-4 sm:px-8 py-5 sm:py-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-5 sm:space-y-6 noValidate"
        >
          {errors.general && (
            <div className="p-3 rounded-[8px] bg-[var(--fail-bg)] border border-[var(--fail-fg)]/20 text-fail-fg text-[14px] font-medium">
              {errors.general}
            </div>
          )}

          {/* SDG/Ticket */}
          <FormField
            label="SDG / Ticket"
            htmlFor="sid"
            required
            error={errors.sid}
            hint='Wajib diawali "SDG-". Contoh: SDG-001, SDG-234'
          >
            <input
              id="sid"
              type="text"
              value={sid}
              onChange={(e) => setSid(e.target.value)}
              placeholder="SDG-001"
              className={`${INPUT_CLASS} font-mono`}
            />
          </FormField>

          {/* Judul Task */}
          <FormField
            label="Judul Task"
            htmlFor="title"
            required
            error={errors.title}
          >
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Deskripsi singkat task yang diuji"
              className={INPUT_CLASS}
            />
          </FormField>

          {/* Pilihan Divisi QC (Khusus Product Manager) */}
          {isPM && (
            <FormField label="Kategori / Divisi QC" required error={errors.qcDivision}>
              <div className="grid grid-cols-3 rounded-[8px] border border-border p-1 bg-surface-hover/50 gap-1.5 w-full">
                {QC_DIVISIONS.map((div) => {
                  const isSelected = qcDivision === div.value;
                  return (
                    <button
                      key={div.value}
                      type="button"
                      onClick={() => setQcDivision(div.value)}
                      className={`h-[42px] px-2 sm:px-3 text-[13px] sm:text-[14px] rounded-[6px] transition-all duration-150 font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-accent text-white shadow-xs'
                          : 'text-text-muted hover:text-text hover:bg-surface'
                      }`}
                    >
                      <span>{div.icon}</span>
                      <span>{div.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[12px] text-text-muted mt-1.5">
                Data testing ini akan otomatis dimasukkan ke dalam kategori divisi yang Anda pilih.
              </p>
            </FormField>
          )}

          {/* Tester + Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Tester" htmlFor="tester">
              <input
                id="tester"
                type="text"
                value={user?.name || ''}
                readOnly
                disabled
                className={`${INPUT_CLASS} bg-surface-hover cursor-not-allowed text-text font-medium`}
              />
            </FormField>

            <FormField label="Tanggal" htmlFor="date" required error={errors.date}>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={INPUT_CLASS}
              />
            </FormField>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Environment — segmented control */}
          <FormField label="Environment" required error={errors.environment}>
            <div className="grid grid-cols-2 sm:inline-flex rounded-[8px] border border-border p-1 bg-surface-hover/50 gap-1 w-full sm:w-auto">
              {(['Demo', 'Production'] as const).map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env)}
                  className={`h-[40px] px-4 text-[14px] rounded-[6px] transition-colors duration-150 font-medium ${
                    environment === env
                      ? 'bg-accent text-white font-semibold shadow-xs'
                      : 'text-text-muted hover:text-text hover:bg-surface'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </FormField>

          {/* Status Hasil — segmented control */}
          <FormField label="Status Hasil" required error={errors.status}>
            <div className="grid grid-cols-2 sm:inline-flex rounded-[8px] border border-border p-1 bg-surface-hover/50 gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setStatus('PASS')}
                className={`h-[40px] px-4 text-[14px] rounded-[6px] font-semibold transition-colors duration-150 flex items-center justify-center gap-1.5 ${
                  status === 'PASS'
                    ? 'bg-pass-bg text-pass-fg shadow-xs'
                    : 'text-text-muted hover:text-text hover:bg-surface'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === 'PASS' ? 'bg-pass-fg' : 'bg-border'
                  }`}
                />
                PASS
              </button>
              <button
                type="button"
                onClick={() => setStatus('FAIL')}
                className={`h-[40px] px-4 text-[14px] rounded-[6px] font-semibold transition-colors duration-150 flex items-center justify-center gap-1.5 ${
                  status === 'FAIL'
                    ? 'bg-fail-bg text-fail-fg shadow-xs'
                    : 'text-text-muted hover:text-text hover:bg-surface'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === 'FAIL' ? 'bg-fail-fg' : 'bg-border'
                  }`}
                />
                FAIL
              </button>
            </div>
            {/* Preview badge */}
            {status && (
              <div className="flex items-center gap-2 text-[12px] text-text-muted mt-2">
                <span>Preview:</span>
                <Badge status={status} size="sm" />
              </div>
            )}
          </FormField>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Catatan QC */}
          <FormField
            label="Catatan QC"
            htmlFor="notes"
            hint="Opsional — tambahkan detail jika ada temuan atau catatan khusus"
            error={errors.notes}
          >
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan jika ada..."
              rows={3}
              className={`${INPUT_CLASS} resize-y`}
            />
          </FormField>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-[14px] font-semibold rounded-[8px] bg-accent text-white hover:bg-accent-hover focus:outline-none focus:ring-[3px] focus:ring-focus-ring/10 transition-colors duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Hasil Testing'}
            </button>
          </div>
        </form>
      </div>

      {/* Sticky bottom save bar — hanya tampil di mobile (<1024px) */}
      <div className="lg:hidden fixed left-0 right-0 bottom-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl mx-auto px-1">
          <button
            type="button"
            onClick={() => void submit(false)}
            disabled={isSubmitting}
            className="w-full h-[46px] text-[15px] font-semibold rounded-[8px] bg-accent text-white hover:bg-accent-hover focus:outline-none focus:ring-[3px] focus:ring-focus-ring/10 transition-colors duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Hasil Testing'}
          </button>
        </div>
      </div>

      {/* Modal konfirmasi retest */}
      {retestModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-[10px] shadow-lg max-w-sm w-full p-5 sm:p-6">
            <h3 className="text-[16px] font-bold text-text mb-2">Konfirmasi Retest</h3>
            <p className="text-[14px] text-text-muted mb-6 leading-relaxed">{retestModal}</p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setRetestModal(null);
                  setIsSubmitting(false);
                }}
                className="h-[42px] px-4 text-[14px] font-semibold rounded-[8px] border border-border text-text-muted hover:text-text hover:bg-surface-hover transition-colors duration-150"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void submit(true)}
                disabled={isSubmitting}
                className="h-[42px] px-4 text-[14px] font-semibold rounded-[8px] bg-accent text-white hover:bg-accent-hover transition-colors duration-150 disabled:opacity-60"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan sebagai Retest'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 sm:top-6 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 z-50 sm:w-auto sm:max-w-md pointer-events-auto">
          <div className="bg-emerald-600 dark:bg-emerald-700 text-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] p-3.5 sm:p-4 border-2 border-emerald-400 dark:border-emerald-300 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[15px] font-bold text-white tracking-tight leading-snug">Berhasil Disimpan!</h4>
              <p className="text-[13px] text-emerald-50 font-medium break-words mt-0.5">{toast}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Tutup notifikasi"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
