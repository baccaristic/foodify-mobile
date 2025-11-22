import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { X, Heart, Check, Plus, Minus, ArrowLeft } from 'lucide-react-native';
import { Image } from 'expo-image';
import MainLayout from '~/layouts/MainLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CartItemOptionSelection } from '~/context/CartContext';
import type {
  RestaurantMenuItemDetails,
  RestaurantMenuItemExtra,
  RestaurantMenuOptionGroup,
} from '~/interfaces/Restaurant';
import { BASE_API_URL } from '@env';
import { getMenuItemBasePrice, hasActivePromotion } from '~/utils/menuPricing';
import { useTranslation, useLocalization } from '~/localization';
import { getLocalizedName, getLocalizedDescription } from '~/utils/localization';
import { useOnboarding } from '~/context/OnboardingContext';
import { useElementMeasurement } from '~/hooks/useElementMeasurement';
import OnboardingOverlay from '~/components/OnboardingOverlay';

const { width } = Dimensions.get('window');
const primaryColor = '#CA251B';
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const createHeaderEntrance = () =>
  FadeIn.springify()
    .damping(18)
    .stiffness(240)
    .mass(0.9)
    .withInitialValues({
      opacity: 0,
      transform: [{ scale: 0.92 }],
    });

const createCollapsedHeaderEntrance = () =>
  FadeInDown.springify()
    .damping(16)
    .stiffness(220)
    .mass(0.85)
    .withInitialValues({
      opacity: 0,
      transform: [{ translateY: -24 }],
    });

const createDetailSectionEntrance = (delayIndex: number) =>
  FadeInUp.springify()
    .damping(18)
    .stiffness(220)
    .mass(0.9)
    .withInitialValues({
      opacity: 0,
      transform: [{ translateY: 28 }],
    })
    .delay(Math.min(delayIndex, 6) * 70);

const createOptionGroupEntrance = (groupIndex: number) =>
  FadeInUp.springify()
    .damping(20)
    .stiffness(230)
    .mass(0.95)
    .withInitialValues({
      opacity: 0,
      transform: [{ translateY: 32 }],
    })
    .delay(groupIndex * 90 + 120);

const createOptionRowEntrance = (rowIndex: number) =>
  FadeInUp.springify()
    .damping(22)
    .stiffness(250)
    .mass(0.92)
    .withInitialValues({
      opacity: 0,
      transform: [{ translateY: 18 }],
    })
    .delay(Math.min(rowIndex, 5) * 55);

const createOrderBarEntrance = () =>
  FadeInUp.springify()
    .damping(18)
    .stiffness(240)
    .mass(0.9)
    .withInitialValues({
      opacity: 0,
      transform: [{ translateY: 42 }],
    })
    .delay(160);

interface MenuDetailProps {
  menuItem: RestaurantMenuItemDetails;
  handleAddItem: (itemDetails: AddToCartDetails[]) => void;
  onClose?: () => void;
  initialDraftSelections?: Record<number, number[]>[];
  actionLabel?: string;
  onToggleFavorite?: (nextFavorite: boolean) => void;
  isFavoriteLoading?: boolean;
}

interface AddToCartDetails {
  quantity: number;
  extras: CartItemOptionSelection[];
}

interface DraftConfiguration {
  id: string;
  selections: Record<number, number[]>;
}

interface OptionRowProps {
  group: RestaurantMenuOptionGroup;
  extra: RestaurantMenuItemExtra;
  isSelected: boolean;
  isLast: boolean;
  onToggle: (group: RestaurantMenuOptionGroup, extra: RestaurantMenuItemExtra) => void;
}

const formatPrice = (p: number) => `${p.toFixed(3).replace('.', ',')} DT`;

const resolveImageSource = (imagePath?: string | null) => {
  if (imagePath) {
    return { uri: imagePath };
  }
  return require('../../assets/baguette.png');
};

const OptionRow: React.FC<OptionRowProps> = ({ group, extra, isSelected, isLast, onToggle }) => {
  const { locale } = useLocalization();
  const localizedExtraName = getLocalizedName(extra, locale);

  return (
    <TouchableOpacity
      onPress={() => onToggle(group, extra)}
      className={`flex-row items-center justify-between py-3 ${isLast ? '' : 'border-b border-gray-100'}`}>
      <View className="flex-1">
        <Text
          allowFontScaling={false}
          className={`text-base font-semibold ${isSelected ? 'text-[#CA251B]' : 'text-gray-800'}`}>
          {localizedExtraName}
        </Text>
        {extra.price > 0 ? (
          <Text allowFontScaling={false} className="mt-1 text-sm font-medium text-gray-500">
            +{formatPrice(extra.price)}
          </Text>
        ) : null}
      </View>

      <View
        className={`h-8 w-8 items-center justify-center rounded-full ${
          isSelected ? 'bg-[#CA251B]' : 'bg-[#FDE7E5]'
        }`}>
        {isSelected ? <Check size={18} color="white" /> : <Plus size={18} color={primaryColor} />}
      </View>
    </TouchableOpacity>
  );
};

const resolveMinSelect = (group: RestaurantMenuOptionGroup) => {
  const baseMin = group.minSelect ?? 0;
  if (group.required) {
    return Math.max(baseMin, 1);
  }
  return baseMin;
};

const resolveMaxSelect = (group: RestaurantMenuOptionGroup) => {
  if (group.maxSelect && group.maxSelect > 0) {
    return group.maxSelect;
  }
  return Number.POSITIVE_INFINITY;
};

const buildInitialSelection = (item: RestaurantMenuItemDetails) => {
  const selections: Record<number, number[]> = {};

  item.optionGroups.forEach((group) => {
    const defaults = group.extras.filter((extra) => extra.defaultOption).map((extra) => extra.id);

    if (defaults.length > 0) {
      selections[group.id] = defaults;
      return;
    }

    const minRequired = resolveMinSelect(group);
    if (minRequired > 0) {
      selections[group.id] = group.extras.slice(0, minRequired).map((extra) => extra.id);
      return;
    }

    selections[group.id] = [];
  });

  return selections;
};

const cloneSelections = (selections: Record<number, number[]>) =>
  Object.keys(selections).reduce<Record<number, number[]>>((acc, key) => {
    const numericKey = Number(key);
    acc[numericKey] = [...(selections[numericKey] ?? [])];
    return acc;
  }, {});

const createDraftConfiguration = (
  item: RestaurantMenuItemDetails,
  baseSelections?: Record<number, number[]>
): DraftConfiguration => ({
  id: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  selections: baseSelections ? cloneSelections(baseSelections) : buildInitialSelection(item),
});

const createDraftsFromInitialSelections = (
  item: RestaurantMenuItemDetails,
  initialSelections?: Record<number, number[]>[]
) => {
  if (initialSelections && initialSelections.length > 0) {
    return initialSelections.map((selection) => createDraftConfiguration(item, selection));
  }

  return [createDraftConfiguration(item)];
};

const calculateExtrasTotal = (
  optionGroups: RestaurantMenuOptionGroup[],
  selections: Record<number, number[]>
) =>
  optionGroups.reduce((sum, group) => {
    const selectedIds = selections[group.id] ?? [];
    const groupTotal = group.extras.reduce((groupSum, extra) => {
      if (selectedIds.includes(extra.id)) {
        return groupSum + extra.price;
      }
      return groupSum;
    }, 0);
    return sum + groupTotal;
  }, 0);

const isSelectionValid = (
  optionGroups: RestaurantMenuOptionGroup[],
  selections: Record<number, number[]>
) =>
  optionGroups.every((group) => {
    const selectedCount = selections[group.id]?.length ?? 0;
    const minRequired = resolveMinSelect(group);
    return selectedCount >= minRequired;
  });

const MenuDetail: React.FC<MenuDetailProps> = ({
  menuItem,
  handleAddItem,
  onClose,
  initialDraftSelections,
  actionLabel,
  onToggleFavorite,
  isFavoriteLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLocalization();
  const { isOnboardingActive, currentStep, nextStep, skipOnboarding } = useOnboarding();
  
  // Measurements for onboarding highlights
  const { elementRef: extrasGroupRef, measurement: extrasGroupMeasurement, measureElement: measureExtrasGroup } = useElementMeasurement();
  const { elementRef: plusButtonRef, measurement: plusButtonMeasurement, measureElement: measurePlusButton } = useElementMeasurement();
  const { elementRef: addButtonRef, measurement: addButtonMeasurement, measureElement: measureAddButton } = useElementMeasurement();

  const getItemLabel = useCallback(
    (count: number) =>
      count === 1
        ? t('menuDetail.labels.itemSingular')
        : t('menuDetail.labels.itemPlural'),
    [t],
  );

  const describeGroupSelection = useCallback(
    (group: RestaurantMenuOptionGroup) => {
      if (group.minSelect > 0 && group.maxSelect > 0) {
        if (group.minSelect === group.maxSelect) {
          return t('menuDetail.optionGroups.selectExact', {
            values: {count: group.minSelect,
            item: getItemLabel(group.minSelect),}
          });
        }
        return t('menuDetail.optionGroups.selectRange', {values: {min: group.minSelect,
          max: group.maxSelect,}
        });
      }

      if (group.minSelect > 0) {
        return t('menuDetail.optionGroups.selectAtLeast', {values: {count: group.minSelect,
          item: getItemLabel(group.minSelect),}
        });
      }

      if (group.maxSelect > 0) {
        return t('menuDetail.optionGroups.selectUpTo', {
          values: {count: group.maxSelect,
          item: getItemLabel(group.maxSelect),}
        });
      }

      return t('menuDetail.optionGroups.selectAny');
    },
    [getItemLabel, t],
  );

  const resolvedActionLabel = actionLabel ?? t('common.add');

  const [drafts, setDrafts] = useState<DraftConfiguration[]>(() =>
    createDraftsFromInitialSelections(menuItem, initialDraftSelections)
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(menuItem.favorite ?? false);

  useEffect(() => {
    setIsFavorite(menuItem.favorite ?? false);
  }, [menuItem.favorite, menuItem.id]);

  const canToggleFavorite = Boolean(onToggleFavorite) && !isFavoriteLoading;

  const handleFavoritePress = useCallback(() => {
    if (!onToggleFavorite || isFavoriteLoading) {
      return;
    }

    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);
    onToggleFavorite(nextFavorite);
  }, [isFavorite, isFavoriteLoading, onToggleFavorite]);

  useEffect(() => {
    setDrafts(createDraftsFromInitialSelections(menuItem, initialDraftSelections));
    setActiveIndex(0);
  }, [initialDraftSelections, menuItem]);

  // Measure elements for onboarding
  useEffect(() => {
    if (currentStep === 'menu_detail_extras') {
      const timer = setTimeout(measureExtrasGroup, 500);
      return () => clearTimeout(timer);
    } else if (currentStep === 'menu_detail_plus') {
      const timer = setTimeout(measurePlusButton, 500);
      return () => clearTimeout(timer);
    } else if (currentStep === 'menu_detail_add_cart') {
      const timer = setTimeout(measureAddButton, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, measureExtrasGroup, measurePlusButton, measureAddButton]);

  const activeDraft = drafts[activeIndex];
  const hasPromotion = useMemo(() => hasActivePromotion(menuItem), [menuItem]);
  const basePrice = useMemo(() => getMenuItemBasePrice(menuItem), [menuItem]);

  const toggleExtra = (group: RestaurantMenuOptionGroup, extra: RestaurantMenuItemExtra) => {
    setDrafts((prev) =>
      prev.map((draft, index) => {
        if (index !== activeIndex) {
          return draft;
        }

        const current = draft.selections[group.id] ?? [];
        const isSelected = current.includes(extra.id);
        const maxAllowed = resolveMaxSelect(group);

        if (isSelected) {
          const nextSelection = current.filter((id) => id !== extra.id);
          return {
            ...draft,
            selections: {
              ...draft.selections,
              [group.id]: nextSelection,
            },
          };
        }

        if (maxAllowed === 1) {
          return {
            ...draft,
            selections: {
              ...draft.selections,
              [group.id]: [extra.id],
            },
          };
        }

        if (current.length >= maxAllowed) {
          return draft;
        }

        return {
          ...draft,
          selections: {
            ...draft.selections,
            [group.id]: [...current, extra.id],
          },
        };
      })
    );
  };

  const extrasTotal = useMemo(
    () => (activeDraft ? calculateExtrasTotal(menuItem.optionGroups, activeDraft.selections) : 0),
    [menuItem.optionGroups, activeDraft]
  );

  const mapSelectionsToGroups = useCallback(
    (selections: Record<number, number[]>): CartItemOptionSelection[] =>
      menuItem.optionGroups
        .map((group) => ({
          groupId: group.id,
          groupName: getLocalizedName(group, locale),
          extras: group.extras.filter((extra) => (selections[group.id] ?? []).includes(extra.id)),
        }))
        .filter((group) => group.extras.length > 0),
    [menuItem.optionGroups, locale]
  );

  const itemTotal = useMemo(() => basePrice + extrasTotal, [basePrice, extrasTotal]);
  const originalItemTotal = useMemo(() => menuItem.price + extrasTotal, [menuItem.price, extrasTotal]);

  const cartTotal = useMemo(
    () =>
      drafts.reduce(
        (sum, draft) => sum + basePrice + calculateExtrasTotal(menuItem.optionGroups, draft.selections),
        0
      ),
    [basePrice, drafts, menuItem.optionGroups]
  );

  const originalCartTotal = useMemo(
    () =>
      drafts.reduce(
        (sum, draft) => sum + menuItem.price + calculateExtrasTotal(menuItem.optionGroups, draft.selections),
        0
      ),
    [drafts, menuItem.optionGroups, menuItem.price]
  );

  const allValid = useMemo(
    () => drafts.every((draft) => isSelectionValid(menuItem.optionGroups, draft.selections)),
    [drafts, menuItem.optionGroups]
  );

  const handleIncreaseDrafts = useCallback(() => {
    setDrafts((prev) => {
      const baseSelections = buildInitialSelection(menuItem);
      const nextDrafts = [...prev, createDraftConfiguration(menuItem, baseSelections)];
      setActiveIndex(nextDrafts.length - 1);
      return nextDrafts;
    });
  }, [menuItem]);

  const handleDecreaseDrafts = useCallback(() => {
    setDrafts((prev) => {
      if (prev.length <= 1) {
        return prev;
      }

      const nextDrafts = prev.filter((_, index) => index !== activeIndex);
      const nextIndex = Math.max(0, Math.min(activeIndex, nextDrafts.length - 1));
      setActiveIndex(nextIndex);
      return nextDrafts;
    });
  }, [activeIndex]);

  const handleAdd = () => {
    if (!allValid || drafts.length === 0) {
      return;
    }

    const payload = drafts.map((draft) => ({
      quantity: 1,
      extras: mapSelectionsToGroups(draft.selections),
    }));

    handleAddItem(payload);
  };

  const detailHeader = (
    <Animated.View entering={createHeaderEntrance()}>
      <Image source={resolveImageSource(menuItem.imageUrl)} style={{ width, height: '100%' }} contentFit="contain" />
      <View className="absolute left-4 top-8">
        <TouchableOpacity className="rounded-full bg-white p-2" onPress={onClose}>
          <X size={20} color={primaryColor} />
        </TouchableOpacity>
      </View>
      <View className="absolute right-4 top-8">
        <TouchableOpacity
          className="rounded-full bg-white p-2"
          onPress={handleFavoritePress}
          disabled={!canToggleFavorite}
          style={{ opacity: canToggleFavorite ? 1 : 0.5 }}
        >
          <Heart size={20} color={primaryColor} fill={isFavorite ? primaryColor : 'white'} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const collapsedHeader = (
    <Animated.View
      entering={createCollapsedHeaderEntrance()}
      className="flex-1 flex-row items-center justify-center bg-white px-4"
    >
      <TouchableOpacity className="p-2" onPress={onClose}>
        <ArrowLeft size={20} color={primaryColor} />
      </TouchableOpacity>
      <Text allowFontScaling={false} className="flex-1 text-center text-lg font-bold text-gray-800">
        {getLocalizedName(menuItem, locale)}
      </Text>
      <TouchableOpacity
        className="p-2"
        onPress={handleFavoritePress}
        disabled={!canToggleFavorite}
        style={{ opacity: canToggleFavorite ? 1 : 0.5 }}
      >
        <Heart size={20} color={primaryColor} fill={isFavorite ? primaryColor : 'white'} />
      </TouchableOpacity>
    </Animated.View>
  );

  const mainContent = (
    <AnimatedScrollView
      entering={createDetailSectionEntrance(0)}
      className="-mt-4 rounded-t-2xl bg-white px-4 pt-4"
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Animated.View entering={createDetailSectionEntrance(0)}>
        <Text allowFontScaling={false} className="mt-2 text-3xl font-bold text-[#17213A]">
          {getLocalizedName(menuItem, locale)}
        </Text>
        <Animated.View entering={createDetailSectionEntrance(1)} className="mt-1 flex-row items-baseline gap-2">
          <Text allowFontScaling={false} className="text-xl font-bold text-[#CA251B]">
            {formatPrice(basePrice)}
          </Text>
          {hasPromotion ? (
            <Text allowFontScaling={false} className="text-base font-semibold text-gray-400 line-through">
              {formatPrice(menuItem.price)}
            </Text>
          ) : null}
        </Animated.View>
        {hasPromotion && menuItem.promotionLabel ? (
          <Animated.View entering={createDetailSectionEntrance(2)} className="mt-2 self-start rounded-full bg-[#FDE7E5] px-3 py-1">
            <Text allowFontScaling={false} className="text-xs font-semibold uppercase text-[#CA251B]">
              {menuItem.promotionLabel}
            </Text>
          </Animated.View>
        ) : null}
        {menuItem.description ? (
          <Animated.View entering={createDetailSectionEntrance(3)}>
            <Text allowFontScaling={false} className="mt-2 mb-4 text-sm text-[#17213A]">
              {getLocalizedDescription(menuItem, locale)}
            </Text>
          </Animated.View>
        ) : null}
      </Animated.View>

      {menuItem.tags?.length ? (
        <Animated.View entering={createDetailSectionEntrance(4)} className="mb-4 flex-row flex-wrap gap-2">
          {menuItem.tags.map((tag, tagIndex) => (
            <Animated.View key={tag} entering={createDetailSectionEntrance(tagIndex)}>
              <View className="rounded-full bg-[#FDE7E5] px-3 py-1">
                <Text allowFontScaling={false} className="text-xs font-semibold text-[#CA251B]">
                  {tag}
                </Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      ) : null}

      <Animated.View entering={createDetailSectionEntrance(5)} className="mt-4">
        <Text allowFontScaling={false} className="text-base font-semibold text-[#17213A]">
          {t('menuDetail.customizing', { values: {current: activeIndex + 1, total: drafts.length} })}
        </Text>
        {drafts.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerStyle={{ gap: 8 }}
          >
            {drafts.map((draft, index) => {
              const isActive = index === activeIndex;
              const isValid = isSelectionValid(menuItem.optionGroups, draft.selections);
              const backgroundClass = isActive
                ? 'border-[#CA251B] bg-[#CA251B]'
                : isValid
                  ? 'border-gray-200 bg-white'
                  : 'border-red-300 bg-red-50';
              const textClass = isActive ? 'text-white' : isValid ? 'text-[#17213A]' : 'text-red-600';
              return (
                <Animated.View key={draft.id} entering={createDetailSectionEntrance(index)}>
                  <TouchableOpacity
                    onPress={() => setActiveIndex(index)}
                    className={`min-w-[44px] items-center rounded-full border px-4 py-2 ${backgroundClass}`}
                  >
                    <Text allowFontScaling={false} className={`text-sm font-semibold ${textClass}`}>
                      {t('menuDetail.draftLabel', { values: {index: index + 1 }})}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
        ) : null}
      </Animated.View>

      {menuItem.optionGroups.map((group, groupIndex) => (
        <Animated.View 
          key={group.id} 
          entering={createOptionGroupEntrance(groupIndex)} 
          className="mb-8"
          ref={groupIndex === 0 ? extrasGroupRef : null}
          collapsable={false}>
          <Text allowFontScaling={false} className="text-xl font-bold text-[#17213A]">
            {getLocalizedName(group, locale)}
          </Text>
          <Animated.View entering={createDetailSectionEntrance(groupIndex)} className="mt-2 flex-row items-center gap-2">
            <Text allowFontScaling={false} className="text-sm text-gray-600">
              {describeGroupSelection(group)}
            </Text>
            <View className={`rounded-full px-2 py-1 ${group.required ? 'bg-[#CA251B]' : 'bg-gray-200'}`}>
              <Text
                allowFontScaling={false}
                className={`text-xs font-semibold uppercase ${group.required ? 'text-white' : 'text-gray-700'}`}
              >
                {group.required
                  ? t('menuDetail.optionGroups.required')
                  : t('menuDetail.optionGroups.optional')}
              </Text>
            </View>
          </Animated.View>

          <View className="mt-4 rounded-2xl border border-gray-100 bg-white">
            {group.extras.map((extra, index) => (
              <Animated.View key={extra.id} entering={createOptionRowEntrance(index)} className="px-3">
                <OptionRow
                  group={group}
                  extra={extra}
                  isSelected={(activeDraft?.selections[group.id] ?? []).includes(extra.id)}
                  isLast={index === group.extras.length - 1}
                  onToggle={toggleExtra}
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      ))}
    </AnimatedScrollView>
  );

  const orderBar = (
    <Animated.View
      entering={createOrderBarEntrance()}
      style={{ paddingBottom: insets.bottom }}
      className="absolute bottom-0 left-0 right-0 w-full border-t border-gray-100 bg-white p-4 shadow-2xl"
    >
      <View className="mb-2 flex-row items-center justify-between">
        <Text allowFontScaling={false} className="text-sm font-semibold text-[#17213A]">
          {t('menuDetail.itemTotal', { values: {index: activeIndex + 1} })}
        </Text>
        <View className="flex-row items-baseline gap-2">
          <Text allowFontScaling={false} className="text-sm font-bold text-[#CA251B]">
            {formatPrice(itemTotal)}
          </Text>
          {hasPromotion ? (
            <Text allowFontScaling={false} className="text-xs font-semibold text-gray-400 line-through">
              {formatPrice(originalItemTotal)}
            </Text>
          ) : null}
        </View>
      </View>

      <Animated.View entering={createDetailSectionEntrance(6)} className="mb-4 flex-row items-center justify-center">
        <TouchableOpacity
          onPress={handleDecreaseDrafts}
          className={`rounded-full border border-[#CA251B] p-2 ${drafts.length > 1 ? 'bg-[#CA251B]' : 'bg-transparent'}`}
          disabled={drafts.length <= 1}
        >
          <Minus size={24} color={drafts.length > 1 ? 'white' : primaryColor} />
        </TouchableOpacity>
        <Text allowFontScaling={false} className="mx-6 text-2xl font-bold">
          {drafts.length}
        </Text>
        <View ref={plusButtonRef} collapsable={false}>
          <TouchableOpacity 
            onPress={() => {
              if (currentStep === 'menu_detail_plus') {
                nextStep();
              }
              handleIncreaseDrafts();
            }} 
            className="rounded-full border border-[#CA251B] bg-[#CA251B] p-2">
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {!allValid ? (
        <Animated.View entering={createDetailSectionEntrance(7)}>
          <Text allowFontScaling={false} className="mb-3 text-center text-xs font-medium text-red-600">
            {t('menuDetail.validationMessage')}
          </Text>
        </Animated.View>
      ) : null}

      <View ref={addButtonRef} collapsable={false}>
        <TouchableOpacity
          className={`w-full rounded-xl py-4 shadow-lg ${allValid ? 'bg-[#CA251B]' : 'bg-gray-300'}`}
          onPress={() => {
            if (currentStep === 'menu_detail_add_cart') {
              nextStep();
            }
            handleAdd();
          }}
          disabled={!allValid}
        >
          <Animated.View entering={createDetailSectionEntrance(8)} className="items-center">
            <Text allowFontScaling={false} className="text-center text-lg font-bold text-white">
              {t('menuDetail.summary', {
                values: {
                  action: resolvedActionLabel,
                  count: drafts.length,
                  item: getItemLabel(drafts.length),
                  price: formatPrice(cartTotal),
                },
              })}
            </Text>
            {hasPromotion ? (
              <Text allowFontScaling={false} className="mt-1 text-sm font-semibold text-white/80 line-through">
                {formatPrice(originalCartTotal)}
              </Text>
            ) : null}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-white">
      <MainLayout
        showHeader
        showFooter={false}
        customHeader={detailHeader}
        collapsedHeader={collapsedHeader}
        mainContent={mainContent}
        headerMaxHeight={180}
        headerMinHeight={160}
      />
      {orderBar}

      {/* Onboarding Overlays */}
      {isOnboardingActive && currentStep === 'menu_detail_extras' && extrasGroupMeasurement && (
        <OnboardingOverlay
          step="menu_detail_extras"
          title={t('onboarding.menuDetailExtras.title')}
          description={t('onboarding.menuDetailExtras.description')}
          onNext={nextStep}
          onSkip={skipOnboarding}
          highlightArea={extrasGroupMeasurement}
        />
      )}
      
      {isOnboardingActive && currentStep === 'menu_detail_plus' && plusButtonMeasurement && (
        <OnboardingOverlay
          step="menu_detail_plus"
          title={t('onboarding.menuDetailPlus.title')}
          description={t('onboarding.menuDetailPlus.description')}
          onNext={nextStep}
          onSkip={skipOnboarding}
          highlightArea={plusButtonMeasurement}
        />
      )}
      
      {isOnboardingActive && currentStep === 'menu_detail_add_cart' && addButtonMeasurement && (
        <OnboardingOverlay
          step="menu_detail_add_cart"
          title={t('onboarding.menuDetailAddCart.title')}
          description={t('onboarding.menuDetailAddCart.description')}
          onNext={nextStep}
          onSkip={skipOnboarding}
          highlightArea={addButtonMeasurement}
        />
      )}
    </View>
  );
};

export default MenuDetail;
