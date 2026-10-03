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

export const authInputClass =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/30 outline-none transition focus:border-white/[0.22] focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(56,189,248,0.08)]";

export const authInvalidInputClass =
  "w-full rounded-xl border border-red-500/50 bg-red-500/[0.04] px-4 py-3 text-[14px] text-white placeholder:text-white/30 outline-none transition focus:border-red-500/70 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]";

export const authButtonClass =
  "group relative w-full overflow-hidden rounded-xl bg-white px-4 py-3.5 text-[14px] font-semibold text-neutral-900 transition hover:bg-neutral-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_24px_-8px_rgba(255,255,255,0.25)]";

export const authBannerClass =
  "rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-2.5 text-[13px] text-red-300";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  variant?: "light" | "dark";
};

export function Field({ label, error, hint, id, variant = "light", ...input }: FieldProps) {
  const inputId = id ?? input.name;
  const isDark = variant === "dark";
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={inputId}
          className={
            isDark
              ? "text-[12.5px] font-medium tracking-wide text-white/75"
              : "text-sm font-medium text-neutral-700"
          }
        >
          {label}
        </label>
        {hint}
      </div>
      <input
        {...input}
        id={inputId}
        aria-invalid={Boolean(error)}
        className={
          error
            ? isDark
              ? authInvalidInputClass
              : invalidInputClass
            : isDark
              ? authInputClass
              : inputClass
        }
      />
      {error && (
        <p
          className={
            isDark ? "text-[11.5px] text-red-300/90" : "text-xs text-red-600"
          }
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function Banner({
  children,
  variant = "light",
}: {
  children: ReactNode;
  variant?: "light" | "dark";
}) {
  if (!children) return null;
  return (
    <p className={variant === "dark" ? authBannerClass : bannerClass}>{children}</p>
  );
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

export function OAuthButton({
  provider,
  children,
  onClick,
}: {
  provider: "google" | "github";
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] font-medium text-white/90 backdrop-blur-md transition-all hover:border-white/[0.18] hover:bg-white/[0.06] active:scale-[0.99]"
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {provider === "google" ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.18.74-1.45-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
          </svg>
        )}
      </span>
      <span>{children}</span>
      <span className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}

export function Divider({ children }: { children?: ReactNode }) {
  return (
    <div className="relative flex items-center justify-center py-1">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      {children && (
        <span className="relative bg-[#050505] px-3 text-[11.5px] uppercase tracking-[0.18em] text-white/40">
          {children}
        </span>
      )}
    </div>
  );
}