import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { PhotoUpload } from '../../../../hooks/useTrip';
import { useTheme } from '@/app/ThemeContext';
import { darkTheme } from '@/app/theme';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { useScaledStyles } from '@/utils/accessibilityUtils';

//https://mapstyle.withgoogle.com/ - keby chceme inu :)
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

interface RecordMapProps {
  route: Array<{latitude: number, longitude: number}>;
  currentLocation: {latitude: number, longitude: number} | null;
  photos: PhotoUpload[];
}

export default function RecordMap({ route, currentLocation, photos }: RecordMapProps) {
  const { theme, visionMode } = useTheme();
  const { isTablet } = useScreenDimensions();
  const isDarkMode = theme.background === darkTheme.background;
  
  // Track and marker colors based on vision mode
  let trackColor = '#4CAF50'; 
  let markerColor = '#d32f2f';
  
  switch(visionMode) {
    case 'high-contrast':
      trackColor = isDarkMode ? '#00FFAA' : '#006600';
      markerColor = isDarkMode ? '#FFFF00' : '#990000';
      break;
    case 'deuteranopia':
      trackColor = '#0066CC'; 
      markerColor = '#FF6600';
      break;
    case 'protanopia':
      trackColor = '#0099CC';
      markerColor = '#FFCC00';
      break;
    case 'tritanopia':
      trackColor = '#669900';
      markerColor = '#CC6600'
      break;
  }

  // Line width should be thicker on tablets for better visibility
  const lineWidth = isTablet ? 6 : 4;

  // Calculate the appropriate zoom level based on route
  const getInitialRegion = () => {
    // If we have a current location, center on it
    if (currentLocation) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }
    
    // If we have a route but no current location, calculate bounds to include all points
    if (route.length > 0) {
      // Find min/max coordinates
      let minLat = route[0].latitude;
      let maxLat = route[0].latitude;
      let minLng = route[0].longitude;
      let maxLng = route[0].longitude;
      
      route.forEach(point => {
        minLat = Math.min(minLat, point.latitude);
        maxLat = Math.max(maxLat, point.latitude);
        minLng = Math.min(minLng, point.longitude);
        maxLng = Math.max(maxLng, point.longitude);
      });
      
      // Add padding
      const latDelta = (maxLat - minLat) * 1.2 || 0.01;
      const lngDelta = (maxLng - minLng) * 1.2 || 0.01;
      
      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(latDelta, 0.005), // Minimum zoom level
        longitudeDelta: Math.max(lngDelta, 0.005),
      };
    }
    
    // Default region (Slovakia)
    return {
      latitude: 48.669,
      longitude: 19.699,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  const styles = useScaledStyles((scale) => ({
    container: {
      flex: 1,
      position: 'relative',
    },
    map: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
  }));

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={getInitialRegion()}
        showsUserLocation
        followsUserLocation
        customMapStyle={isDarkMode ? darkMapStyle : []}
        accessibilityLabel="Mapa tvojej trasy"
        showsCompass={true}
        showsScale={isTablet}
        zoomEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        moveOnMarkerPress={true}
      >
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeColor={trackColor}
            strokeWidth={lineWidth}
            lineCap="round"
            lineJoin="round"
          />
        )}
        
        {photos.map((photo, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: photo.latitude,
              longitude: photo.longitude,
            }}
            title={`Fotka ${index + 1}`}
            description={undefined} // Remove reference to photo.description since it doesn't exist in the type
            pinColor={markerColor}
            tracksViewChanges={false} // Performance optimization
          />
        ))}
      </MapView>
    </View>
  );
}