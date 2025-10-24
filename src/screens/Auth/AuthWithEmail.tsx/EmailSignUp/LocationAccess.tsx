import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import LocationPermissionPrompt from '~/components/LocationPermissionPrompt';
import { requestLocationAccess } from '~/services/locationAccess';
import { useTranslation } from '~/localization';

const LocationAccess = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAgree = async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const result = await requestLocationAccess();

    if (result.granted) {
      navigation.navigate('Notification');
    } else {
      if (!result.permissionGranted && !result.canAskAgain) {
        setErrorMessage(t('locationPermission.errors.disabled'));
      } else if (result.permissionGranted && !result.servicesEnabled) {
        setErrorMessage(t('locationPermission.errors.servicesDisabled'));
      } else {
        setErrorMessage(t('locationPermission.errors.generic'));
      }
    }

    setIsProcessing(false);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <LocationPermissionPrompt
      onAgree={handleAgree}
      onClose={handleClose}
      isProcessing={isProcessing}
      errorMessage={errorMessage}
    />
  );
};

export default LocationAccess;
