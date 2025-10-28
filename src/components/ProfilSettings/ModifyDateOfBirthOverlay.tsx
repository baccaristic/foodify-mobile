import React, { useEffect, useState } from 'react';
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
import { useMutation } from '@tanstack/react-query';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import useAuth from '~/hooks/useAuth';
import { useTranslation } from '~/localization';
import { updateClientProfile } from '~/api/profile';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateString = (value: string) => {
  if (!DATE_REGEX.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
  if ([year, month, day].some((part) => Number.isNaN(part))) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
};

const ModifyDateOfBirthOverlay = ({ onClose }: { onClose: () => void }) => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.dateOfBirth) {
      setDateOfBirth(user.dateOfBirth);
    }
  }, [user?.dateOfBirth]);

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

  const handleSubmit = () => {
    const trimmed = dateOfBirth.trim();
    if (trimmed && !isValidDateString(trimmed)) {
      setError(t('profile.modals.dob.errors.invalid'));
      return;
    }

    if (trimmed === (user?.dateOfBirth ?? '').trim()) {
      setError(null);
      onClose();
      return;
    }

    setError(null);
    Keyboard.dismiss();
    mutation.mutate(trimmed ? { dateOfBirth: trimmed } : { dateOfBirth: null });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <HeaderWithBackButton title={t('profile.modals.dob.title')} onBack={onClose} />
        </View>
        <View style={styles.inner}>
          <Text allowFontScaling={false} style={styles.currentLabel}>
            {t('profile.modals.dob.currentLabel')}
          </Text>
          <Text allowFontScaling={false} style={styles.currentValue}>
            {user?.dateOfBirth ?? t('profile.modals.dob.emptyValue')}
          </Text>

          <Text allowFontScaling={false} style={styles.label}>
            {t('profile.modals.dob.prompt')}
          </Text>

          <TextInput
            placeholder={t('profile.modals.dob.placeholder')}
            style={styles.input}
            value={dateOfBirth}
            onChangeText={(text) => {
              setError(null);
              setDateOfBirth(text);
            }}
          />

          {error && (
            <Text allowFontScaling={false} style={styles.error}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.button, isPending && styles.buttonDisabled]}
            onPress={handleSubmit}
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
  container: { flex: 1, backgroundColor: '#fff' ,paddingVertical:verticalScale(5)},
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
  buttonText: { color: '#fff', fontSize: '16@ms', fontWeight: '600' },
  error: { color: '#CA251B', fontSize: '14@ms', marginTop: '8@vs' },
});

export default ModifyDateOfBirthOverlay;

