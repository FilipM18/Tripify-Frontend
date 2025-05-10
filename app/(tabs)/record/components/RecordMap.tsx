import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { PhotoUpload } from '../../../../hooks/useTrip';
import { useTheme } from '@/app/ThemeContext';
import { darkTheme } from '@/app/theme';

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
  const isDarkMode = theme.background === darkTheme.background;
  
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

  const styles = StyleSheet.create({
    map: {
      flex: 1,
    },
  });

  const lineWidth = 4;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        } : undefined}
        showsUserLocation
        followsUserLocation
        customMapStyle={isDarkMode ? darkMapStyle : []}
        accessibilityLabel="Mapa tvojej trasy"
      >
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeColor={trackColor}
            strokeWidth={lineWidth}
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
            pinColor={markerColor}
          />
        ))}
      </MapView>
    </View>
  );
}