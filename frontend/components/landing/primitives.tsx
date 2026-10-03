"use client";

import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[1280px] px-6 sm:px-8 ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-white/75 backdrop-blur-xl ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const cls = `group relative inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-[14px] font-semibold text-neutral-900 transition-all duration-300 hover:bg-neutral-100 hover:shadow-[0_0_40px_-8px_rgba(255,255,255,0.5)] active:scale-[0.98] ${className}`;
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return <button className={cls}>{children}</button>;
}

export function GhostButton({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const cls = `group inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 py-3.5 text-[14px] font-medium text-white/90 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.15)] ${className}`;
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return <button className={cls}>{children}</button>;
}

export function SectionHeading({
  badge,
  title,
  description,
  align = "center",
}: {
  badge: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div
      className={`flex flex-col gap-5 ${
        align === "center"
          ? "items-center text-center"
          : "items-start text-left"
      }`}
    >
      <Badge>{badge}</Badge>
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[44px] md:leading-[1.12] glow-text">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-pretty text-[15px] leading-relaxed text-white/50 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}