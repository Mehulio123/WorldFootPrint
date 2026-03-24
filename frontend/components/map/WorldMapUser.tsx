'use client'; // This component uses client-side features like state and effects
import { useEffect, useState } from 'react'; //allows us to manage state and side effects in the component
import { WorldMap } from './WorldMap'; //mapbox component
import type { Trip } from '@/lib/api/trips';
import {tripsApi} from '@/lib/api/trips'; //has the get all call with auth
import {useRouter } from 'next/navigation';


export function WorldMapUser() {
    const [trips, setTrips] = useState<Trip[]>([]);//state to hold the trips data
    const [loading, setLoading] = useState(true);//state to track loading status
    const [error, setError] = useState<string | null>(null);//state to track any error messages
    const router = useRouter(); // Get the router instance for navigation

    useEffect(() => { //we did use effect to call all the trips from the back end and give it to state
        const token = localStorage.getItem('token'); // Get the token from localStorage
        if (!token) {
            router.push('/auth/login'); // Redirect to login if no token is found
            setLoading(false);
            return;
        }
    tripsApi
        .getAll()
        .then((trips) => setTrips(trips)) // Update state with fetched trips
        .catch(() => setError('Failed to load demo trips'))
        .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
        <div className="w-full h-full flex items-center justify-center bg-vintage-cream rounded-2xl">
            <p className="text-vintage-brown font-serif text-lg">Loading trips...</p>
        </div>
        );
    }

    if (error) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-vintage-cream rounded-2xl">
        <p className="text-red-500 font-serif text-lg">{error}</p>
        </div>
    );
    }

    if (trips.length === 0) {
        return (
        <div className="w-full h-full flex items-center justify-center bg-vintage-cream rounded-2xl">
            <p className="text-vintage-brown font-serif text-lg">No trips found. Start planning your adventures!</p>
        </div>
        );
    }

    return <WorldMap trips={trips} />; // Render the WorldMap component with the fetched trips

}