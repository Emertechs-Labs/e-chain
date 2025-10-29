import { Metadata } from 'next';
import PricingCards from './components/PricingCards';

export const metadata: Metadata = {
  title: 'Pricing - Echain',
  description: 'Echain pricing plans for event organizers and attendees. Transparent, competitive pricing for Web3 event ticketing.',
};

export const revalidate = 300; // Revalidate every 5 minutes

async function getPricingTiers() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/pricing`, {
      next: { revalidate: 300 }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch pricing tiers');
      return [];
    }
    
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return [];
  }
}

export default async function PricingPage() {
  const pricingTiers = await getPricingTiers();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-300 mb-4">
            Choose the perfect plan for your event ticketing needs.
          </p>
          <p className="text-base text-slate-400">
            All plans include blockchain-verified tickets, NFT integration, and POAP support.
          </p>
        </div>
        
        <PricingCards tiers={pricingTiers} />
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            All plans include
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-slate-800/50 rounded-lg p-6">
              <div className="text-blue-400 text-3xl mb-2">🔗</div>
              <h3 className="text-white font-semibold mb-2">Blockchain Verified</h3>
              <p className="text-slate-400 text-sm">
                All tickets are NFTs on Base blockchain for maximum security and transparency.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6">
              <div className="text-blue-400 text-3xl mb-2">💎</div>
              <h3 className="text-white font-semibold mb-2">Low Gas Fees</h3>
              <p className="text-slate-400 text-sm">
                Base network ensures fast transactions with minimal fees (typically &lt;$0.01).
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6">
              <div className="text-blue-400 text-3xl mb-2">🎫</div>
              <h3 className="text-white font-semibold mb-2">NFT Tickets</h3>
              <p className="text-slate-400 text-sm">
                Transferable, tradable tickets with POAP integration for memorable events.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 bg-slate-800/30 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Platform Fee: 2.5%
          </h2>
          <p className="text-slate-300 mb-4">
            Echain charges a competitive 2.5% platform fee on all ticket sales. This includes:
          </p>
          <ul className="text-slate-400 space-y-2 list-disc list-inside">
            <li>Blockchain transaction processing</li>
            <li>NFT minting and metadata storage (IPFS)</li>
            <li>Platform maintenance and support</li>
            <li>Smart contract audits and security</li>
          </ul>
          <p className="text-slate-300 mt-4 text-sm">
            Note: Network gas fees are paid separately by buyers (typically &lt;$0.01 per transaction on Base).
          </p>
        </div>
      </div>
    </div>
  );
}