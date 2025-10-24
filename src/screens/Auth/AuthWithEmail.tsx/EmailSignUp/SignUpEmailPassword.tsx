import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import BackButtonHeader from '~/components/BackButtonHeader';
import AuthBackground from '~/components/AuthBackGround';
import useEmailSignup from '~/hooks/useEmailSignup';
import { getErrorMessage } from '~/helper/apiError';
import { useTranslation } from '~/localization';
import { getRouteForEmailSignupStep } from './stepRoutes';

const SignUpEmailPassword = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { t } = useTranslation();
  const { state, startSignup } = useEmailSignup();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!state) {
      return;
    }

    if (state.completed || (state.accessToken && state.refreshToken && state.user)) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      return;
    }

    const nextRoute = getRouteForEmailSignupStep(state.nextStep);
    if (nextRoute && nextRoute !== 'SignUpEmailPassword') {
      navigation.navigate(nextRoute as never);
    }
  }, [navigation, state]);

  useEffect(() => {
    if (state?.email) {
      setEmail(state.email);
    }
  }, [state?.email]);

  const isFormValid = useMemo(() => {
    const trimmedEmail = email.trim();
    return (
      trimmedEmail.length > 0 &&
      password.trim().length > 0 &&
      confirmPassword.trim().length > 0 &&
      password === confirmPassword
    );
  }, [confirmPassword, email, password]);

  const buttonBgClass = isFormValid && !isSubmitting ? 'bg-[#17213A]' : 'bg-gray-400';

  const handleContinue = async () => {
    if (!isFormValid || isSubmitting) {
      return;
    }

    Keyboard.dismiss();
    setError(null);
    setIsSubmitting(true);

    try {
      const nextState = await startSignup(email.trim().toLowerCase(), password);
      const nextRoute = getRouteForEmailSignupStep(nextState.nextStep);
      if (nextRoute && nextRoute !== 'SignUpEmailPassword') {
        navigation.navigate(nextRoute as never);
      }
    } catch (err) {
      const message = getErrorMessage(err, t('auth.email.signup.emailPassword.errors.generic'));
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-white  ">
        <View className='p-6 flex1 py-0'>
          <BackButtonHeader />

          <Text allowFontScaling={false} className="text-2xl font-semibold mb-8 text-black">
            {t('auth.email.signup.emailPassword.emailLabel')}
          </Text>

          <TextInput
            className="w-full h-14 bg-gray-200 rounded-lg px-4 mb-6 text-black"
            placeholder={t('auth.email.signup.emailPassword.emailPlaceholder')}
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            onChangeText={(value) => {
              setEmail(value);
              setError(null);
            }}
            value={email}
            editable={!isSubmitting}
          />

          <Text allowFontScaling={false} className="text-2xl font-semibold mb-8 text-black">
            {t('auth.email.signup.emailPassword.passwordLabel')}
          </Text>

          <TextInput
            className="w-full h-14 bg-gray-200 rounded-lg px-4 mb-6 text-black"
            placeholder={t('auth.email.signup.emailPassword.passwordPlaceholder')}
            placeholderTextColor="#999"
            secureTextEntry
            onChangeText={(value) => {
              setPassword(value);
              setError(null);
            }}
            value={password}
            editable={!isSubmitting}
          />

          <Text allowFontScaling={false} className="text-2xl font-semibold mb-8 text-black">
            {t('auth.email.signup.emailPassword.confirmLabel')}
          </Text>

          <TextInput
            className="w-full h-14 bg-gray-200 rounded-lg px-4 mb-4 text-black"
            placeholder={t('auth.email.signup.emailPassword.confirmPlaceholder')}
            placeholderTextColor="#999"
            secureTextEntry
            onChangeText={(value) => {
              setConfirmPassword(value);
              setError(null);
            }}
            value={confirmPassword}
            editable={!isSubmitting}
          />

          {password !== confirmPassword && confirmPassword.trim().length > 0 ? (
            <Text allowFontScaling={false} className="text-sm text-red-500 mb-4">
              {t('auth.email.signup.emailPassword.errors.mismatch')}
            </Text>
          ) : null}

          {error ? (
            <Text allowFontScaling={false} className="text-sm text-red-500 mb-4">
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            className={`w-full h-14  rounded-lg justify-center items-center mb-6 ${buttonBgClass}`}
            onPress={handleContinue}
            disabled={!isFormValid || isSubmitting}
            activeOpacity={0.8}
          >
            <Text allowFontScaling={false} className="text-white font-semibold text-lg">{t('common.continue')}</Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center w-full">
            <Text allowFontScaling={false} className="text-base text-gray-600">
              {t('auth.email.signup.emailPassword.prompt.message')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isSubmitting}>
              <Text allowFontScaling={false} className="text-base font-semibold ml-1 text-[#CA251B]">
                {t('auth.email.signup.emailPassword.prompt.cta')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <AuthBackground />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignUpEmailPassword;
