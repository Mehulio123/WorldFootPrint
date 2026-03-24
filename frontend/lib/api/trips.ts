import apiClient from './client';

export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  countryName: string;
  displayName?: string;
}

export interface Segment {
  id: string;
  tripId: string;
  origin: Place;
  destination: Place;
  transportMode: string;
  distance?: number;
  carbonFootprint?: number;
  departureTime?: string;
  arrivalTime?: string;
  notes?: string;
  order: number;
  resolvedCoordinates?: [number, number][]; // populated client-side after route resolution
}

export interface Trip {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isPublic: boolean;
  segments: Segment[];
}

export const tripsApi = {
  getAll: async (): Promise<Trip[]> => {
    const response = await apiClient.get('/trips');
    return response.data;
  },

  getById: async (id: string): Promise<Trip> => {
    const response = await apiClient.get(`/trips/${id}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
  }): Promise<Trip> => {
    const response = await apiClient.post('/trips', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/trips/${id}`);
  },

  addSegment: async (
    tripId: string,
    data: { originId: string; destinationId: string; transportMode: string; notes?: string }
  ): Promise<Segment> => {
    const response = await apiClient.post(`/trips/${tripId}/segments`, data);
    return response.data;
  },

  deleteSegment: async (segmentId: string): Promise<void> => {
    await apiClient.delete(`/trips/segments/${segmentId}`);
  },
};
