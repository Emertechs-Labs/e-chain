import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Echain',
  description: 'Terms of service for Echain - Blockchain Event Platform',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-cyan-400">Terms of Service</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 mb-6">
              Last updated: October 1, 2025
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Acceptance of Terms</h2>
            <p className="text-slate-300 mb-6">
              By accessing and using Echain, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Use License</h2>
            <p className="text-slate-300 mb-6">
              Permission is granted to temporarily access the materials (information or software)
              on Echain&apos;s website for personal, non-commercial transitory viewing only.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">NFT Tickets</h2>
            <p className="text-slate-300 mb-6">
              NFT tickets purchased through our platform are subject to the terms of the smart
              contracts deployed on the Base blockchain. All sales are final.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Disclaimer</h2>
            <p className="text-slate-300 mb-6">
              The materials on Echain&apos;s website are provided on an &apos;as is&apos; basis. Echain makes
              no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Contact Information</h2>
            <p className="text-slate-300 mb-6">
              For questions about these Terms of Service, please contact us at legal@echain.events
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}