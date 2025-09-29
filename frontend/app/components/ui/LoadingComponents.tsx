import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
  color = 'border-cyan-500'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300',
        `border-t-${color.replace('border-', '')}`,
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export function LoadingDots({
  size = 'md',
  className,
  color = 'bg-cyan-500'
}: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce animation-duration-600',
            `bg-${color.replace('bg-', '')}`,
            `animation-delay-${i * 100}`,
            sizeClasses[size]
          )}
        />
      ))}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-700 rounded';

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              i === lines - 1 ? 'h-3 w-3/4' : 'h-4 w-full'
            )}
          />
        ))}
      </div>
    );
  }

  const dimensionClasses = {
    circular: 'rounded-full',
    rectangular: 'rounded',
    text: 'rounded h-4',
  };

  // Build Tailwind arbitrary value classes for dynamic width/height instead of inline styles
  const widthClass = width
    ? typeof width === 'number'
      ? `w-[${width}px]`
      : `w-[${width}]`
    : '';

  const heightClass = height
    ? typeof height === 'number'
      ? `h-[${height}px]`
      : `h-[${height}]`
    : '';

  return (
    <div
      className={cn(
        baseClasses,
        dimensionClasses[variant],
        widthClass,
        heightClass,
        className
      )}
    />
  );
}

interface LoadingCardProps {
  className?: string;
  title?: boolean;
  contentLines?: number;
}

export function LoadingCard({
  className,
  title = true,
  contentLines = 3,
}: LoadingCardProps) {
  return (
    <div className={cn('bg-slate-800 rounded-lg p-6 space-y-4', className)}>
      {title && <Skeleton className="h-6 w-1/3" />}
      <Skeleton lines={contentLines} className="space-y-2" />
    </div>
  );
}

interface LoadingButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export function LoadingButton({
  className,
  size = 'md',
  children = 'Loading...',
}: LoadingButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      disabled
      className={cn(
        'flex items-center justify-center space-x-2 bg-slate-700 text-slate-400 cursor-not-allowed rounded-lg transition-colors',
        sizeClasses[size],
        className
      )}
    >
      <LoadingSpinner size="sm" className="border-slate-400" />
      <span>{children}</span>
    </button>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  isVisible,
  message = 'Loading...',
  className,
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50',
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="text-white text-sm font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}

interface LoadingGridProps {
  items?: number;
  className?: string;
}

export function LoadingGrid({ items = 6, className }: LoadingGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}

// Page-level loading component
export function PageLoading({ message = 'Loading page...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <LoadingSpinner size="xl" className="mx-auto" />
        <p className="text-gray-400 text-lg">{message}</p>
      </div>
    </div>
  );
}

// Inline loading component for smaller sections
export function InlineLoading({
  message = 'Loading...',
  className
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <div className="flex items-center space-x-3">
        <LoadingSpinner size="md" />
        <span className="text-gray-400">{message}</span>
      </div>
    </div>
  );
}
