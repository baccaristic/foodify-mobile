import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ScaledSheet, verticalScale } from 'react-native-size-matters';
import VerificationCodeTemplate from '~/components/VerificationCodeTemplate';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import useAuth from '~/hooks/useAuth';
import { useTranslation } from '~/localization';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ModifyPhoneOverlay = ({ onClose }: { onClose: () => void }) => {
  const [newNumber, setNewNumber] = useState('');
  const [stage, setStage] = useState<'form' | 'verify'>('form');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const displayPhone = user?.phone ?? t('profile.modals.phone.emptyValue');

  const handleContinue = () => {
    if (!/^\d{8,15}$/.test(newNumber)) {
      setError(t('profile.modals.phone.errors.invalid'));
      return;
    }
    setStage('verify');
  };

  if (stage === 'verify') {
    return (
      <VerificationCodeTemplate
        contact={newNumber}
        resendMethod={t('profile.modals.phone.resendMethod')}
        onResendPress={() => console.log('Resent code via SMS')}
        onSubmit={(code) => {
          console.log('Phone verified:', code);
          onClose();
        }}
        resendButtonLabel={t('profile.modals.phone.resendButton')}
        errorMessage={error}
        onClearError={() => setError(null)}
        onBackPress={onClose}
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1,backgroundColor: '#fff',paddingTop: insets.top }}>
        <View style={styles.header}>
          <HeaderWithBackButton title={t('profile.modals.phone.title')} onBack={onClose} />
        </View>
        <View style={styles.innerContainer}>
          <Text allowFontScaling={false} style={styles.currentLabel}>
            {t('profile.modals.phone.currentLabel')}
          </Text>
          <Text allowFontScaling={false} style={styles.currentValue}>{displayPhone}</Text>

          <Text allowFontScaling={false} style={styles.label}>
            {t('profile.modals.phone.prompt')}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t('profile.modals.phone.inputPlaceholder')}
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            value={newNumber}
            onChangeText={(t) => {
              setError(null);
              setNewNumber(t);
            }}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

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
    color: '#CA251B',
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

export default ModifyPhoneOverlay;
