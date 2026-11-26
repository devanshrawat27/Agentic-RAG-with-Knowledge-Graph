"use client";

export function AssistantAvatar({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex flex-shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
        <defs>
          <radialGradient id="orb-body" cx="36%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="16%" stopColor="#dbe3ec" />
            <stop offset="42%" stopColor="#8b9aab" />
            <stop offset="68%" stopColor="#3b4a5c" />
            <stop offset="88%" stopColor="#111c2b" />
            <stop offset="100%" stopColor="#030712" />
          </radialGradient>
          <radialGradient id="orb-core" cx="50%" cy="48%" r="52%">
            <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#7dd3fc" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="orb-rim" x1="14" y1="10" x2="52" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="38%" stopColor="#cbd5e1" stopOpacity="0.25" />
            <stop offset="72%" stopColor="#0f172a" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="orb-floor" cx="50%" cy="100%" r="60%">
            <stop offset="0%" stopColor="#020617" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="32" cy="33.5" r="27" fill="#020617" opacity="0.55" />
        <circle cx="32" cy="32" r="27" fill="url(#orb-body)" />
        <circle cx="32" cy="32" r="27" fill="none" stroke="url(#orb-rim)" strokeWidth="1.4" />
        <circle cx="32" cy="32" r="27" fill="url(#orb-floor)" />

        <ellipse
          cx="23.5"
          cy="20.5"
          rx="11.5"
          ry="6.5"
          fill="#ffffff"
          opacity="0.38"
          transform="rotate(-28 23.5 20.5)"
        />
        <ellipse
          cx="24.5"
          cy="22"
          rx="5"
          ry="2.4"
          fill="#ffffff"
          opacity="0.55"
          transform="rotate(-28 24.5 22)"
        />

        <circle cx="32" cy="32" r="13" fill="url(#orb-core)" />
        <circle cx="32" cy="32" r="13" fill="none" stroke="#bae6fd" strokeOpacity="0.22" strokeWidth="0.8" />
        <circle cx="32" cy="32" r="3.2" fill="#f0f9ff" opacity="0.95" />
        <circle cx="32" cy="32" r="5.4" fill="none" stroke="#e0f2fe" strokeOpacity="0.45" strokeWidth="0.7" />

        <path
          d="M32 6a26 26 0 0 1 25.2 20"
          stroke="#ffffff"
          strokeOpacity="0.16"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
