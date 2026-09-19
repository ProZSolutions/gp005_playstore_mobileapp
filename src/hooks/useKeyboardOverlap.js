import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native'; 
export function useKeyboardOverlap(containerRef) {
  const [overlap, setOverlap] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const keyboardTop = e?.endCoordinates?.screenY;
      if (keyboardTop == null) return;
      containerRef.current?.measureInWindow((x, y, w, h) => {
        setOverlap(Math.max(0, y + h - keyboardTop));
      });
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setOverlap(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [containerRef]);

  return overlap;
}

export default useKeyboardOverlap;