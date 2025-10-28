export type DeliveryNetworkStatus =
  | 'AVAILABLE'
  | 'BUSY'
  | 'NO_DRIVERS_AVAILABLE';

export interface DeliveryNetworkStatusResponse {
  status: DeliveryNetworkStatus;
  message: string;
  availableDrivers: number;
  waitingForAssignment: number;
  awaitingDriverResponse: number;
}
