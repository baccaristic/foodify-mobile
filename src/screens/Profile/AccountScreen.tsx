import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Contact, Mail, KeyRound, Phone, CreditCard, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';

import MainLayout from '~/layouts/MainLayout';
import useAuth from '~/hooks/useAuth';

const AccountScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const accountItems = [
    { label: user?.name ?? 'Guest User', icon: Contact },
    { label: user?.email ?? 'Add email address', icon: Mail },
    { label: 'Change Password', icon: KeyRound },
    { label: 'Change Phone Number', icon: Phone },
    { label: 'Payment methods', icon: CreditCard },
    { label: 'Manage Privacy', icon: ShieldCheck },
  ];

  return (
    <MainLayout
      showFooter
      enableHeaderCollapse={false}
      headerMaxHeight={50}
      headerMinHeight={40}
      activeTab="Profile"
      customHeader={
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerBack}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={s(16)} color="#CA251B" />
          </TouchableOpacity>
          <Text allowFontScaling={false} style={styles.headerTitle}>
            Account
          </Text>
          <View style={{ width: s(32) }} />
        </View>
      }
      mainContent={
        <View style={styles.body}>
          {accountItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity key={item.label} activeOpacity={0.85} style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconShell}>
                    <Icon size={s(18)} color="#CA251B" />
                  </View>
                  <Text allowFontScaling={false} style={styles.rowLabel}>
                    {item.label}
                  </Text>
                </View>
                <Text allowFontScaling={false} style={styles.rowAction}>
                </Text>
              </TouchableOpacity>
            );
          })}
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
    paddingHorizontal: '18@s',
    paddingVertical: '18@vs',
    gap: '10@vs',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '14@vs',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(23,33,58,0.08)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconShell: {
    width: '32@s',
    height: '32@s',
    borderRadius: '16@s',
    backgroundColor: 'rgba(202,37,27,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12@s',
  },
  rowLabel: {
    fontSize: '14@ms',
    color: '#17213A',
  },
  rowAction: {
    fontSize: '16@ms',
    color: '#CA251B',
    fontWeight: '600',
    marginRight: '4@s',
  },
});

export default AccountScreen;
