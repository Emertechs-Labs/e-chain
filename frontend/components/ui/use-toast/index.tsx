import * as React from "react";

// Simple implementation for the toast hook
type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export const toast = (props: ToastProps) => {
  // In a real implementation, this would show a toast
  console.log("[TOAST]", props);
};

export { toast as useToast };