"use client";

import Image from "next/image";

const SVG = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="TrueDocs logo"
  >
    <defs>
      <linearGradient id="td-top" x1="14" y1="8" x2="50" y2="46" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.55" stopColor="#E4E4E7" />
        <stop offset="1" stopColor="#9CA3AF" />
      </linearGradient>
      <linearGradient id="td-left" x1="6" y1="14" x2="46" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FAFAFA" />
        <stop offset="1" stopColor="#6B7280" />
      </linearGradient>
      <linearGradient id="td-right" x1="14" y1="20" x2="54" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#D4D4D8" />
        <stop offset="1" stopColor="#404045" />
      </linearGradient>
      <linearGradient id="td-bottom" x1="6" y1="22" x2="32" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#71717A" />
        <stop offset="1" stopColor="#1C1C1F" />
      </linearGradient>
      <linearGradient id="td-rim" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.35" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.6" />
      </linearGradient>
      <filter id="td-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.4" />
      </filter>
    </defs>

    {/* Top-right facet (lightest) */}
    <path
      d="M32 6 L56 22 L38 38 L32 14 Z"
      fill="url(#td-top)"
    />
    {/* Top-left facet */}
    <path
      d="M32 6 L8 22 L26 38 L32 14 Z"
      fill="url(#td-left)"
      opacity="0.95"
    />
    {/* Center fold highlight */}
    <path
      d="M32 14 L38 38 L26 38 Z"
      fill="#F4F4F5"
      opacity="0.9"
    />
    {/* Right facet */}
    <path
      d="M56 22 L38 38 L42 54 Z"
      fill="url(#td-right)"
    />
    {/* Left facet */}
    <path
      d="M8 22 L26 38 L22 54 Z"
      fill="url(#td-bottom)"
    />
    {/* Bottom point */}
    <path
      d="M26 38 L42 54 L22 54 Z"
      fill="#27272A"
    />
    {/* Inner crease shadows */}
    <path
      d="M32 14 L26 38 M32 14 L38 38"
      stroke="rgba(0,0,0,0.35)"
      strokeWidth="0.4"
      fill="none"
    />
    {/* Outer rim glow */}
    <path
      d="M32 6 L56 22 L42 54 L22 54 L8 22 Z"
      fill="none"
      stroke="url(#td-rim)"
      strokeWidth="0.5"
      opacity="0.6"
    />
  </svg>
);

export function Logo({
  className = "h-10 w-10",
  withWordmark = false,
  iconSrc,
}: {
  className?: string;
  withWordmark?: boolean;
  /** If provided (e.g. "/truedocs-icon.png"), uses that image instead of the SVG. */
  iconSrc?: string;
}) {
  const Mark = iconSrc ? (
    <span className={`relative ${className}`}>
      <Image src={iconSrc} alt="TrueDocs" fill sizes="80px" className="object-contain" />
    </span>
  ) : (
    <SVG className={className} />
  );

  if (!withWordmark) return <span className="inline-flex">{Mark}</span>;

  return (
    <span className="inline-flex items-center gap-3">
      {Mark}
      <span className="text-[21px] font-semibold tracking-tight text-white">
        TrueDocs
      </span>
    </span>
  );
}