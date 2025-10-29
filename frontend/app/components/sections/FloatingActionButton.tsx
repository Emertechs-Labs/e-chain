import Link from 'next/link';

export function FloatingActionButton() {
  return (
    <div className="fixed bottom-8 right-8 z-40">
      <div className="relative group">
        <button className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center">
          <span className="text-2xl">⚡</span>
        </button>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Quick Actions
        </div>

        {/* Action Menu */}
        <div className="absolute bottom-full right-0 mb-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="bg-slate-800 rounded-2xl p-2 shadow-2xl border border-slate-700 min-w-48">
            <Link
              href="/events"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 transition-colors text-white"
            >
              <span className="text-cyan-400">🔍</span>
              <span>Explore Events</span>
            </Link>
            <Link
              href="/events/create"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 transition-colors text-white"
            >
              <span className="text-purple-400">🎯</span>
              <span>Create Event</span>
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 transition-colors text-white"
            >
              <span className="text-green-400">🛒</span>
              <span>Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}