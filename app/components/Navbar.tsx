'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { ROLE_LABELS } from '@/lib/access';
import { ThemeToggle } from './ThemeToggle';
import type { Role } from '@/app/types';

interface NavItem {
  href: string;
  label: string;
}

function getNavItems(role: Role | undefined): NavItem[] {
  const items: NavItem[] = [];

  if (role) {
    items.push({ href: '/input', label: 'Input Testing' });
  }
  items.push({ href: '/riwayat', label: 'Riwayat' });
  if (role) {
    items.push({ href: '/dashboard', label: 'Dashboard' });
  }
  if (role === 'PRODUCT_MANAGER') {
    items.push({ href: '/pengguna', label: 'Pengguna' });
  }

  return items;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const navItems = getNavItems(user?.role);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  // Otomatis tutup panel mobile saat berpindah halaman
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className="h-[64px] bg-surface border-b border-border sticky top-0 z-50"
        ref={navRef}
      >
        <div className="w-full px-4 sm:px-8 lg:px-14 xl:px-20 h-full flex items-center justify-between">
          {/* Sisi Kiri: Logo + Pembatas + Menu Navigasi */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
            {/* Logo dengan ruang nafas yang nyaman */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 hover:opacity-90 transition-opacity">
              <span className="w-8 h-8 rounded-[8px] bg-accent flex items-center justify-center font-mono font-bold text-[14px] text-white shadow-xs shrink-0">
                QC
              </span>
              <span className="text-[15px] sm:text-[16px] font-bold text-text tracking-tight whitespace-nowrap">
                QC Checklist
              </span>
            </Link>

            {/* Pemisah vertikal */}
            <div className="hidden md:block w-px h-5 bg-border/80" />

            {/* Desktop & tablet navigation: pill tabs */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-3.5 py-1.5 text-[14px] rounded-[8px] transition-all duration-150 ${
                      isActive
                        ? 'bg-accent text-white font-semibold shadow-xs'
                        : 'text-text-muted font-medium hover:text-text hover:bg-surface-hover'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sisi Kanan: [ThemeToggle] [pemisah] [profil user badge] [tombol Keluar] */}
          <div className="ml-auto hidden md:flex items-center gap-3 shrink-0">
            <ThemeToggle />

            {/* Pemisah vertikal */}
            <div className="w-px h-5 bg-border shrink-0" />

            {/* Blok profil pengguna rapi */}
            <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-[8px] bg-surface-hover/70 border border-border">
              <div className="w-7 h-7 rounded-full bg-accent text-white font-bold text-[12px] flex items-center justify-center shrink-0 shadow-xs">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="text-left leading-tight">
                <p className="text-[13px] font-semibold text-text truncate max-w-[140px]">
                  {user?.name || ''}
                </p>
                {user?.name !== (user?.role ? ROLE_LABELS[user.role] : '') && (
                  <p className="text-[11px] text-text-muted font-medium">
                    {user?.role ? ROLE_LABELS[user.role] : ''}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="h-[34px] px-3 text-[13px] font-medium rounded-[8px] border border-border bg-surface text-text hover:bg-fail-bg hover:text-fail-fg hover:border-fail-fg/30 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>

          {/* Kanan HP (<768px): ThemeToggle di kiri tombol "Menu", jarak 8px */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="h-[38px] px-3 text-[13px] font-semibold text-text border border-border rounded-[8px] bg-surface hover:bg-surface-hover transition-colors duration-150 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-ring shrink-0 flex items-center gap-1.5"
              aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
              <span>Menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile panel — HP only, full width di bawah navbar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed top-[64px] left-0 right-0 z-50 md:hidden bg-surface border-b border-border shadow-lg p-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="space-y-1 mb-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center h-[42px] px-3.5 rounded-[8px] text-[14px] transition-colors duration-150 ${
                      isActive
                        ? 'bg-accent/10 text-[var(--accent-text)] font-semibold border border-accent/20'
                        : 'text-text-muted hover:bg-surface-hover hover:text-text font-medium'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-border pt-3.5 space-y-3">
              <div className="flex items-center gap-2.5 px-1">
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 text-[var(--accent-text)] font-bold text-[13px] flex items-center justify-center shrink-0">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[13px] font-semibold text-text">
                    {user?.name || ''}
                  </p>
                  <p className="text-[11px] text-text-muted font-medium">
                    {user?.role ? ROLE_LABELS[user.role] : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex-1 h-[40px] text-center px-4 text-[13px] font-semibold text-text rounded-[8px] border border-border bg-surface hover:bg-surface-hover transition-colors duration-150 disabled:opacity-50"
                >
                  Keluar
                </button>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="h-[40px] px-4 text-[13px] font-semibold text-text-muted rounded-[8px] border border-border bg-surface hover:bg-surface-hover transition-colors duration-150"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
