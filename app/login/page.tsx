'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ThemeProvider } from '@/app/components/ThemeProvider';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usernameRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json() as { error?: string; user?: { role: string } };

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan. Coba lagi.');
        setLoading(false);
        return;
      }

      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Tidak dapat terhubung ke server.');
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-[8px] border border-border bg-surface px-3.5 py-3 text-[16px] font-normal text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-focus-ring/10 transition-colors duration-150';

  return (
    <div className="min-h-[100dvh] bg-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[400px]">
        <div className="bg-surface border border-border rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 sm:p-8">
          <div className="logo-and-form">
            {renderHeader()}
            <form onSubmit={handleSubmit} className="space-y-4">
              {renderFields()}
            </form>
            {renderFooter()}
          </div>
        </div>
      </div>
    </div>
  );

  function renderHeader() {
    return (
      <>
        <div className="flex items-center gap-2.5 mb-6">
          <span className="w-7 h-7 rounded-[8px] bg-accent flex items-center justify-center font-mono font-bold text-[14px] text-white shrink-0">
            QC
          </span>
          <span className="text-[16px] font-bold text-text tracking-tight">
            QC Checklist
          </span>
        </div>

        <h1 className="text-[28px] font-bold text-text tracking-[-0.02em] leading-tight mb-2">
          Masuk
        </h1>
        <p className="text-[14px] text-text-muted mb-6 font-normal">
          Gunakan akun yang diberikan Product Manager.
        </p>
      </>
    );
  }

  function renderFields() {
    return (
      <>
        <div className="space-y-2">
          <label htmlFor="username" className="block text-[13px] font-semibold text-label">
            Username
          </label>
          <input
            ref={usernameRef}
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username"
            required
            autoComplete="username"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-[13px] font-semibold text-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={`${inputClass} pr-24`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-accent hover:text-accent-hover transition-colors duration-150"
              tabIndex={-1}
            >
              {showPassword ? 'Sembunyikan' : 'Tampilkan'}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-[14px] text-fail-fg font-medium">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[48px] rounded-[8px] bg-accent text-white text-[15px] font-semibold hover:bg-accent-hover focus:outline-none focus:ring-[3px] focus:ring-focus-ring/10 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </>
    );
  }

  function renderFooter() {
    return (
      <p className="text-center text-[14px] text-text-muted mt-6 font-normal">
        Lupa password? Hubungi Product Manager.
      </p>
    );
  }
}

export default function LoginPage() {
  'use client';
  return (
    <ThemeProvider>
      <Suspense>
        <LoginForm />
      </Suspense>
    </ThemeProvider>
  );
}
