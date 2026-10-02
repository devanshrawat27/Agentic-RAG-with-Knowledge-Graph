import type { InputHTMLAttributes, ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100";

export const invalidInputClass = `${inputClass} border-red-500 focus:border-red-500 focus:ring-red-100`;

export const buttonClass =
  "w-full rounded-lg bg-neutral-900 px-3.5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50";

export const secondaryButtonClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50";

export const pageClass = "flex min-h-screen items-center justify-center bg-neutral-50 p-6";

export const cardClass =
  "w-full max-w-md space-y-6 rounded-2xl border border-neutral-200 bg-white p-10 shadow-sm";

export const bannerClass = "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

export function Field({ label, error, hint, id, ...input }: FieldProps) {
  const inputId = id ?? input.name;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
        {hint}
      </div>
      <input
        {...input}
        id={inputId}
        aria-invalid={Boolean(error)}
        className={error ? invalidInputClass : inputClass}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Banner({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className={bannerClass}>{children}</p>;
}

export function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={cardClass}>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
