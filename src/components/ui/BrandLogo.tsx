import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'icon' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  iconOnly?: boolean;
  href?: string;
}

export function SubconsciousLogSymbol({ size = 28, className = '' }: { size?: number; className?: string }) {
  const height = Math.round((size * 120) / 100);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ${className}`}
      aria-label="Subconscious Log Emblem"
    >
      {/* Outer Faceted Sanctuary Polygon / Portal */}
      <path
        d="M 50 6 L 88 28 L 88 92 L 50 114 L 12 92 L 12 28 Z"
        stroke="currentColor"
        strokeWidth="7.5"
        strokeLinejoin="round"
      />
      {/* Inner Portal Threshold Monolith */}
      <path d="M 32 92 L 32 46 L 50 36 L 68 46 L 68 92 Z" fill="currentColor" />
      {/* Center Splay of Inner Light */}
      <rect x="46" y="52" width="8" height="40" fill="var(--bg-primary, #101013)" />
    </svg>
  );
}

/** Legacy alias for compatibility */
export const DreamogonSymbol = SubconsciousLogSymbol;

export function BrandLogo({
  variant = 'full',
  size = 'md',
  className = '',
  iconOnly = false,
  href = '/',
}: BrandLogoProps) {
  const sizeMap = {
    sm: { icon: 20, text: 'text-base', tracking: 'tracking-[0.24em]' },
    md: { icon: 26, text: 'text-xl', tracking: 'tracking-[0.28em]' },
    lg: { icon: 34, text: 'text-2xl', tracking: 'tracking-[0.32em]' },
    xl: { icon: 44, text: 'text-3xl', tracking: 'tracking-[0.36em]' },
  };

  const { icon, text, tracking } = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      <div className="text-[var(--accent)] group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
        <SubconsciousLogSymbol size={icon} />
      </div>
      {!iconOnly && variant === 'full' && (
        <span
          className={`font-display font-medium ${text} ${tracking} text-[var(--text-primary)] uppercase leading-none transition-colors duration-300`}
        >
          Subconscious Log
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
