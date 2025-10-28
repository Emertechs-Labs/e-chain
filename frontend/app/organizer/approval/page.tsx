'use client';

// Force dynamic rendering to avoid prerendering issues with Web3 hooks
export const dynamic = 'force-dynamic';

import { OrganizerApprovalDashboard } from '@/components/organizer/OrganizerApprovalDashboard';
import { useRouter } from 'next/navigation';

export default function OrganizerApprovalPage() {
  const router = useRouter();

  const handleApprovalSuccess = () => {
    // Redirect to create event page or dashboard
    router.push('/events/create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Become an Event Organizer
            </h1>
            <p className="text-xl text-gray-300">
              Join our community of verified organizers and start creating amazing events
            </p>
          </div>

          <OrganizerApprovalDashboard onApprovalSuccess={handleApprovalSuccess} />

          <div className="mt-8 text-center">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                What you get as a verified organizer:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Create unlimited events</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Access to organizer dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Priority support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Revenue sharing opportunities</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Community recognition</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Advanced analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}