import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-[100dvh] bg-bg flex items-start justify-center pt-[20vh] px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--fail-bg)] mb-5">
          <svg
            className="w-7 h-7 text-fail-fg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
        <h1 className="text-[28px] font-bold text-text tracking-[-0.02em] leading-tight">
          Akses Ditolak
        </h1>
        <p className="text-[14px] text-text-muted mt-2 mb-6">
          Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi Product Manager jika Anda merasa ini adalah kesalahan.
        </p>
        <Link
          href="/"
          className="inline-flex px-5 py-2.5 text-[14px] font-semibold rounded-[8px] bg-accent text-white hover:bg-accent-hover transition-colors duration-150"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
