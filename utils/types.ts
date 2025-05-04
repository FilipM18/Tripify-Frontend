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
  

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  tel_num?: string | null;
  photo_url?: string | null;
  created_at?: string;
}

export interface TabOption {
  key: string;
  label: string;
}

export interface UserStats {
  followers: number;
  following: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  date: string;
  distance_km: number;
  duration_seconds: number;
  calories?: number;
}

export interface Trip {
  id: string;
  type: string;
  distance_km: number;
  duration_seconds: number;
  calories?: number;
  ended_at: string;
}
