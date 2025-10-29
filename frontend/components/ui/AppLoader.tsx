import { Loader2 } from 'lucide-react';

export function AppLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-accent">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-lg font-medium text-foreground animate-pulse">
          Loading Echain...
        </div>
        <div className="text-sm text-muted-foreground">
          Initializing blockchain connection
        </div>
      </div>
    </div>
  );
}