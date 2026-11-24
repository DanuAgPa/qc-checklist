'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';
  const label = isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
      aria-label={label}
      title={label}
      suppressHydrationWarning
      className="inline-flex items-center justify-center shrink-0 w-[44px] h-[44px] md:w-[36px] md:h-[36px] rounded-[8px] border border-border bg-transparent hover:bg-surface-hover cursor-pointer text-text-muted hover:text-text transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-ring"
    >
      {/* Ikon matahari — tampil saat mode terang aktif */}
      <svg
        className="theme-sun-icon shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>

      {/* Ikon bulan sabit — tampil saat mode gelap aktif */}
      <svg
        className="theme-moon-icon shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </button>
  );
}
