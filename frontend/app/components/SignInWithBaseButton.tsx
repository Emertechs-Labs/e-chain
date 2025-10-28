'use client';

import { useBaseAuth } from '../../hooks/useBaseAuth';
import { Button } from './ui/button';
import { Wallet, LogOut, UserRound } from 'lucide-react';

interface SignInWithBaseButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  colorScheme?: 'light' | 'dark';
  showDisconnect?: boolean;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export function SignInWithBaseButton({
  variant = 'default',
  size = 'default',
  className,
  colorScheme = 'dark',
  showDisconnect = true,
  onSignIn,
  onSignOut,
}: SignInWithBaseButtonProps) {
  const { authenticate, disconnect, isConnected, address, isLoading } = useBaseAuth();

  const handleSignIn = async () => {
    await authenticate();
    onSignIn?.();
  };

  const handleSignOut = async () => {
    await disconnect();
    onSignOut?.();
  };

  if (isConnected && address) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-400 font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        {showDisconnect && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isLoading}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Disconnect
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size={size}
        onClick={handleSignIn}
        disabled={isLoading}
        className={`${className} w-full flex justify-center items-center py-2`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Signing in...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Continue with a wallet
          </>
        )}
      </Button>
      
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>
      
      <Button
        variant="secondary"
        size={size}
        onClick={() => {
          // Trigger Farcaster auth modal
          window.dispatchEvent(new CustomEvent('farcaster-auth-start'));
        }}
        className={`${className} w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white`}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 32 32" 
          className="w-4 h-4 mr-2"
          fill="currentColor"
        >
          <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zM9.89 21.33c0-3.321 2.169-6.296 5.143-7.137v3.037a5.15 5.15 0 00-2.033 4.099h-3.11zm7.11 0a2.11 2.11 0 01-2.11-2.11c0-1.165.945-2.11 2.11-2.11 1.165 0 2.11.945 2.11 2.11a2.11 2.11 0 01-2.11 2.11zm5.11 0h-3.11a5.156 5.156 0 00-2.033-4.099v-3.037c2.973.84 5.143 3.816 5.143 7.137z" />
        </svg>
        Continue with Farcaster
      </Button>
    </div>
  );
}
