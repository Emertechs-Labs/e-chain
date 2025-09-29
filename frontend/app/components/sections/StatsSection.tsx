export function StatsSection() {
  return (
    <section id="stats" className="py-6 md:py-8 bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-1">10K+</div>
            <div className="text-gray-400">Events Created</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-1">50K+</div>
            <div className="text-gray-400">Tickets Sold</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-1">25K+</div>
            <div className="text-gray-400">Active Users</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-pink-400 mb-1">$2M+</div>
            <div className="text-gray-400">Volume Traded</div>
          </div>
        </div>
      </div>
    </section>
  );
}