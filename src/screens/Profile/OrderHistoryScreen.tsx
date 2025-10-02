import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ClipboardList } from 'lucide-react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import {Image} from 'expo-image';

import MainLayout from '~/layouts/MainLayout';

const OrderHistoryScreen = () => {
  const navigation = useNavigation();

  return (
    <MainLayout
      showFooter
      enableHeaderCollapse={false}
      activeTab="Profile"
      customHeader={
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerBack}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text allowFontScaling={false} style={styles.backSymbol}>
              ?
            </Text>
          </TouchableOpacity>
          <Text allowFontScaling={false} style={styles.headerTitle}>
            Order History
          </Text>
          <View style={{ width: s(32) }} />
        </View>
      }
      mainContent={
        <View style={styles.body}>
          <Image source='../../assets/emptyHistory.png'/>
          <Text allowFontScaling={false} style={styles.emptyTitle}>
            Your order history is empty
          </Text>
          <Text allowFontScaling={false} style={styles.emptySubtitle}>
            Every great meal begins with a first click. Browse top-rated restaurants and build your flavor legacy today.
          </Text>
          <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton} onPress={() => navigation.navigate('Home' as never)}>
            <Text allowFontScaling={false} style={styles.primaryButtonLabel}>
              Start Ordering
            </Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
};

const styles = ScaledSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '16@s',
    paddingTop: vs(16),
    paddingBottom: vs(12),
  },
  headerBack: {
    width: '32@s',
    height: '32@s',
    borderRadius: '16@s',
    backgroundColor: 'rgba(202,37,27,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#17213A',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '24@s',
    paddingBottom: '32@vs',
    gap: '16@vs',
  },
  illustrationCircle: {
    width: '140@s',
    height: '140@s',
    borderRadius: '70@s',
    backgroundColor: 'rgba(202,37,27,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: '18@s',
    top: '18@vs',
    backgroundColor: '#CA251B',
    width: '36@s',
    height: '36@s',
    borderRadius: '18@s',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: '16@ms',
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#17213A',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: '13@ms',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: '20@vs',
    marginHorizontal: '12@s',
  },
  primaryButton: {
    marginTop: '12@vs',
    backgroundColor: '#17213A',
    paddingHorizontal: '28@s',
    paddingVertical: '12@vs',
    borderRadius: '22@ms',
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: '14@ms',
    fontWeight: '700',
  },
});

export default OrderHistoryScreen;
