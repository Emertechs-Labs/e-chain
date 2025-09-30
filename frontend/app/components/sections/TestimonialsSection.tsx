export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-6 md:py-8 bg-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3 text-green-400">
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium tracking-wider uppercase">Success Stories</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            What Our Community Says
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-slate-800/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-700 hover:border-green-500/50 transition-all duration-300">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Alex Chen</div>
                <div className="text-gray-400 text-xs">Event Organizer</div>
              </div>
            </div>
            <div className="text-gray-300 mb-3 text-sm">
              &ldquo;Echain revolutionized how I run events. The NFT tickets and transparent transactions gave my attendees peace of mind.&rdquo;
            </div>
            <div className="flex text-yellow-400 text-sm">
              ★★★★★
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Sarah Johnson</div>
                <div className="text-gray-400 text-xs">Attendee</div>
              </div>
            </div>
            <div className="text-gray-300 mb-3 text-sm">
              &ldquo;Finally, event tickets that I can trust! The POAP rewards make attending events even more exciting.&rdquo;
            </div>
            <div className="flex text-yellow-400 text-sm">
              ★★★★★
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Marcus Rodriguez</div>
                <div className="text-gray-400 text-xs">Web3 Developer</div>
              </div>
            </div>
            <div className="text-gray-300 mb-3 text-sm">
              &ldquo;The transparency and security of blockchain-based ticketing is exactly what the industry needed.&rdquo;
            </div>
            <div className="flex text-yellow-400 text-sm">
              ★★★★★
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}