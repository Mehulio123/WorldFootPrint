export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left side - Text */}
        <div className="space-y-8">
          <h1 className="text-5xl lg:text-6xl font-serif text-vintage-brown leading-tight">
            Welcome to My<br />World Footprint
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-vintage-brown text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition">
              Demo
            </button>
            <button className="bg-white text-vintage-brown border-2 border-vintage-brown px-8 py-3 rounded-full font-semibold hover:bg-vintage-brown hover:text-white transition">
              Sign-up
            </button>
          </div>

          {/* Compass decoration */}
          <div className="pt-8">
            <svg className="w-16 h-16 text-vintage-brown opacity-40" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M50 10 L55 50 L50 90 L45 50 Z" fill="currentColor"/>
              <path d="M10 50 L50 45 L90 50 L50 55 Z" fill="currentColor" opacity="0.5"/>
            </svg>
          </div>
        </div>

        {/* Right side - Map placeholder */}
        <div className="relative h-96 lg:h-full min-h-96">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-vintage-green/10 to-vintage-brown/10 rounded-3xl">
            <div className="text-center">
              <div className="text-8xl mb-4">🗺️</div>
              <p className="text-sm text-gray-500">
                Add your watercolor map here
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}