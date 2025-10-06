import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from 'node_modules/@react-navigation/core/lib/typescript/src/useNavigation';
import { useEffect, useState } from 'react';
import VerificationCodeTemplate from '~/components/VerificationCodeTemplate';

const EmailVerificationCode = () => {

    const handleResend = () => {
        console.log("Resending code via Email...");
    };

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <VerificationCodeTemplate
            contact="flenfoulani@email.com"
            nextScreen="PhoneNumberEntry"
            resendMethod="Email"
            onResendPress={handleResend}
            codeLength={6}
            isSubmitting={isSubmitting}
            errorMessage={error}
            onClearError={() => setError(null)}
        />

    );
};

export default EmailVerificationCode;