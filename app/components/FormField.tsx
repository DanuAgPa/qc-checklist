import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, required, hint, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-semibold text-label"
      >
        {label}
        {required && (
          <span className="text-fail-fg ml-1 text-[12px] font-normal">(wajib)</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-[12px] leading-tight text-text-muted">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-[12px] leading-tight text-fail-fg font-medium">{error}</p>
      )}
    </div>
  );
}
