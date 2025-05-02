export interface PhotoLocation {
    id: number;
    trip_id: number;
    user_id: number;
    photo_url: string;
    latitude: number;
    longitude: number;
    description: string | null;
    created_at: string;
  }
  
  export interface MemoryCluster {
    coordinate: {
      latitude: number;
      longitude: number;
    };
    photos: PhotoLocation[];
  }
  