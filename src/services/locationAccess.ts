import * as Location from 'expo-location';

export type LocationAccessResult = {
  granted: boolean;
  permissionGranted: boolean;
  servicesEnabled: boolean;
  canAskAgain: boolean;
  status: Location.PermissionStatus;
};

const mapResult = (
  result: Location.PermissionResponse,
): Pick<LocationAccessResult, 'permissionGranted' | 'canAskAgain' | 'status'> => ({
  permissionGranted: result.granted,
  canAskAgain: result.canAskAgain,
  status: result.status,
});

export async function checkLocationAccess(): Promise<LocationAccessResult> {
  try {
    const permission = await Location.getForegroundPermissionsAsync();
    const base = mapResult(permission);
    const servicesEnabled = base.permissionGranted ? await safeHasServicesEnabled() : true;
    return {
      ...base,
      servicesEnabled,
      granted: base.permissionGranted && servicesEnabled,
    };
  } catch {
    return {
      granted: false,
      permissionGranted: false,
      servicesEnabled: false,
      canAskAgain: false,
      status: 'undetermined',
    };
  }
}

export async function requestLocationAccess(): Promise<LocationAccessResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    const base = mapResult(permission);
    const servicesEnabled = base.permissionGranted ? await safeHasServicesEnabled() : true;
    return {
      ...base,
      servicesEnabled,
      granted: base.permissionGranted && servicesEnabled,
    };
  } catch {
    return {
      granted: false,
      permissionGranted: false,
      servicesEnabled: false,
      canAskAgain: false,
      status: 'undetermined',
    };
  }
}

export async function getCurrentCoordinates(): Promise<Location.LocationObjectCoords | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return location.coords ?? null;
  } catch {
    return null;
  }
}

async function safeHasServicesEnabled(): Promise<boolean> {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch {
    return false;
  }
}
