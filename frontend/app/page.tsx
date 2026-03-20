export default function Home() {
  return (
    <div className="min-h-screen bg-vintage-cream flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-vintage-brown mb-4">
          My World Footprint
        </h1>
        <p className="text-2xl text-vintage-green">
          ✅ It works!
        </p>
        {/* this is a button for log in*/}
        <button className="bg-vintage-brown text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full font-semibold hover:opacity-80 transition-all text-sm sm:text-base lg:text-lg">
         Get Started
        </button>
      </div>
    </div>
  );
}