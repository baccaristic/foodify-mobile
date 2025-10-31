import React, { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle, type ImageStyle } from 'react-native';
import type { ImageProps } from 'expo-image';
import { Image } from 'expo-image';
import { BASE_API_URL } from '@env';

import SkeletonPulse from './skeletons/SkeletonPulse';

interface RemoteImageWithSkeletonProps {
  imagePath?: string | null;
  containerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  skeletonStyle?: StyleProp<ViewStyle>;
  contentFit?: ImageProps['contentFit'];
}

const RemoteImageWithSkeleton: React.FC<RemoteImageWithSkeletonProps> = ({
  imagePath,
  containerStyle,
  imageStyle,
  skeletonStyle,
  contentFit = 'cover',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [imagePath]);

  const hasImage = Boolean(imagePath);
  const shouldShowSkeleton = !hasImage || !isLoaded || hasError;

  return (
    <View style={[styles.baseContainer, containerStyle]}>
      {shouldShowSkeleton ? (
        <SkeletonPulse style={[StyleSheet.absoluteFillObject, styles.baseSkeleton, skeletonStyle]} />
      ) : null}
      {hasImage && !hasError ? (
        <Image
          source={{ uri: `${BASE_API_URL}/auth/image/${imagePath}` }}
          style={[StyleSheet.absoluteFillObject, imageStyle]}
          contentFit={contentFit}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : null}
    </View>
  );
};

export default RemoteImageWithSkeleton;

const styles = StyleSheet.create({
  baseContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(226, 232, 240, 0.45)',
  },
  baseSkeleton: {
    backgroundColor: 'rgba(226, 232, 240, 0.7)',
  },
});
