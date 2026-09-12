 
export const getColorValue = colorName => {
  if (!colorName) {
    return null;
  }

  const colorMap = {
    pink: '#FFC0CB',
    red: '#FF0000',
    green: '#008000',
    blue: '#0000FF',
    black: '#000000',
    white: '#FFFFFF',
    yellow: '#FFFF00',
    orange: '#FFA500',
    purple: '#800080',
    grey: '#808080',
    gray: '#808080',
    brown: '#A52A2A',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    gold: '#FFD700',
    silver: '#C0C0C0',
    navy: '#000080',
    maroon: '#800000',
    olive: '#808000',
    lime: '#00FF00',
    teal: '#008080',
    indigo: '#4B0082',
    violet: '#EE82EE',
  };

  const key = colorName
    ?.toLowerCase()
    ?.trim();

  return colorMap[key] || null;
};