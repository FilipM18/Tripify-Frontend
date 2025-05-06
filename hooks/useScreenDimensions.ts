import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export function useScreenDimensions() {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }) => {
        setDimensions(window);
      }
    );
    
    return () => subscription.remove();
  }, []);
  
  const isTablet = dimensions.width >= 768;
  const isLandscape = dimensions.width > dimensions.height;
  
  return {
    width: dimensions.width,
    height: dimensions.height,
    isTablet,
    isLandscape,
    isPhone: !isTablet
  };
}