export type PromotionAwareMenuItem = {
  price: number;
  promotionActive?: boolean | null;
  promotionPrice?: number | null;
  promotionLabel?: string | null;
};

export const hasActivePromotion = (
  item?: PromotionAwareMenuItem | null
): item is PromotionAwareMenuItem & { promotionPrice: number } => {
  if (!item) {
    return false;
  }

  if (!item.promotionActive) {
    return false;
  }

  if (typeof item.promotionPrice !== 'number') {
    return false;
  }

  if (!Number.isFinite(item.promotionPrice)) {
    return false;
  }

  if (item.promotionPrice >= item.price) {
    return false;
  }

  return true;
};

export const getMenuItemBasePrice = (item: PromotionAwareMenuItem): number => {
  if (hasActivePromotion(item)) {
    return item.promotionPrice;
  }

  return item.price;
};
