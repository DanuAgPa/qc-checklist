interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  variant?: 'default' | 'pass' | 'fail' | 'accent';
}

export function StatCard({ label, value, sub, variant = 'default' }: StatCardProps) {
  const accentBar = {
    default: 'border-l-[3px] border-l-border',
    pass: 'border-l-[3px] border-l-pass-fg',
    fail: 'border-l-[3px] border-l-fail-fg',
    accent: 'border-l-[3px] border-l-accent',
  }[variant];

  const valueColor = {
    default: 'text-text',
    pass: 'text-pass-fg',
    fail: 'text-fail-fg',
    accent: 'text-accent',
  }[variant];

  const isProminent = variant === 'accent';

  return (
    <div
      className={`bg-surface border border-border rounded-[10px] px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors duration-150 ${accentBar}`}
    >
      <p className="text-[12px] font-semibold tracking-tight text-label mb-2 uppercase">
        {label}
      </p>
      <p className={`font-mono font-bold leading-tight tabular-nums ${valueColor} ${isProminent ? 'text-[36px]' : 'text-[28px]'}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-[13px] text-text-muted mt-2 font-normal leading-tight ${isProminent ? 'text-text font-medium' : ''}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
