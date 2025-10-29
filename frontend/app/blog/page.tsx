import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Echain',
  description: 'Latest news, updates, and insights from the Echain team.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Blog</h1>
          <p className="text-xl text-slate-300 mb-8">
            Stay updated with the latest news and insights from Echain.
          </p>
          <div className="text-slate-400">
            Blog posts and articles coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}