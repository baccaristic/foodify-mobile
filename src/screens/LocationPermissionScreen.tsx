import { useCallback, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LocationPermissionPrompt from '~/components/LocationPermissionPrompt';
import { requestLocationAccess } from '~/services/locationAccess';

export type LocationPermissionScreenParams = {
  nextRoute?: string;
  resetOnComplete?: boolean;
  allowSkip?: boolean;
};

type Props = NativeStackScreenProps<Record<string, object | undefined>, string> & {
  onComplete: () => void;
  onSkip: () => void;
};

const LocationPermissionScreen = ({ navigation, route, onComplete, onSkip }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nextRoute = (route?.params as LocationPermissionScreenParams | undefined)?.nextRoute ?? 'Home';
  const resetOnComplete = (route?.params as LocationPermissionScreenParams | undefined)?.resetOnComplete ?? true;
  const allowSkip = (route?.params as LocationPermissionScreenParams | undefined)?.allowSkip ?? true;

  const navigateToNext = useCallback(() => {
    if (resetOnComplete) {
      navigation.reset({ index: 0, routes: [{ name: nextRoute as never }] });
    } else {
      navigation.navigate(nextRoute as never);
    }
  }, [navigation, nextRoute, resetOnComplete]);

  const handleAgree = useCallback(async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const result = await requestLocationAccess();

    if (result.granted) {
      onComplete();
      navigateToNext();
    } else {
      if (!result.permissionGranted && !result.canAskAgain) {
        setErrorMessage('Location permission is disabled. Please enable it in Settings.');
        if (Platform.OS !== 'web') {
          Linking.openSettings().catch(() => undefined);
        }
      } else if (result.permissionGranted && !result.servicesEnabled) {
        setErrorMessage('Please enable your device location services.');
      } else {
        setErrorMessage('We need your permission to show nearby restaurants.');
      }
    }

    setIsProcessing(false);
  }, [isProcessing, navigateToNext, onComplete]);

  const handleClose = useCallback(() => {
    onSkip();
    if (allowSkip) {
      navigateToNext();
    }
  }, [allowSkip, navigateToNext, onSkip]);

  return (
    <LocationPermissionPrompt
      onAgree={handleAgree}
      onClose={handleClose}
      isProcessing={isProcessing}
      errorMessage={errorMessage}
      showBackButton={false}
    />
  );
};

export default LocationPermissionScreen;
