import React from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme, FONT_SIZES, VISION_MODES } from '../../ThemeContext';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

export default function AccessibilityScreen() {
  const { 
    fontScale, 
    changeFontSize,
    visionMode,
    changeVisionMode,
    theme
  } = useTheme();
  
  const { isTablet } = useScreenDimensions();

  const fontSizeOptions = [
    { label: 'Malé', value: FONT_SIZES.SMALL },
    { label: 'Normálne', value: FONT_SIZES.NORMAL },
    { label: 'Veľké', value: FONT_SIZES.LARGE },
    { label: 'Extra veľké', value: FONT_SIZES.EXTRA_LARGE },
  ];

  const visionModeOptions = [
    { label: 'Normálny', value: VISION_MODES.NORMAL },
    { label: 'Vysoký kontrast', value: VISION_MODES.HIGH_CONTRAST },
    { label: 'Deuteranopia (zelená slepota)', value: VISION_MODES.DEUTERANOPIA },
    { label: 'Protanopia (červená slepota)', value: VISION_MODES.PROTANOPIA },
    { label: 'Tritanopia (modrá slepota)', value: VISION_MODES.TRITANOPIA },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      padding: isTablet ? 20 : 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      alignItems: 'center',
    },
    backButton: {
      paddingRight: 16,
    },
    headerTitle: {
      fontSize: isTablet ? 24 * fontScale : 20 * fontScale,
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
    },
    sectionTitle: {
      fontSize: isTablet ? 20 * fontScale : 16 * fontScale,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: 20,
      marginBottom: 10,
      paddingHorizontal: isTablet ? 20 : 16,
    },
    sectionDescription: {
      fontSize: isTablet ? 16 * fontScale : 14 * fontScale,
      color: theme.secondText,
      marginBottom: 15,
      paddingHorizontal: isTablet ? 20 : 16,
    },
    optionGroup: {
      backgroundColor: theme.card,
      borderRadius: 10,
      marginHorizontal: isTablet ? 20 : 16,
      marginBottom: 20,
      overflow: 'hidden',
    },
    option: {
      padding: isTablet ? 18 : 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    optionText: {
      fontSize: isTablet ? 18 * fontScale : 16 * fontScale,
      color: theme.text,
    },
    selectedOption: {
      backgroundColor: theme.statBackground,
    },
    selectedIndicator: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.primary,
    },
    previewText: {
      fontSize: isTablet ? 18 * fontScale : 16 * fontScale,
      color: theme.text,
      lineHeight: 24 * fontScale,
      textAlign: 'center',
      marginVertical: 20,
      marginHorizontal: isTablet ? 20 : 16,
    },
    previewBox: {
      padding: 16,
      backgroundColor: theme.card,
      borderRadius: 10,
      marginHorizontal: isTablet ? 20 : 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    previewTitle: {
      fontSize: isTablet ? 18 * fontScale : 16 * fontScale,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    primaryColorBox: {
      width: 100,
      height: 40,
      backgroundColor: theme.primary,
      borderRadius: 8,
      marginVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14 * fontScale,
    },
    secondaryColorBox: {
      width: 100,
      height: 40,
      backgroundColor: theme.secondary,
      borderRadius: 8,
      marginBottom: 10,
      justifyContent: 'center',
      alignItems: 'center',
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={{fontSize: 24 * fontScale, color: theme.text}}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prístupnosť</Text>
      </View>
      
      <ScrollView>
        <Text style={styles.sectionTitle}>Veľkosť textu</Text>
        <Text style={styles.sectionDescription}>
          Prispôsobte veľkosť textu v celej aplikácii.
        </Text>
        
        <View style={styles.optionGroup}>
          {fontSizeOptions.map((option) => (
            <TouchableOpacity 
              key={option.label}
              style={[
                styles.option, 
                fontScale === option.value && styles.selectedOption,
                option.label === fontSizeOptions[fontSizeOptions.length - 1].label ? { borderBottomWidth: 0 } : {}
              ]}
              onPress={() => changeFontSize(option.value)}
            >
              <Text style={styles.optionText}>{option.label}</Text>
              {fontScale === option.value && <View style={styles.selectedIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>Ukážka veľkosti textu</Text>
          <Text style={styles.previewText}>
            Tento text ukazuje, ako bude vyzerať vaša zvolená veľkosť textu v celej aplikácii.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Režim zobrazenia</Text>
        <Text style={styles.sectionDescription}>
          Vyberte režim farieb, ktorý najlepšie vyhovuje vášmu zraku.
        </Text>
        
        <View style={styles.optionGroup}>
          {visionModeOptions.map((option) => (
            <TouchableOpacity 
              key={option.label}
              style={[
                styles.option, 
                visionMode === option.value && styles.selectedOption,
                option.label === visionModeOptions[visionModeOptions.length - 1].label ? { borderBottomWidth: 0 } : {}
              ]}
              onPress={() => changeVisionMode(option.value)}
            >
              <Text style={styles.optionText}>{option.label}</Text>
              {visionMode === option.value && <View style={styles.selectedIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>Ukážka farieb</Text>
          <View style={styles.primaryColorBox}>
            <Text style={styles.colorText}>Primárna</Text>
          </View>
          <View style={styles.secondaryColorBox}>
            <Text style={styles.colorText}>Sekundárna</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}