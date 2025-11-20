import client from './client';
import type {
  CouponDto,
  LoyaltyBalanceResponse,
  LoyaltyTransactionDto,
  RedeemCouponRequest,
  PointPayementRequest,
  PointsPaymentResponse
} from '~/interfaces/Loyalty';

const parseNumeric = (value: string | number | null | undefined) => {
  if (value == null) {
    return 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = Number(String(value).replace(',', '.'));
  return Number.isFinite(normalized) ? normalized : 0;
};

export const getLoyaltyBalance = async () => {
  const { data } = await client.get<LoyaltyBalanceResponse>('/loyalty/points');
  return {
    balance: parseNumeric(data?.balance),
    lifetimeEarned: parseNumeric(data?.lifetimeEarned),
    lifetimeRedeemed: parseNumeric(data?.lifetimeRedeemed),
  };
};

export const getLoyaltyTransactions = async () => {
  const { data } = await client.get<LoyaltyTransactionDto[]>('/loyalty/points/transactions');
  return Array.isArray(data)
    ? data.map((transaction) => ({
        ...transaction,
        points: parseNumeric(transaction.points),
      }))
    : [];
};

export const getLoyaltyCoupons = async () => {
  const { data } = await client.get<CouponDto[]>('/loyalty/coupons');
  return Array.isArray(data)
    ? data.map((coupon) => ({
        ...coupon,
        discountPercent:
          coupon.discountPercent != null ? parseNumeric(coupon.discountPercent) : null,
      }))
    : [];
};

export const redeemCouponWithPoints = async (payload: RedeemCouponRequest) => {
  const { data } = await client.post<CouponDto>('/loyalty/coupons/redeem', payload);
  return {
    ...data,
    discountPercent: data.discountPercent != null ? parseNumeric(data.discountPercent) : null,
  };
};

export const redeemCouponWithCode = async (payload: {couponCode: string}) => {
  const { data } = await client.post<boolean>('/loyalty/coupons/redeem-code', payload);
  return data;
};
  

export const scanPointsPayment = async (payload: PointPayementRequest) => {
  const { data } = await client.post<PointsPaymentResponse>(
    '/payments/points/client/scan',
    payload,
  );
  return data;
};


export const getPointsPaymentsHistory = async () => {
  const { data } = await client.get<PointsPaymentResponse[]>(
    '/payments/points/client/history',
  );
  return data;
};


export type { CouponDto, RedeemCouponRequest };
