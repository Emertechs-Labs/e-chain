'use client';

import { useState } from 'react';
import { useGenerateReferralCode } from '@/app/hooks/useTransactions';
import { Button } from '@/components/ui';
import { toast } from 'sonner';

interface ReferralCodeGeneratorProps {
  onCodeGenerated?: (code: string) => void;
}

export function ReferralCodeGenerator({ onCodeGenerated }: ReferralCodeGeneratorProps) {
  const [codeInput, setCodeInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReferralCode = useGenerateReferralCode();

  const handleGenerateCode = async () => {
    if (!codeInput.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    if (codeInput.length < 3) {
      toast.error('Referral code must be at least 3 characters long');
      return;
    }

    setIsGenerating(true);
    try {
      await generateReferralCode.mutateAsync({
        code: codeInput.trim()
      });
      toast.success('Referral code generated successfully!');
      onCodeGenerated?.(codeInput.trim());
      setCodeInput('');
    } catch (error) {
      toast.error('Failed to generate referral code');
      console.error('Referral code generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔗</span>
        <h3 className="text-xl font-bold text-white">Generate Referral Code</h3>
      </div>
      <p className="text-gray-400 text-sm mb-4">
        Create a unique referral code to share with friends. Earn rewards when they purchase tickets using your code.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="referral-code" className="block text-sm font-medium text-gray-300 mb-2">
            Referral Code
          </label>
          <input
            id="referral-code"
            type="text"
            placeholder="Enter a unique code (e.g., MYCODE2024)"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            maxLength={20}
          />
          <p className="text-xs text-gray-500 mt-1">
            Use letters, numbers, and underscores only. Max 20 characters.
          </p>
        </div>

        <Button
          onClick={handleGenerateCode}
          disabled={isGenerating || !codeInput.trim()}
          className="w-full bg-purple-500 hover:bg-purple-400 text-white font-medium"
        >
          {isGenerating ? 'Generating...' : 'Generate Referral Code'}
        </Button>
      </div>
    </div>
  );
}