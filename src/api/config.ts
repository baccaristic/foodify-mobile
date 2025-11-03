import client from './client';

export interface ServiceFeeConfigResponse {
  amount: number;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export const getServiceFeeConfig = async (): Promise<ServiceFeeConfigResponse> => {
  const { data } = await client.get<ServiceFeeConfigResponse>('/service-fee');
  return {
    amount: Number.isFinite(Number(data?.amount)) ? Number(data?.amount) : 0,
    updatedAt: data?.updatedAt ?? null,
    updatedBy: data?.updatedBy ?? null,
  };
};

