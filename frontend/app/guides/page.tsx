import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guides - Echain',
  description: 'Comprehensive guides for using the Echain platform.',
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Guides</h1>
          <p className="text-xl text-slate-300 mb-8">
            Learn how to create, manage, and promote your events on Echain.
          </p>
          <div className="text-slate-400">
            User guides and tutorials coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}