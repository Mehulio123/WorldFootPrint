import { WorldMapUser } from '@/components/map/WorldMapUser';

export default function MapUserPage() {
  return (
    <div className="min-h-screen bg-vintage-cream p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif text-vintage-brown-darker mb-8">
          My Travel Map
        </h1>
        <div className="h-[600px] bg-white rounded-2xl p-4 shadow-vintage-lg">
          <WorldMapUser />
        </div>
      </div>
    </div>
  );
}