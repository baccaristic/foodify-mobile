import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import { useTranslation } from '~/localization';

const ModifyPasswordOverlay = ({ onClose }: { onClose: () => void }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();


  const invalidError = t('profile.modals.password.errors.invalidCurrent');
  const mismatchError = t('profile.modals.password.errors.mismatch');

  const handleContinue = () => {
    if (currentPass !== 'correctpassword') {
      setError(invalidError);
      return;
    }
    if (newPass !== confirmPass) {
      setError(mismatchError);
      return;
    }
    setError(null);
    console.log('Password changed!');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <HeaderWithBackButton title={t('profile.modals.password.title')} onBack={onClose} />
        </View>
        <View style={styles.inner}>
          <Text allowFontScaling={false} style={styles.label}>
            {t('profile.modals.password.currentPrompt')}
          </Text>
          <TextInput
            secureTextEntry
            placeholder={t('profile.modals.password.currentPlaceholder')}
            style={styles.input}
            value={currentPass}
            onChangeText={(t) => {
              setError(null);
              setCurrentPass(t);
            }}
          />

          {error === invalidError && <Text style={styles.error}>{error}</Text>}

          <Text allowFontScaling={false} style={styles.label}>
            {t('profile.modals.password.newPrompt')}
          </Text>
          <TextInput
            secureTextEntry
            placeholder={t('profile.modals.password.newPlaceholder')}
            style={styles.input}
            value={newPass}
            onChangeText={(t) => {
              setError(null);
              setNewPass(t);
            }}
          />

          <Text allowFontScaling={false} style={styles.label}>
            {t('profile.modals.password.confirmPrompt')}
          </Text>
          <TextInput
            secureTextEntry
            placeholder={t('profile.modals.password.confirmPlaceholder')}
            style={styles.input}
            value={confirmPass}
            onChangeText={(t) => {
              setError(null);
              setConfirmPass(t);
            }}
          />

          {error === mismatchError && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
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
  header: { borderBottomColor: 'rgba(211,211,211,0.4)', borderBottomWidth: 2 },
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { paddingHorizontal: '20@s', paddingVertical: '30@vs' },
  label: { color: '#000', fontSize: '16@ms', fontWeight: '600', marginBottom: '6@vs' },
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
  error: { color: '#CA251B', fontSize: '14@ms', marginVertical: '5@vs' },
});

export default ModifyPasswordOverlay;
