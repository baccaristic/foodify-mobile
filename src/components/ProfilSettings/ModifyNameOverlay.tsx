import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import useAuth from '~/hooks/useAuth';
import { useTranslation } from '~/localization';

const ModifyNameOverlay = ({ onClose }: { onClose: () => void }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { user } = useAuth();
  const { t } = useTranslation();
  const displayName = user?.name ?? 'Guest User';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <HeaderWithBackButton title={t('profile.modals.name.title')} onBack={onClose} />

        <View style={styles.inner}>
          <Text allowFontScaling={false} style={styles.currentLabel}>
            {t('profile.modals.name.currentLabel')}
          </Text>
          <Text allowFontScaling={false} style={styles.currentValue}>{displayName}</Text>

          <Text allowFontScaling={false} style={styles.label}>
            {t('profile.modals.name.prompt')}
          </Text>

          <TextInput
            placeholder={t('profile.modals.name.firstPlaceholder')}
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            placeholder={t('profile.modals.name.lastPlaceholder')}
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />

          <TouchableOpacity style={styles.button}>
            <Text allowFontScaling={false} style={styles.buttonText}>
              {t('profile.modals.common.continue')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { paddingHorizontal: '20@s', paddingVertical: '30@vs' },
  currentLabel: { color: '#17213A', fontWeight: '700', fontSize: '17@ms' },
  currentValue: { color: '#17213A', fontWeight: '500', fontSize: '15@ms', marginBottom: '20@vs' },
  label: { color: '#000', fontSize: '16@ms', fontWeight: '600', marginBottom: '8@vs' },
  input: {
    backgroundColor: '#D9D9D9',
    borderRadius: '8@ms',
    paddingHorizontal: '12@s',
    paddingVertical: '10@vs',
    fontSize: '15@ms',
    color: '#000',
    marginBottom: '10@vs',
  },
  button: {
    backgroundColor: '#747C8C',
    borderRadius: '10@ms',
    height: '46@vs',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '20@vs',
  },
  buttonText: { color: '#fff', fontSize: '16@ms', fontWeight: '600' },
});

export default ModifyNameOverlay;
