import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-6 md:py-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Experience the Future?
        </h2>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Join thousands of users already creating and attending blockchain-powered events
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/events"
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-200"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </section>
  );
}