import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

interface StatsDisplayProps {
  duration: number;
  distance: number;
  pace: number;
  elevationGain?: number;
}

export default function StatsDisplay({ duration, distance, pace, elevationGain = 0 }: StatsDisplayProps) {
  const { theme } = useTheme();
  const { isTablet, width } = useScreenDimensions();

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
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      zIndex: 10,
    },
    scrollContainer: {
      paddingVertical: isTablet ? 20 * Math.sqrt(scale) : 15 * Math.sqrt(scale),
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: isTablet ? 10 * Math.sqrt(scale) : 5 * Math.sqrt(scale),
    },
    statBox: {
      alignItems: 'center',
      paddingHorizontal: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      minWidth: width / 4, 
      flex: 1,
    },
    statValue: {
      fontWeight: 'bold',
      fontSize: isTablet ? 20 * scale : 16 * scale,
      color: theme.text,
    },
    statLabel: {
      fontSize: isTablet ? 14 * scale : 12 * scale,
      color: theme.secondText,
      marginTop: 2 * Math.sqrt(scale),
    },
  }));

  const accessibilityLabel = `Štatistiky: Čas ${formatDuration(duration)}, Vzdialenosť ${distance.toFixed(2)} kilometrov, Tempo ${pace.toFixed(1)} kilometrov za hodinu, Prevýšenie ${elevationGain.toFixed(0)} metrov`;

  const shouldScroll = width < 400 && !isTablet; 

  const StatsContent = () => (
    <View style={styles.statsRow}>
      <View style={styles.statBox}>
        <AccessibleText 
          variant={isTablet ? "header2" : "bodyBold"}
          style={styles.statValue}
        >
          {formatDuration(duration)}
        </AccessibleText>
        <AccessibleText variant="caption" style={styles.statLabel}>Čas</AccessibleText>
      </View>
      
      <View style={styles.statBox}>
        <AccessibleText 
          variant={isTablet ? "header2" : "bodyBold"}
          style={styles.statValue}
        >
          {distance.toFixed(2)}
        </AccessibleText>
        <AccessibleText variant="caption" style={styles.statLabel}>km</AccessibleText>
      </View>
      
      <View style={styles.statBox}>
        <AccessibleText 
          variant={isTablet ? "header2" : "bodyBold"}
          style={styles.statValue}
        >
          {pace.toFixed(1)}
        </AccessibleText>
        <AccessibleText variant="caption" style={styles.statLabel}>km/h</AccessibleText>
      </View>
      
      <View style={styles.statBox}>
        <AccessibleText 
          variant={isTablet ? "header2" : "bodyBold"}
          style={styles.statValue}
        >
          {elevationGain.toFixed(0)}
        </AccessibleText>
        <AccessibleText variant="caption" style={styles.statLabel}>m ↑</AccessibleText>
      </View>
    </View>
  );

  return (
    <View 
      style={styles.container} 
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel}
    >
      {shouldScroll ? (
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <StatsContent />
        </ScrollView>
      ) : (
        <View style={styles.scrollContainer}>
          <StatsContent />
        </View>
      )}
    </View>
  );
}