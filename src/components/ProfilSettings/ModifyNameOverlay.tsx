import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { moderateScale, ScaledSheet, verticalScale } from 'react-native-size-matters';
import { useMutation } from '@tanstack/react-query';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import useAuth from '~/hooks/useAuth';
import { useTranslation } from '~/localization';
import { updateClientProfile } from '~/api/profile';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ModifyNameOverlay = ({ onClose }: { onClose: () => void }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const displayName = user?.name ?? 'Guest User';
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      setFirstName(parts[0] ?? '');
      setLastName(parts.slice(1).join(' '));
    }
  }, [user?.name]);

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

  const buttonDisabled = useMemo(() => {
    return (
      isPending ||
      !firstName.trim() ||
      !lastName.trim() ||
      `${firstName.trim()} ${lastName.trim()}`.trim() === (user?.name ?? '').trim()
    );
  }, [firstName, isPending, lastName, user?.name]);

  const handleSubmit = () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    if (!trimmedFirst || !trimmedLast) {
      setError(t('profile.modals.name.errors.required'));
      return;
    }

    if (`${trimmedFirst} ${trimmedLast}`.trim() === (user?.name ?? '').trim()) {
      setError(null);
      onClose();
      return;
    }

    setError(null);
    Keyboard.dismiss();
    mutation.mutate({ name: `${trimmedFirst} ${trimmedLast}`.trim() });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1,backgroundColor: '#fff',paddingTop: insets.top }}>
        <View style={styles.header}>

          <HeaderWithBackButton title={t('profile.modals.name.title')} onBack={onClose} />
        </View>
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
            onChangeText={(text) => {
              setError(null);
              setFirstName(text);
            }}
          />
          <TextInput
            placeholder={t('profile.modals.name.lastPlaceholder')}
            style={styles.input}
            value={lastName}
            onChangeText={(text) => {
              setError(null);
              setLastName(text);
            }}
          />

          {error && (
            <Text allowFontScaling={false} style={styles.error}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.button, buttonDisabled && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={buttonDisabled}
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { color: '#fff', fontSize: '16@ms', fontWeight: '600' },
  error: { color: '#CA251B', fontSize: '14@ms', marginTop: '8@vs' },
});

export default ModifyNameOverlay;
