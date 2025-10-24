import React, { useState } from 'react';

import VerificationCodeTemplate from '~/components/VerificationCodeTemplate';
import { useTranslation } from '~/localization';

const EmailVerificationCode = () => {
    const { t } = useTranslation();

    const handleResend = () => {
        console.log('Resending code via Email...');
    };

    const [error, setError] = useState<string | null>(null);
    const isSubmitting = false;

    return (
        <VerificationCodeTemplate
            contact={t('auth.email.signup.emailVerification.contactPlaceholder')}
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