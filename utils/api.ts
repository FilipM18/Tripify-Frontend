import { API_URL } from './constants';
import { getToken } from './auth';
import { PhotoLocation, MemoryCluster } from './types';



const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Request failed');
  }
  return response.json();
};

export const apiService = {
  //vsetky tripy
  getAllTrips: async () => {
    const token = await getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/trips`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },

  getTripPhotos: async (tripId: number) => {
    const token = await getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/trips/${tripId}/photos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return handleResponse(response);
  },
  getUserTrips: async () => {
    const token = await getToken();
    if (!token) throw new Error('No authentication token found');
    const response = await fetch(`${API_URL}/mytrips`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(response);
  },

getAllGeoPhotos: async () => {
  const token = await getToken();
  if (!token) throw new Error('No authentication token found');
  

  // Get user's trips
  const tripsData = await apiService.getUserTrips();
  //console.log('[getAllGeoPhotos] User trips:', tripsData);

  const allPhotos: PhotoLocation[] = [];
  for (const trip of tripsData.trips) {
    //console.log(`[getAllGeoPhotos] Fetching photos for trip: ${trip.id}`);
    try {
      const photosResponse = await fetch(`${API_URL}/trips/${trip.id}/photos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const photosData = await handleResponse(photosResponse);
      //console.log(`[getAllGeoPhotos] Photos for trip ${trip.id}:`, photosData);
      
      if (photosData.success) {

        const parsedPhotos = photosData.photos.map((photo: any) => ({
          ...photo,
          latitude: typeof photo.latitude === 'string' ? 
            parseFloat(photo.latitude) : photo.latitude,
          longitude: typeof photo.longitude === 'string' ?
            parseFloat(photo.longitude) : photo.longitude
        }));
        allPhotos.push(...parsedPhotos);
      }
    } catch (err) {
      //console.warn(`[getAllGeoPhotos] Error fetching photos for trip ${trip.id}:`, err);
    }
  }

  // Filter valid coordinates
  const filtered = allPhotos.filter((photo: PhotoLocation) => 
    !isNaN(photo.latitude) && 
    !isNaN(photo.longitude)
  );
  
  //console.log('[getAllGeoPhotos] All fetched photos (filtered):', filtered);
  return filtered;
},

  createTrip: async (tripData: {
    userId: string;
    startedAt: string;
    endedAt: string;
    distanceKm: number;
    durationSeconds: number;
    averagePace: number;
    route: Array<{latitude: number; longitude: number}>;
    type: string;
  }) => {
    const token = await getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/trips`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tripData),
    });
    
    return handleResponse(response);
  },

// Upload a photo to a trip
uploadTripPhoto: async ({
  tripId,
  userId,
  uri,
  latitude,
  longitude,
  description,
}: {
  tripId: number | string;
  userId: string;
  uri: string;
  latitude: number;
  longitude: number;
  description?: string;
}) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication token found');
  
  const formData = new FormData();
  formData.append('photo', {
    uri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);
  
  formData.append('userId', userId);
  formData.append('latitude', latitude.toString());
  formData.append('longitude', longitude.toString());
  if (description) formData.append('description', description);

  const response = await fetch(`${API_URL}/trips/${tripId}/photos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
  
  return handleResponse(response);
}
  
  
};


