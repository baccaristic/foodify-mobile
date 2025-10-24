import React, { useState } from 'react';

import EntryInfoTemplate from '~/components/EntryInfoTemplate';
import { useTranslation } from '~/localization';


const PhoneNumberEntry = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const { t } = useTranslation();
    const isFormValid = phoneNumber.trim().length > 0;

    return (
        <EntryInfoTemplate
            title={t('auth.email.signup.phone.title')}
            inputPlaceholder={t('auth.email.signup.phone.placeholder')}
            keyboardType="numeric"
            nextScreen="NameEntry"
            inputValue={phoneNumber}
            setInputValue={setPhoneNumber}
            isFormValid={isFormValid}
        />
    );
};

export default PhoneNumberEntry;
