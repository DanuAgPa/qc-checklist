import { TestStatus } from '@/app/types';

interface BadgeProps {
  status: TestStatus;
  size?: 'sm' | 'md';
}

export function Badge({ status, size = 'md' }: BadgeProps) {
  const isPass = status === 'PASS';

  const sizeClasses = size === 'sm'
    ? 'text-[12px] px-2 py-0.5 gap-1.5 rounded-[6px] font-semibold'
    : 'text-[13px] px-2.5 py-0.5 gap-1.5 rounded-[6px] font-semibold';

  return (
    <span
      className={`inline-flex items-center tracking-tight ${
        isPass
          ? 'bg-pass-bg text-pass-fg'
          : 'bg-fail-bg text-fail-fg'
      } ${sizeClasses}`}
    >
      <span
        className={`inline-block rounded-full ${
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
        } ${
          isPass ? 'bg-pass-fg' : 'bg-fail-fg'
        }`}
      />
      {status}
    </span>
  );
}
