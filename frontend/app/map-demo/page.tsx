import { WorldMapDemo } from '@/components/map/WorldMapDemo';

export default function MapDemoPage() {
  return (
    <div className="min-h-screen bg-vintage-cream p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif text-vintage-brown-darker mb-8">
          🗺️ MapBox Visualization Demo
        </h1>

        {/* Map Container */}
        <div className="h-[600px] bg-white rounded-2xl p-4 shadow-vintage-lg">
          <WorldMapDemo />
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-vintage">
          <h3 className="font-serif text-xl text-vintage-brown-darker mb-4">
            Demo Account Trips
          </h3>
          <ul className="space-y-2 text-gray-700 columns-2">
            <li>🚂 European Grand Tour</li>
            <li>✈️ East Asia Explorer</li>
            <li>✈️ Southeast Asia Circuit</li>
            <li>✈️ Trans-Atlantic Journey</li>
            <li>✈️ Australia &amp; New Zealand</li>
            <li>✈️ South American Adventure</li>
            <li>🚂 Scandinavian Explorer</li>
            <li>✈️ Middle East &amp; India</li>
            <li>⛴️ Mediterranean Cruise</li>
            <li>🚗 North American Road Trip</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
