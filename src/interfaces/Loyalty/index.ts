export type LoyaltyPointTransactionType = 'EARNED' | 'REDEEMED' | 'ADJUSTMENT';

export type NumericString = string | number;

export interface LoyaltyBalanceResponse {
  balance: NumericString;
  lifetimeEarned: NumericString;
  lifetimeRedeemed: NumericString;
}

export interface LoyaltyTransactionDto {
  id: number;
  type: LoyaltyPointTransactionType;
  points: NumericString;
  description: string;
  createdAt: string;
}

export type CouponType = 'PERCENTAGE_DISCOUNT' | 'FREE_DELIVERY';

export interface CouponDto {
  code: string;
  type: CouponType;
  discountPercent: NumericString | null;
  publicCoupon: boolean;
  redeemed: boolean;
  active: boolean;
  createdFromPoints: boolean;
  assignedAt: string | null;
}

export interface RedeemCouponRequest {
  type: CouponType;
  discountPercent?: number;
}
