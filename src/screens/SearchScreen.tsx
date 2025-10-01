import React from 'react';
import { View, Text } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

import MainLayout from '~/layouts/MainLayout';

const SearchScreen = () => {
  return (
    <MainLayout
      showFooter
      activeTab="Search"
      enableHeaderCollapse={false}
      customHeader={
        <View style={styles.header}>
          <Text allowFontScaling={false} style={styles.headerTitle}>
            Search
          </Text>
        </View>
      }
      mainContent={
        <View style={styles.body}>
          <Text allowFontScaling={false} style={styles.placeholder}>
            Search experience coming soon.
          </Text>
        </View>
      }
    />
  );
};

const styles = ScaledSheet.create({
  header: {
    paddingHorizontal: '18@s',
    paddingVertical: '16@vs',
  },
  headerTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#17213A',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    color: '#4B5563',
    fontSize: '14@ms',
  },
});

export default SearchScreen;
