import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BackButtonHeader from './BackButtonHeader';
import AuthBackground from './AuthBackGround';
import { useTranslation } from '~/localization';

interface VerificationCodeTemplateProps {
    contact: string;
    resendMethod: 'Email' | 'SMS';
    onResendPress: () => void | Promise<void>;
    onSubmit?: (code: string) => void | Promise<void>;
    codeLength?: number;
    nextScreen?: string;
    isSubmitting?: boolean;
    isResendDisabled?: boolean;
    resendButtonLabel?: string;
    errorMessage?: string | null;
    helperMessage?: string | null;
    onClearError?: () => void;
    onBackPress?: () => void;
}

const VerificationCodeTemplate: React.FC<VerificationCodeTemplateProps> = ({
    contact,
    resendMethod,
    onResendPress,
    onSubmit,
    codeLength = 6,
    nextScreen,
    isSubmitting = false,
    isResendDisabled = false,
    resendButtonLabel,
    errorMessage,
    helperMessage,
    onClearError,
    onBackPress,
}) => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    const [code, setCode] = useState<string[]>(() => Array(codeLength).fill(''));

    useEffect(() => {
        setCode(Array(codeLength).fill(''));
    }, [codeLength]);

    const inputRefs = useMemo(
        () => Array.from({ length: codeLength }, () => React.createRef<TextInput>()),
        [codeLength],
    );

    const isFormValid = code.every(digit => digit.length === 1);
    const buttonBgClass = isFormValid && !isSubmitting ? 'bg-[#17213A]' : 'bg-gray-400';
    const hasError = Boolean(errorMessage);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];

        newCode[index] = text.slice(0, 1);
        setCode(newCode);
        onClearError?.();

        if (text.length === 1 && index < codeLength - 1) {
            inputRefs[index + 1].current?.focus();
        }
        else if (text.length === 0 && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleContinue = async () => {
        if (!isFormValid || isSubmitting) {
            return;
        }

        if (onSubmit) {
            await onSubmit(code.join(''));
            return;
        }

        if (nextScreen) {
            navigation.navigate(nextScreen as never);
        }
    };

    const handleResend = async () => {
        if (isResendDisabled || isSubmitting) {
            return;
        }
        await onResendPress();
    };

    const methodLabel = resendMethod === 'Email'
        ? t('auth.common.resend.methods.email')
        : t('auth.common.resend.methods.sms');

    const verificationPrompt = useMemo(
        () => t('auth.common.verification.prompt', {
            values: { count: codeLength, contact: '<contact>' },
        }),
        [codeLength, t],
    );

    const [promptStart, promptEnd] = useMemo(() => {
        const parts = verificationPrompt.split('<contact>');
        return [parts[0] ?? '', parts[1] ?? ''];
    }, [verificationPrompt]);

    const resolvedResendLabel = resendButtonLabel
        ?? t('auth.common.resend.default', { values: { method: methodLabel } });

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>

            <View className="flex-1 bg-white ">
                <View className='p-6 flex1'>

                    <BackButtonHeader onPress={onBackPress} />

                    <Text allowFontScaling={false} className="text-2xl font-semibold mb-10 text-black">
                        {promptStart}
                        <Text className="font-bold">{contact}</Text>
                        {promptEnd}
                    </Text>

                    <View className="flex-row justify-between mb-4 ">
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={inputRefs[index]}
                                className={`w-16 h-16 text-2xl font-bold text-center rounded-lg border-2 text-black
                                ${hasError ? 'border-red-500 text-red-500' :
                                        digit ? 'border-[#CA251B] text-[#CA251B]' : 'border-gray-300'
                                    }
                            `}
                                onChangeText={(text) => handleCodeChange(text, index)}
                                value={digit}
                                keyboardType="number-pad"
                                maxLength={1}
                                autoFocus={index === 0 && code[0] === ''}
                                editable={!isSubmitting}
                            />
                        ))}
                    </View>

                    {errorMessage ? (
                        <Text className="text-center text-red-500 font-semibold mb-4">
                            {errorMessage}
                        </Text>
                    ) : null}

                    {helperMessage ? (
                        <Text className="text-center text-gray-500 mb-4">{helperMessage}</Text>
                    ) : null}

                    <TouchableOpacity
                        className={`w-full h-14 rounded-lg justify-center items-center mb-4 ${buttonBgClass}`}
                        onPress={handleContinue}
                        disabled={!isFormValid || isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text allowFontScaling={false} className="text-white font-semibold text-lg">
                                {t('common.continue')}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-full h-14 border border-[#17213A] rounded-lg justify-center items-center"
                        onPress={handleResend}
                        disabled={isResendDisabled || isSubmitting}
                    >
                        <Text allowFontScaling={false} className="text-[#17213A] font-semibold text-lg">
                            {resolvedResendLabel}
                        </Text>
                    </TouchableOpacity>

                </View>
                <View>
                    <AuthBackground />
                </View>
            </View>


        </TouchableWithoutFeedback>
    );
};

export default VerificationCodeTemplate;
