import { useEffect, useRef } from 'react';

/**
 * Hook for managing focus within a component
 */
export function useFocusManagement() {
  const focusRef = useRef<HTMLDivElement>(null);

  const focusFirst = () => {
    if (focusRef.current) {
      const focusableElements = focusRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0] as HTMLElement;
      firstFocusable?.focus();
    }
  };

  const focusLast = () => {
    if (focusRef.current) {
      const focusableElements = focusRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
      lastFocusable?.focus();
    }
  };

  return { focusRef, focusFirst, focusLast };
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation() {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        // Handle escape key
        break;
      case 'Enter':
      case ' ':
        // Handle activation
        break;
      case 'ArrowDown':
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowRight':
        // Handle arrow navigation
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}

/**
 * Generate accessible IDs
 */
export function useAccessibleId(prefix = 'accessible') {
  const id = `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  return id;
}

/**
 * Screen reader announcement utility
 */
export function useScreenReader() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce };
}
