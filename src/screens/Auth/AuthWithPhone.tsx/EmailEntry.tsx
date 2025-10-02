import React, { useState } from 'react';
import EntryInfoTemplate from '~/components/EntryInfoTemplate';

const EmailEntry = () => {

    const [email, setEmail] = useState('');
    const isEmailValid = email.trim().length > 0 && email.includes('@');

    return (

        <EntryInfoTemplate

            title="What's your e-mail adress "
            inputPlaceholder="Enter your email"
            keyboardType="email-address"
            nextScreen="NameEntry"
            inputValue={email}
            setInputValue={setEmail}
            isFormValid={isEmailValid}
        />

    );
};

export default EmailEntry;
