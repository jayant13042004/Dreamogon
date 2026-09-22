'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'variant'> {
  variant?: 'default' | 'elevated' | 'interactive' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-[var(--radius-panel)] bg-[var(--bg-card)] overflow-hidden border border-[var(--border-subtle)]';
    
    const variants = {
      default: '',
      elevated: 'shadow-sm border-[var(--border-default)]',
      interactive: 'cursor-pointer hover:border-[var(--border-default)] transition-colors',
      bordered: 'border-[var(--border-default)]',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-8',
    };

    const cardClasses = `${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`;

    return (
      <motion.div
        ref={ref}
        whileHover={variant === 'interactive' ? { y: -2 } : undefined}
        className={cardClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
