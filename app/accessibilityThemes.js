import { lightTheme, darkTheme } from './theme';

const lightHighContrastTheme = {
  ...lightTheme,
  background: '#ffffff',
  secondBackground: '#f0f0f0',
  statBackground: '#ffffff',
  card: '#ffffff',
  text: '#000000',
  secondText: '#000000',
  thirdText: '#333333',
  border: '#000000',
  shadow: '#000000',
  primary: '#000099',
  secondary: '#006600', 
  onSurfaceVariant: '#333333',
};

const darkHighContrastTheme = {
  ...darkTheme,
  background: '#000000',
  secondBackground: '#0f0f0f',
  statBackground: '#000000',
  card: '#000000',
  text: '#ffffff',
  secondText: '#ffffff',
  thirdText: '#eeeeee',
  border: '#ffffff',
  shadow: '#ffffff',
  primary: '#00ddff',
  secondary: '#00ff66',
  onSurfaceVariant: '#ffffff',
};

// Deuteranopia
const lightDeuteranopiaTheme = {
  ...lightTheme,
  primary: '#0066CC', 
  secondary: '#9966CC', 
};

const darkDeuteranopiaTheme = {
  ...darkTheme,
  primary: '#3399FF',
  secondary: '#CC99FF', 
};

// Protanopia
const lightProtanopiaTheme = {
  ...lightTheme,
  primary: '#0099CC',
  secondary: '#6699CC',
};

const darkProtanopiaTheme = {
  ...darkTheme,
  primary: '#00CCFF',
  secondary: '#99CCFF',
};

// Tritanopia 
const lightTritanopiaTheme = {
  ...lightTheme,
  primary: '#CC6600',
  secondary: '#CC9900',
};

const darkTritanopiaTheme = {
  ...darkTheme,
  primary: '#FF9933',
  secondary: '#FFCC33',
};


export function createAccessibleTheme(isDarkMode, visionMode) {
  const baseTheme = isDarkMode ? { ...darkTheme } : { ...lightTheme };
  
  switch (visionMode) {
    case 'high-contrast':
      return isDarkMode ? darkHighContrastTheme : lightHighContrastTheme;
    
    case 'deuteranopia':
      return isDarkMode ? darkDeuteranopiaTheme : lightDeuteranopiaTheme;
      
    case 'protanopia':
      return isDarkMode ? darkProtanopiaTheme : lightProtanopiaTheme;
      
    case 'tritanopia':
      return isDarkMode ? darkTritanopiaTheme : lightTritanopiaTheme;
      
    case 'normal':
    default:
      return baseTheme;
  }
}