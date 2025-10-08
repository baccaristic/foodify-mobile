import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { User, Phone, Mail, Lock, Star, Languages, ChevronRight } from 'lucide-react-native';
import { Image } from 'expo-image';
import MainLayout from '~/layouts/MainLayout';
import useAuth from '~/hooks/useAuth';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';

import ModifyNameOverlay from '~/components/ProfilSettings/ModifyNameOverlay';
import ModifyEmailOverlay from '~/components/ProfilSettings/ModifyEmailOverlay';
import ModifyPhoneOverlay from '~/components/ProfilSettings/ModifyPhoneOverlay';
import ModifyPasswordOverlay from '~/components/ProfilSettings/ModifyPasswordOverlay';

const palette = {
  accent: '#CA251B',
  accentDark: '#17213A',
};

const ProfileSettingsScreen = () => {
  const { user } = useAuth();
  const displayName = user?.name ?? 'Flen Foulani';
  const displayEmail = user?.email ?? 'flenfoulani@email.com';
  const displayPhone = user?.phone ?? '987654432';

  const [visibleOverlay, setVisibleOverlay] = useState<string | null>(null);

  const openOverlay = (type: string) => setVisibleOverlay(type);
  const closeOverlay = () => setVisibleOverlay(null);

  const customHeader = (
    <View>
      <HeaderWithBackButton title="Profile Settings" titleMarginLeft={s(80)} />
    </View>
  );

  const mainContent = (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <Image source={{ uri: 'https://i.pravatar.cc/150?img=5' }} style={styles.avatar} />
        <Text allowFontScaling={false} style={styles.userName}>{displayName}</Text>
      </View>

      <Text allowFontScaling={false} style={styles.sectionTitle}>Personal informations</Text>
      <View style={styles.infoCard}>
        {/* Modify Name */}
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <User size={20} color={palette.accent} />
            <Text allowFontScaling={false} style={styles.infoText}>{displayName}</Text>
          </View>
          <TouchableOpacity style={styles.modifyButton} onPress={() => openOverlay('name')}>
            <Text allowFontScaling={false} style={styles.modifyText}>Modify</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Modify Phone */}
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Phone size={20} color={palette.accent} />
            <Text allowFontScaling={false} style={styles.infoText}>{displayPhone}</Text>
          </View>
          <TouchableOpacity style={styles.modifyButton} onPress={() => openOverlay('phone')}>
            <Text allowFontScaling={false} style={styles.modifyText}>Modify</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Modify Email */}
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Mail size={20} color={palette.accent} />
            <Text allowFontScaling={false} style={styles.infoText}>{displayEmail}</Text>
          </View>
          <TouchableOpacity style={styles.modifyButton} onPress={() => openOverlay('email')}>
            <Text allowFontScaling={false} style={styles.modifyText}>Modify</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Modify Password */}
        <TouchableOpacity style={styles.infoRow} onPress={() => openOverlay('password')}>
          <View style={styles.infoLeft}>
            <Lock size={20} color={palette.accent} />
            <Text allowFontScaling={false} style={styles.infoText}>Change Password</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text allowFontScaling={false} style={styles.sectionTitle}>Other</Text>
      <View style={styles.infoCard}>
        <TouchableOpacity style={styles.linkRow} activeOpacity={0.8}>
          <View style={styles.infoLeft}>
            <Star size={20} color={palette.accent} />
            <Text allowFontScaling={false} style={styles.infoText}>Points & Level</Text>
          </View>
          <ChevronRight size={s(18)} color={palette.accent} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.linkRow} activeOpacity={0.8}>
          <View style={styles.infoLeft}>
            <Languages size={20} color={palette.accent} />
            <Text allowFontScaling={false} style={styles.infoText}>Language</Text>
          </View>
          <ChevronRight size={s(18)} color={palette.accent} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <>
      <MainLayout
        showHeader
        showFooter
        collapsedHeader={false}
        enableHeaderCollapse={false}
        headerMaxHeight={vs(70)}
        headerMinHeight={vs(30)}
        activeTab="Profile"
        enforceResponsiveHeaderSize={false}
        customHeader={customHeader}
        mainContent={mainContent}
      />

      {/* Overlays */}
      <Modal visible={visibleOverlay === 'name'} animationType="slide" transparent>
        <ModifyNameOverlay onClose={closeOverlay} />
      </Modal>
      <Modal visible={visibleOverlay === 'email'} animationType="slide" transparent>
        <ModifyEmailOverlay onClose={closeOverlay} />
      </Modal>
      <Modal visible={visibleOverlay === 'phone'} animationType="slide" transparent>
        <ModifyPhoneOverlay onClose={closeOverlay} />
      </Modal>
      <Modal visible={visibleOverlay === 'password'} animationType="slide" transparent>
        <ModifyPasswordOverlay onClose={closeOverlay} />
      </Modal>
    </>
  );
};

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: '16@s', paddingVertical: '12@vs' },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12@ms',
    alignItems: 'center',
    padding: '16@vs',
    marginBottom: '16@vs',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: { width: '90@s', height: '90@s', borderRadius: '45@s', marginBottom: '8@vs' },
  userName: { color: palette.accentDark, fontWeight: '700', fontSize: '16@ms' },
  sectionTitle: { color: palette.accent, fontSize: '18@ms', fontWeight: '700', marginVertical: '10@vs' },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12@ms',
    paddingVertical: '10@vs',
    paddingHorizontal: '14@s',
    marginBottom: '20@vs',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: '10@vs' },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: '10@s' },
  infoText: { color: palette.accentDark, fontSize: '15@ms', fontWeight: '600' },
  modifyButton: {
    backgroundColor: palette.accent,
    paddingVertical: '4@vs',
    paddingHorizontal: '16@s',
    borderRadius: '20@ms',
  },
  modifyText: { color: '#FFFFFF', fontSize: '13@ms', fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5E5' },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: '12@vs' },
});

export default ProfileSettingsScreen;
