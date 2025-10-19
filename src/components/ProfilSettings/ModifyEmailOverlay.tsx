import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import VerificationCodeTemplate from '~/components/VerificationCodeTemplate';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import useAuth from '~/hooks/useAuth';
import { useTranslation } from '~/localization';

const palette = {
  accent: '#CA251B',
  dark: '#17213A',
};

const ModifyEmailOverlay = ({ onClose }: { onClose: () => void }) => {
  const [newEmail, setNewEmail] = useState('');
  const [stage, setStage] = useState<'form' | 'verify'>('form');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useTranslation();
  const displayEmail = user?.email ?? t('profile.modals.email.emptyValue');
  

  const handleContinue = () => {
    if (!newEmail.includes('@')) {
      setError(t('profile.modals.email.errors.invalid'));
      return;
    }
    setStage('verify');
  };

  if (stage === 'verify') {
    return (
      <VerificationCodeTemplate
        contact={newEmail}
        resendMethod={t('profile.modals.email.resendMethod')}
        onResendPress={() => console.log('Resent code via email')}
        onSubmit={(code) => console.log('Verified code:', code)}
        errorMessage={error}
        onClearError={() => setError(null)}
        resendButtonLabel={t('profile.modals.email.resendButton')}
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.overlayContainer}>
        <HeaderWithBackButton title={t('profile.modals.email.title')} onBack={onClose} />
        <View style={styles.innerContainer}>
          <Text allowFontScaling={false} style={styles.currentLabel}>
            {t('profile.modals.email.currentLabel')}
          </Text>
          <Text allowFontScaling={false} style={styles.currentValue}>{displayEmail}</Text>

          <Text allowFontScaling={false} style={styles.label}>
            {t('profile.modals.email.prompt')}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t('profile.modals.email.inputPlaceholder')}
            placeholderTextColor="#666"
            value={newEmail}
            onChangeText={(t) => {
              setError(null);
              setNewEmail(t);
            }}
          />

          {error && <Text allowFontScaling={false} style={styles.errorText}>{error}</Text>}

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
  overlayContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    paddingHorizontal: '20@s',
    paddingVertical: '30@vs',
  },
  currentLabel: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '16@ms',
  },
  currentValue: {
    color: '#17213A',
    fontWeight: '500',
    fontSize: '15@ms',
    marginBottom: '20@vs',
  },
  label: {
    color: '#000',
    fontSize: '16@ms',
    fontWeight: '600',
    marginBottom: '8@vs',
  },
  input: {
    backgroundColor: '#D9D9D9',
    borderRadius: '8@ms',
    paddingHorizontal: '12@s',
    paddingVertical: '10@vs',
    fontSize: '15@ms',
    color: '#000',
  },
  errorText: {
    color: palette.accent,
    fontSize: '14@ms',
    marginVertical: '8@vs',
  },
  button: {
    backgroundColor: '#747C8C',
    borderRadius: '10@ms',
    height: '46@vs',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '24@vs',
  },
  buttonText: {
    color: '#fff',
    fontSize: '16@ms',
    fontWeight: '600',
  },
});

export default ModifyEmailOverlay;
