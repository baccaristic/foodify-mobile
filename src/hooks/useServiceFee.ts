import { useQuery } from '@tanstack/react-query';

import { getServiceFeeConfig } from '~/api/config';

const SERVICE_FEE_QUERY_KEY = ['config', 'service-fee'] as const;

const useServiceFee = () =>
  useQuery({
    queryKey: SERVICE_FEE_QUERY_KEY,
    queryFn: getServiceFeeConfig,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

export const useServiceFeeAmount = () => {
  const query = useServiceFee();

  return {
    ...query,
    amount: query.data?.amount ?? 0,
  };
};

export default useServiceFee;

