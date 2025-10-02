import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import axios from 'axios';

import useAuth from '~/hooks/useAuth';

const EmailLogin = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password || isSubmitting) {
      return;
    }

    Keyboard.dismiss();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email: email.trim().toLowerCase(), password });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (err) {
      console.error('Login failed', err);
      let message = 'Unable to sign in. Please check your credentials and try again.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; error?: string } | undefined;
        message = data?.message || data?.error || message;
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isContinueDisabled = !email.trim() || !password.trim() || isSubmitting;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-white p-6">
        <View className="pt-16 mb-8">
          <TouchableOpacity
            className="w-16 h-16 px-8 py-8 items-center justify-center rounded-full border border-[#CA251B]"
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
          >
            <ArrowLeft color="#CA251B" size={38} />
          </TouchableOpacity>
        </View>

        <View className="pt-6">
          <Text allowFontScaling={false} className="text-xl font-medium mb-2 text-black">
            Enter your e-mail address
          </Text>

          <TextInput
            className="w-full h-14 bg-gray-100 rounded-lg px-4 mb-6 text-black border border-gray-200"
            placeholder="Your email eg.yourmail@email.com"
            placeholderTextColor="#a0a0a0"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={Keyboard.dismiss}
            value={email}
            onChangeText={setEmail}
            editable={!isSubmitting}
          />

          <Text allowFontScaling={false} className="text-xl font-medium mb-2 text-[#17213A]">
            Enter your password
          </Text>

          <TextInput
            className="w-full h-14 bg-gray-100 rounded-lg px-4 mb-4 text-[#17213A] border border-gray-200"
            placeholder="password"
            placeholderTextColor="#a0a0a0"
            secureTextEntry
            keyboardType="default"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
          />

          {error ? (
            <Text allowFontScaling={false} className="text-sm text-red-500 mb-2">
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            className={`w-full h-14 rounded-lg justify-center items-center mb-6 ${
              isContinueDisabled ? 'bg-gray-400' : 'bg-[#17213A]'
            }`}
            onPress={handleSubmit}
            disabled={isContinueDisabled}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text allowFontScaling={false} className="text-white font-semibold text-lg">
                Continue
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center justify-center w-full">
            <Text allowFontScaling={false} className="text-base text-[#17213A] font-['Roboto']">
              you don&apos;t have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUpEmailPassword')} disabled={isSubmitting}>
              <Text allowFontScaling={false} className="text-base font-semibold ml-1 text-[#CA251B]">
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default EmailLogin;
