import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import LocationPermissionPrompt from '~/components/LocationPermissionPrompt';
import { requestLocationAccess } from '~/services/locationAccess';

const LocationAccess = () => {
  const navigation = useNavigation();
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
      navigation.goBack();
    } else {
      if (!result.permissionGranted && !result.canAskAgain) {
        setErrorMessage('Please enable location permissions in Settings to continue.');
      } else if (result.permissionGranted && !result.servicesEnabled) {
        setErrorMessage('Turn on device location services to continue.');
      } else {
        setErrorMessage('We need your permission to show nearby restaurants.');
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
      description="This lets us show you which restaurants and stores you can order from."
    />
  );
};

export default LocationAccess;
