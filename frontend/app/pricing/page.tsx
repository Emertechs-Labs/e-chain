import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Echain',
  description: 'Echain pricing plans for event organizers and attendees.',
};

export const dynamic = 'force-dynamic';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Pricing</h1>
          <p className="text-xl text-slate-300 mb-8">
            Choose the perfect plan for your event ticketing needs.
          </p>
          <div className="text-slate-400">
            Pricing information coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}