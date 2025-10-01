/**
 * Utility function to create a dynamic style for progress bars
 * This avoids direct inline styles by returning a class name with a data attribute
 * that can be targeted in CSS
 */
export function getProgressBarStyle(percentage: number): string {
  // Using data attributes instead of inline styles
  return `progress-${Math.round(percentage)}`;
}