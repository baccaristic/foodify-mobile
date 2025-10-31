import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { ScaledSheet, verticalScale } from 'react-native-size-matters';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import useAuth from '~/hooks/useAuth';
import { useTranslation } from '~/localization';
import { useMutation } from '@tanstack/react-query';
import { updateClientProfile } from '~/api/profile';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const palette = {
  accent: '#CA251B',
  dark: '#17213A',
};

const ModifyEmailOverlay = ({ onClose }: { onClose: () => void }) => {
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const displayEmail = user?.email ?? t('profile.modals.email.emptyValue');
  const insets = useSafeAreaInsets();

  const mutation = useMutation({
    mutationFn: updateClientProfile,
    onSuccess: async (updatedUser) => {
      await updateUser(updatedUser);
      onClose();
    },
    onError: () => {
      setError(t('profile.modals.common.errors.generic'));
    },
  });

  const isPending = mutation.isPending;

  const handleContinue = () => {
    const trimmedEmail = newEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(t('profile.modals.email.errors.invalid'));
      return;
    }

    if (trimmedEmail === (user?.email ?? '').trim()) {
      setError(null);
      onClose();
      return;
    }

    setError(null);
    Keyboard.dismiss();
    mutation.mutate({ email: trimmedEmail });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1,backgroundColor: '#fff',paddingTop: insets.top }}>
        <View style={styles.header}>
        <HeaderWithBackButton title={t('profile.modals.email.title')} onBack={onClose}  />
        </View>
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

          <TouchableOpacity
            style={[styles.button, isPending && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text allowFontScaling={false} style={styles.buttonText}>
                {t('profile.modals.common.continue')}
              </Text>
            )}
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: '16@ms',
    fontWeight: '600',
  },
});

export default ModifyEmailOverlay;
