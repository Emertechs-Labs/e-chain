import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Echain',
  description: 'Privacy policy for Echain - Blockchain Event Platform',
};

export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-cyan-400">Privacy Policy</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 mb-6">
              Last updated: October 1, 2025
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Information We Collect</h2>
            <p className="text-slate-300 mb-6">
              We collect information you provide directly to us, such as when you create an account,
              purchase tickets, or contact us for support.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">How We Use Your Information</h2>
            <p className="text-slate-300 mb-6">
              We use the information we collect to provide, maintain, and improve our services,
              process transactions, and communicate with you.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Information Sharing</h2>
            <p className="text-slate-300 mb-6">
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except as described in this policy.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Contact Us</h2>
            <p className="text-slate-300 mb-6">
              If you have any questions about this Privacy Policy, please contact us at
              privacy@echain.events
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}