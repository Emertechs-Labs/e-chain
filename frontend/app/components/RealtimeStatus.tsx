"use client";

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function RealtimeStatus() {
  const [status, setStatus] = useState<'disabled' | 'connecting' | 'connected' | 'closed'>('disabled');

  useEffect(() => {
    // Determine initial status from env/global
    const wsUrl = (typeof window !== 'undefined' && (window as any).__NEXT_PUBLIC_WS_PROVIDER) || process.env.NEXT_PUBLIC_WS_PROVIDER;
    if (!wsUrl) {
      setStatus('disabled');
      return;
    }

    // read global status if set by useRealtimeSubscriptions
    const update = () => {
      const s = (window as any).__ECHAIN_WS_STATUS;
      if (!s) return;
      setStatus(s);
    };

    update();
    window.addEventListener('echain:wsstatus', update);
    return () => window.removeEventListener('echain:wsstatus', update);
  }, []);

  if (status === 'disabled') return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-slate-800/70 text-white px-3 py-2 rounded-lg border border-slate-700">
        {status === 'connected' ? <Wifi className="w-4 h-4 text-cyan-400" /> : <WifiOff className="w-4 h-4 text-rose-400" />}
        <div className="text-xs">
          <div className="font-medium">Realtime</div>
          <div className="text-gray-300">{status}</div>
        </div>
      </div>
    </div>
  );
}
