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
    title?: string;
    info?: string;
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
  },

  getUserActivityStreak: async () => {
    const token = await getToken();
    if (!token) throw new Error('No authentication token found');

    const tripsData = await apiService.getUserTrips();
    if (!tripsData.success || !tripsData.trips || tripsData.trips.length === 0) {
      return { streak: 0, lastActivityDate: null };
    }

    const sortedTrips = tripsData.trips.sort((a: any, b: any) => 
      new Date(b.ended_at).getTime() - new Date(a.ended_at).getTime()
    );

    const tripsByDay = new Map();
    
    sortedTrips.forEach((trip: any) => {
      const tripDate = new Date(trip.ended_at);
      const dateKey = tripDate.toISOString().split('T')[0];
      
      if (!tripsByDay.has(dateKey)) {
        tripsByDay.set(dateKey, []);
      }
      tripsByDay.get(dateKey).push(trip);
    });

    const activityDates = Array.from(tripsByDay.keys()).sort().reverse();
    
    if (activityDates.length === 0) {
      return { streak: 0, lastActivityDate: null };
    }

    let streak = 0;
    const lastActivityDate = new Date(activityDates[0]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const timeDiff = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 3600 * 24));
    
    if (timeDiff > 1) {
      return { streak: 0, lastActivityDate };
    }
    
    let currentDate = new Date(lastActivityDate);
    
    while (activityDates.includes(currentDate.toISOString().split('T')[0])) {
      streak++;
      
      currentDate.setDate(currentDate.getDate() - 1);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (!activityDates.includes(dateStr)) {
        break;
      }
    }
    
    return { streak, lastActivityDate };
  }
  
};






export async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string,
  headers: Record<string, string> = {}
): Promise<T> {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}


export async function fetchTrip(tripId: string | number, token: string) {
  return apiRequest<{ success: boolean; trip: any; error?: string }>(
    `/trips/${encodeURIComponent(tripId)}`,
    'GET',
    undefined,
    token
  );
}

export async function login(email: string, password: string) {
  return apiRequest<{ success: boolean; token?: string; error?: string }>(
    '/auth/login',
    'POST',
    { email, password }
  );
}

export async function register(formData: FormData) {

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
    },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function verifyToken(token: string) {
  return apiRequest<{
    user: any; success: boolean 
  }>(
    '/auth/verify',
    'GET',
    undefined,
    token
  );
}

export async function postTrip(tripData: any, token: string) {
    return apiRequest<{ success: boolean; tripId?: string; error?: string }>(
        '/trips',
        'POST',
        tripData,
        token
    );
}

export async function fetchAllTrips(token: string) {
    return apiRequest<{ success: boolean; trips: any[]; error?: string }>(
        '/trips',
        'GET',
        undefined,
        token
    );
}

export async function fetchComments(tripId: string | number, token: string) {
    return apiRequest<{ success: boolean; comments: any[]; error?: string }>(
        `/comments/${encodeURIComponent(tripId)}`,
        'GET',
        undefined,
        token
    );
}



export const updateUserProfile = async (
  username?: string, 
  email?: string, 
  phoneNumber?: string, 
  imageUri?: string | null
) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const formData = new FormData();
    
    if (username) formData.append('username', username);
    if (email) formData.append('email', email);
    if (phoneNumber !== undefined) formData.append('phoneNumber', phoneNumber);
    
    if (imageUri) {
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('pfp', {
        uri: imageUri,
        name: filename,
        type,
      } as any);
    }
    
    console.log('Sending form data to server:', JSON.stringify(formData));
    
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};


export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No authentication token or user ID found');
    }
    
    const response = await fetch(`${API_URL}/auth/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Password change error:', error);
    throw error;
  }
};

export const addComment = async (tripId: string | number, commentText: string) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/comments/${tripId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ commentText }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Add comment error:', error);
    throw error;
  }
}

export const hitLike = async (tripId: string | number, type: string) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/likes/${type}/${tripId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Add like error:', error);
    throw error;
  }
}

export const getLikes = async (tripId: string | number, type: string) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/likes/${type}/${tripId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get likes error:', error);
    throw error;
  }
}

export async function getUserProfile() {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user profile');
    }
    
    const data = await response.json();
    console.log('API Response for user profile:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}