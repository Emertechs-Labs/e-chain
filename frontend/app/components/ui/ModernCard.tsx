'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModernCardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'outlined' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  glow?: boolean;
  blur?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({
    variant = 'default',
    padding = 'md',
    hover = true,
    glow = false,
    blur = false,
    children,
    className,
    ...props
  }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    const variantClasses = {
      default: `
        bg-slate-800/50 backdrop-blur-sm
        border border-slate-700/50
        shadow-xl shadow-black/10
      `,
      glass: `
        bg-white/5 backdrop-blur-md
        border border-white/10
        shadow-xl shadow-black/20
        before:absolute before:inset-0 before:rounded-2xl
        before:bg-gradient-to-br before:from-white/10 before:to-transparent
        before:pointer-events-none
      `,
      gradient: `
        bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90
        border border-transparent
        shadow-2xl shadow-cyan-500/10
        before:absolute before:inset-0 before:rounded-2xl
        before:p-[1px] before:bg-gradient-to-br 
        before:from-cyan-500 before:via-blue-500 before:to-purple-500
        before:-z-10
      `,
      elevated: `
        bg-slate-800
        border border-slate-700
        shadow-2xl shadow-black/30
        hover:shadow-3xl hover:shadow-black/40
      `,
      outlined: `
        bg-transparent
        border-2 border-slate-600
        hover:border-cyan-500/50
      `,
      interactive: `
        bg-gradient-to-br from-slate-800/80 to-slate-900/80
        border border-slate-700/50
        shadow-lg shadow-black/20
        hover:shadow-2xl hover:shadow-cyan-500/20
        hover:border-cyan-500/50
        cursor-pointer
      `,
    };

    const hoverAnimation = hover ? {
      scale: 1.02,
      y: -4,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }
    } : {};

    const glowAnimation = glow ? {
      boxShadow: [
        '0 0 30px rgba(6, 182, 212, 0.3)',
        '0 0 60px rgba(6, 182, 212, 0.5)',
        '0 0 30px rgba(6, 182, 212, 0.3)',
      ],
    } : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative rounded-2xl transition-all duration-300',
          'overflow-hidden',
          paddingClasses[padding],
          variantClasses[variant],
          blur && 'backdrop-blur-xl',
          className
        )}
        whileHover={hover ? hoverAnimation : {}}
        animate={glowAnimation}
        transition={{
          duration: glow ? 3 : 0.3,
          repeat: glow ? Infinity : 0,
          ease: 'easeInOut',
        }}
        {...props}
      >
        {/* Gradient Border Effect for certain variants */}
        {(variant === 'gradient' || variant === 'interactive') && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Noise Texture Overlay (subtle) */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
          <svg width="100%" height="100%">
            <filter id="noise">
              <feTurbulence baseFrequency="0.9" numOctaves="4" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>
      </motion.div>
    );
  }
);

ModernCard.displayName = 'ModernCard';
