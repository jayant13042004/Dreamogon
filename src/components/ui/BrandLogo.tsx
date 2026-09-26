import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'icon' | 'full';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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

export function BrandLogo({
  variant = 'full',
  size = 'md',
  className = '',
  iconOnly = false,
  href = '/',
}: BrandLogoProps) {
  const sizeMap = {
    xs: { icon: 18, text: 'text-xs', tracking: 'tracking-[0.14em]', gap: 'gap-2' },
    sm: { icon: 20, text: 'text-xs sm:text-[13px]', tracking: 'tracking-[0.14em]', gap: 'gap-2.5' },
    md: { icon: 22, text: 'text-[13.5px] sm:text-sm', tracking: 'tracking-[0.14em]', gap: 'gap-2.5' },
    lg: { icon: 28, text: 'text-base sm:text-lg', tracking: 'tracking-[0.16em]', gap: 'gap-3' },
    xl: { icon: 36, text: 'text-xl sm:text-2xl', tracking: 'tracking-[0.18em]', gap: 'gap-3.5' },
  };

  const { icon, text, tracking, gap } = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`inline-flex items-center ${gap} group select-none ${className}`}>
      <div className="text-[var(--accent)] group-hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0">
        <SubconsciousLogSymbol size={icon} />
      </div>
      {!iconOnly && variant === 'full' && (
        <span
          className={`font-display font-semibold ${text} ${tracking} text-[var(--text-primary)] uppercase leading-none whitespace-nowrap transition-colors duration-300`}
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
