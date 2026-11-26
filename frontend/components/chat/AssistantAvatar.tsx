"use client";

export function AssistantAvatar({
  size = 32,
  rounded = "rounded-xl",
  className = "",
}: {
  size?: number;
  rounded?: string;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden border border-cyan-400/30 bg-gradient-to-br from-cyan-500/[0.18] via-[#071018] to-black shadow-[0_0_18px_rgba(6,182,212,0.22)] ${rounded} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
        <defs>
          <radialGradient id="assistant-avatar-glow" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#22d3ee" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id="assistant-avatar-face"
            x1="8"
            y1="6"
            x2="24"
            y2="26"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#e0f2fe" />
            <stop offset="1" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        <circle cx="16" cy="16" r="15" fill="url(#assistant-avatar-glow)" />

        <path
          d="M16 6.2c-4.1 0-6.9 2.8-6.9 6.5v4.9c0 3.8 2.8 6.8 6.9 6.8s6.9-3 6.9-6.8v-4.9c0-3.7-2.8-6.5-6.9-6.5Z"
          fill="#0b1a24"
          stroke="url(#assistant-avatar-face)"
          strokeWidth="1.2"
        />

        <rect x="11.4" y="13.2" width="2.6" height="2.9" rx="1.3" fill="#67e8f9" />
        <rect x="18" y="13.2" width="2.6" height="2.9" rx="1.3" fill="#67e8f9" />
        <path
          d="M12.6 19.3c1 .9 2.1 1.3 3.4 1.3s2.4-.4 3.4-1.3"
          stroke="#67e8f9"
          strokeWidth="1.15"
          strokeLinecap="round"
        />

        <path d="M16 6.2V4" stroke="#67e8f9" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="16" cy="3.2" r="1.15" fill="#a5f3fc" />
      </svg>
    </span>
  );
}
