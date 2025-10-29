'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModernButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'gradient' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  ripple?: boolean;
  glow?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    ripple = true,
    glow = false,
    children,
    className,
    disabled,
    onClick,
    ...props
  }, ref) => {
    const [ripples, setRipples] = React.useState<{ x: number; y: number; size: number }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !loading) {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        const newRipple = { x, y, size };
        setRipples([...ripples, newRipple]);
        
        setTimeout(() => {
          setRipples(prevRipples => prevRipples.slice(1));
        }, 600);
      }
      
      onClick?.(e as any);
    };

    const sizeClasses = {
      xs: 'px-3 py-1.5 text-xs',
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    };

    const variantClasses = {
      primary: `
        bg-gradient-to-r from-cyan-500 to-blue-500 text-white
        hover:from-cyan-600 hover:to-blue-600
        shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/35
        border border-cyan-400/20
      `,
      secondary: `
        bg-slate-800 text-slate-200
        hover:bg-slate-700
        border border-slate-700 hover:border-slate-600
      `,
      ghost: `
        bg-transparent text-slate-400
        hover:bg-slate-800/50 hover:text-white
      `,
      glass: `
        bg-white/10 backdrop-blur-md text-white
        hover:bg-white/20
        border border-white/20 hover:border-white/30
        shadow-lg shadow-black/10
      `,
      gradient: `
        bg-gradient-to-br from-purple-500 via-cyan-500 to-blue-500 text-white
        hover:from-purple-600 hover:via-cyan-600 hover:to-blue-600
        shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/35
        border border-purple-400/20
      `,
      outline: `
        bg-transparent text-cyan-400
        border-2 border-cyan-400 hover:border-cyan-300
        hover:bg-cyan-400/10
      `,
    };

    const glowAnimation = glow ? {
      boxShadow: [
        '0 0 20px rgba(6, 182, 212, 0.5)',
        '0 0 40px rgba(6, 182, 212, 0.8)',
        '0 0 20px rgba(6, 182, 212, 0.5)',
      ],
    } : {};

    return (
      <motion.button
        ref={ref as any}
        className={cn(
          'relative overflow-hidden rounded-lg font-medium',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transform active:scale-[0.98]',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        animate={glowAnimation}
        transition={{
          duration: glow ? 2 : 0.2,
          repeat: glow ? Infinity : 0,
          ease: 'easeInOut',
        }}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple Effects */}
        {ripples.map((ripple, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}

        {/* Loading Spinner */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}

        {/* Button Content */}
        <span className={cn(
          'relative flex items-center justify-center gap-2',
          loading && 'invisible'
        )}>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </span>

        {/* Gradient Overlay for Hover Effect */}
        <span className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.button>
    );
  }
);

ModernButton.displayName = 'ModernButton';
