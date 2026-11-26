"use client";

import Image from "next/image";

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
      <Image
        src="/Futuristic Folded Ribbon Emblem.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain drop-shadow-[0_0_10px_rgba(56,189,248,0.22)]"
        priority={size >= 48}
      />
    </span>
  );
}
