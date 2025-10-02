import React, { useState } from 'react';
import EntryInfoTemplate from '~/components/EntryInfoTemplate';


const PhoneNumberEntry = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const isFormValid = phoneNumber.trim().length > 0;

    return (
        <EntryInfoTemplate

            title="What's your Phone Number "
            inputPlaceholder="Enter your phone number"
            keyboardType="numeric"
            nextScreen="NameEntry"
            inputValue={phoneNumber}
            setInputValue={setPhoneNumber}
            isFormValid={isFormValid}
        />
    );
};

export default PhoneNumberEntry;
