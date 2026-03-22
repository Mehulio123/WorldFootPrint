export function MockRecap() {
  return (
    <section className="py-20 bg-vintage-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-start justify-end gap-4 mb-8">
          <h2 className="text-4xl font-serif text-vintage-brown">
            Mock Travel Recap
          </h2>
          <svg className="w-8 h-8 text-vintage-brown mt-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
          </svg>
        </div>

        <div className="max-w-md ml-auto bg-white rounded-2xl shadow-lg p-8 border-2 border-vintage-brown/20">
          <h3 className="text-2xl font-serif text-vintage-brown mb-6">
            Your Footprint
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-vintage-cream rounded-lg">
              <span className="text-gray-700">Countries Traveled:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-vintage-brown">15</span>
                <span className="text-2xl">🗺️</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-vintage-cream rounded-lg">
              <span className="text-gray-700">Most Visited:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-vintage-brown">Japan</span>
                <span className="text-2xl">🇯🇵</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Mock Travel Recap Dashboard Preview
          </p>
        </div>
      </div>
    </section>
  );
}