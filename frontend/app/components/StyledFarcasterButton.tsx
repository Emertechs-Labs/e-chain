'use client';

import { SignInButton, StatusAPIResponse } from '@farcaster/auth-kit';
import { Users } from 'lucide-react';
import Image from 'next/image';

interface StyledFarcasterButtonProps {
  onSuccess: (user: StatusAPIResponse) => void;
}

export function StyledFarcasterButton({ onSuccess }: StyledFarcasterButtonProps) {
  return (
    <div className="relative w-full">
      {/* Custom styled container */}
      <div className="w-full flex justify-center">
        <div className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 p-0.5 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-200">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Users className="w-5 h-5" />
                Sign in with Farcaster
              </div>
            </div>
          </div>
          
          {/* Farcaster SignInButton with opacity overlay for styling */}
          <div className="relative">
            <SignInButton 
              onSuccess={onSuccess} 
            />
            {/* We add an overlay to style the button without using className */}
            <style jsx global>{`
              /* Target Farcaster button by its class */
              [data-farcaster-button] {
                width: 100% !important;
                padding: 1rem 1.5rem !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                opacity: 0 !important; 
                height: 56px !important;
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}