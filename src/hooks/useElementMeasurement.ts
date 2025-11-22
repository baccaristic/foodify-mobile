import { useRef, useState, useCallback } from 'react';
import { View, findNodeHandle, UIManager } from 'react-native';

interface ElementMeasurement {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useElementMeasurement = () => {
  const [measurement, setMeasurement] = useState<ElementMeasurement | null>(null);
  const elementRef = useRef<View>(null);

  const measureElement = useCallback(() => {
    if (elementRef.current) {
      const handle = findNodeHandle(elementRef.current);
      if (handle) {
        UIManager.measureInWindow(
          handle,
          (x: number, y: number, width: number, height: number) => {
            setMeasurement({ x, y, width, height });
          }
        );
      }
    }
  }, []);

  return {
    elementRef,
    measurement,
    measureElement,
  };
};
