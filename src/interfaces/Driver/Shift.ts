export enum DriverShiftStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface DriverShiftDto {
  status: DriverShiftStatus;
  startedAt: string | null;
  finishableAt: string | null;
  endedAt: string | null;
}
