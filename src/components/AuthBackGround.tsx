import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const AuthBackground = () => {
  return (
    <View style={{ width: '100%', height: '100%' }}>
      <Image
        source={require('../../assets/background.png')}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: '100%',
        }}
      />
    </View>
  );
};

export default AuthBackground;
