import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export function useOrientation() {
  const [dims, setDims] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    // RN < 0.65: addEventListener returns void, remove via
    // Dimensions.removeEventListener. RN >= 0.65: it returns a
    // subscription object with its own .remove(). Handle both.
    const onChange = ({ window }) => setDims(window);
    const subscription = Dimensions.addEventListener('change', onChange);

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      } else {
        Dimensions.removeEventListener('change', onChange);
      }
    };
  }, []);

  const { width, height } = dims;
  return {
    width,
    height,
    isLandscape: width > height,
  };
}