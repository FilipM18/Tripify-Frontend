import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

interface StatsDisplayProps {
  duration: number;
  distance: number;
  pace: number;
}

export default function StatsDisplay({ duration, distance, pace }: StatsDisplayProps) {
  const { theme } = useTheme();
  const { isTablet } = useScreenDimensions();

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = useScaledStyles((scale) => ({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: isTablet ? 20 * Math.sqrt(scale) : 15 * Math.sqrt(scale),
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      zIndex: 10,
    },
    statBox: {
      alignItems: 'center',
      paddingHorizontal: isTablet ? 15 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
    },
  }));

  const accessibilityLabel = `Štatistiky: Čas ${formatDuration(duration)}, Vzdialenosť ${distance.toFixed(2)} kilometrov, Tempo ${pace.toFixed(1)} kilometrov za hodinu`;

  return (
    <View 
      style={styles.container} 
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.statBox}>
        <AccessibleText 
          variant={isTablet ? "header2" : "bodyBold"}
        >
          {formatDuration(duration)}
        </AccessibleText>
        <AccessibleText variant="caption">Čas</AccessibleText>
      </View>
      
      <View style={styles.statBox}>
        <AccessibleText 
          variant={isTablet ? "header2" : "bodyBold"}
        >
          {distance.toFixed(2)}
        </AccessibleText>
        <AccessibleText variant="caption">Vzdialenosť (km)</AccessibleText>
      </View>
      
      <View style={styles.statBox}>
        <AccessibleText 
          variant={isTablet ? "header2" : "bodyBold"}
        >
          {pace.toFixed(1)}
        </AccessibleText>
        <AccessibleText variant="caption">Tempo (km/h)</AccessibleText>
      </View>
    </View>
  );
}