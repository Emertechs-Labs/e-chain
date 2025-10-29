'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'glass' | 'outline' | 'filled';
  fullWidth?: boolean;
}

export const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({
    label,
    error,
    success,
    helperText,
    icon,
    iconPosition = 'left',
    variant = 'default',
    fullWidth = false,
    className,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
    };

    const variantClasses = {
      default: `
        bg-slate-800/50 backdrop-blur-sm
        border-2 border-slate-700
        focus:border-cyan-500 focus:bg-slate-800/70
        hover:border-slate-600
      `,
      glass: `
        bg-white/5 backdrop-blur-md
        border-2 border-white/10
        focus:border-cyan-400/50 focus:bg-white/10
        hover:border-white/20
      `,
      outline: `
        bg-transparent
        border-2 border-slate-600
        focus:border-cyan-500
        hover:border-slate-500
      `,
      filled: `
        bg-slate-800
        border-2 border-transparent
        focus:border-cyan-500
        hover:bg-slate-700
      `,
    };

    const stateClasses = error
      ? 'border-red-500 focus:border-red-400'
      : success
      ? 'border-green-500 focus:border-green-400'
      : '';

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <motion.label
            className={cn(
              'absolute left-3 transition-all duration-200 pointer-events-none z-10',
              'text-slate-400',
              (isFocused || hasValue || props.value) ? 
                'top-0 -translate-y-1/2 text-xs px-2 bg-slate-900' : 
                'top-1/2 -translate-y-1/2 text-base',
              (isFocused || hasValue || props.value) ? 
                (error ? 'text-red-400' : success ? 'text-green-400' : 'text-cyan-400') : 
                undefined
            )}
            animate={{
              fontSize: (isFocused || hasValue || props.value) ? '0.75rem' : '1rem',
            }}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 rounded-lg',
              'text-white placeholder-slate-500',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-cyan-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              variantClasses[variant],
              stateClasses,
              icon && iconPosition === 'left' ? 'pl-12' : '',
              icon && iconPosition === 'right' ? 'pr-12' : '',
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
              {icon}
            </div>
          )}

          {/* Focus Line Animation */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: isFocused ? '100%' : '0%' }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Helper/Error/Success Text */}
        {(helperText || error || success) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-1 text-xs',
              error ? 'text-red-400' : success ? 'text-green-400' : 'text-slate-400'
            )}
          >
            {error || success || helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

ModernInput.displayName = 'ModernInput';
