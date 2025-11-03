import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    FlatList,
} from "react-native";
import type { ListRenderItem } from "react-native";
import { ScaledSheet, s, vs } from "react-native-size-matters";
import { X, Star, Percent } from "lucide-react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getCategoryRestaurants } from "~/api/restaurants";
import type { CategoryRestaurantsResponse, RestaurantCategory, RestaurantDisplay } from "~/interfaces/Restaurant";
import { BASE_API_URL } from "@env";
import { LinearGradient } from "expo-linear-gradient";
import useSelectedAddress from "~/hooks/useSelectedAddress";
import { useTranslation } from "~/localization";
import { getCategoryLabelKey, toCategoryDisplayName } from "~/localization/categoryKeys";

interface CategoryOverlayProps {
    visible: boolean;
    category: RestaurantCategory;
    onClose: () => void;
}

const PAGE_SIZE = 10;

export default function CategoryOverlay({
    visible,
    category,
    onClose,
}: CategoryOverlayProps) {
    const navigation = useNavigation();
    const savedAddresse = useSelectedAddress();
    const { t } = useTranslation();
    const userLatitude = savedAddresse.selectedAddress?.coordinates.latitude ?? null;
    const userLongitude = savedAddresse.selectedAddress?.coordinates.longitude ?? null;
    const hasLocation = userLatitude !== null && userLongitude !== null;

    const fallbackCategoryLabel = React.useMemo(
        () => toCategoryDisplayName(category),
        [category],
    );

    const categoryLabel = React.useMemo(() => {
        const labelKey = getCategoryLabelKey(category);
        if (labelKey) {
            return t(labelKey);
        }
        return fallbackCategoryLabel;
    }, [category, fallbackCategoryLabel, t]);

    const categoryTitle = React.useMemo(() => categoryLabel.toUpperCase(), [categoryLabel]);
    const categoryLabelForCopy = React.useMemo(
        () => categoryLabel.toLowerCase(),
        [categoryLabel],
    );

    const formatDeliveryFee = React.useCallback(
        (fee: number) =>
            fee > 0
                ? t('categoryOverlay.delivery.withFee', {
                      values: { fee: fee.toFixed(3).replace('.', ',') },
                  })
                : t('home.delivery.free'),
        [t],
    );

    const {
        data,
        isLoading,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery<CategoryRestaurantsResponse>({
        queryKey: ["category-restaurants", category, userLatitude, userLongitude],
        queryFn: ({ pageParam = 0 }: { pageParam?: number }) => {
            const nextPage =
                typeof pageParam === 'number' && Number.isFinite(pageParam) ? pageParam : 0;

            return getCategoryRestaurants({
                lat: userLatitude as number,
                lng: userLongitude as number,
                categorie: category,
                page: nextPage - 1,
                size: PAGE_SIZE,
            });
        },
        enabled: visible && Boolean(category) && hasLocation,
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const itemsOnLastPage = lastPage.items?.length ?? 0;
            const pageSize =
                typeof lastPage.pageSize === "number" && Number.isFinite(lastPage.pageSize) && lastPage.pageSize > 0
                    ? lastPage.pageSize
                    : PAGE_SIZE;
            const totalItems =
                typeof lastPage.totalItems === "number" && Number.isFinite(lastPage.totalItems)
                    ? lastPage.totalItems
                    : undefined;

            if (totalItems !== undefined) {
                const fetchedCount = allPages.reduce(
                    (sum, page) => sum + (page.items?.length ?? 0),
                    0
                );

                if (fetchedCount >= totalItems) {
                    return undefined;
                }
            }

            if (itemsOnLastPage < pageSize) {
                return undefined;
            }

            const currentPageIndex =
                typeof lastPage.page === "number" && Number.isFinite(lastPage.page)
                    ? lastPage.page
                    : allPages.length - 1;

            return currentPageIndex + 1;
        },
    });

    const restaurants = React.useMemo<RestaurantDisplay[]>(() => {
        if (!data?.pages?.length) {
            return [];
        }

        return data.pages.flatMap((page) => page.items ?? []);
    }, [data]);

    const handleEndReached = React.useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const renderRestaurant = React.useCallback<ListRenderItem<RestaurantDisplay>>(
        ({ item }) => {
            const ratingDisplay = item.rating ? `${item.rating}/5` : t('home.rating.new');

            return (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() =>{
                       navigation.navigate(
                            "RestaurantDetails" as never,
                            { restaurantId: item.id } as never
                        )
                        onClose();
                    }
                        
                    }
                    activeOpacity={0.85}
                >
                    <Image
                        source={
                            item.imageUrl
                                ? { uri: `${BASE_API_URL}/auth/image/${item.imageUrl}` }
                                : require("../../assets/baguette.png")
                        }
                        style={styles.cardImage}
                        contentFit="cover"
                    />
                    {item.hasPromotion && item.promotionSummary ? (
                        <View style={styles.promotionStickerContainer}>
                            <LinearGradient
                                colors={["#FACC15", "#F97316"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={styles.promotionSticker}
                            >
                                <Percent size={s(11)} color="#0F172A" />
                                <Text allowFontScaling={false}style={styles.promotionText} numberOfLines={1}>
                                    {item.promotionSummary}
                                </Text>
                            </LinearGradient>
                        </View>
                    ) : null}
                    <View style={styles.cardBody}>
                        <Text allowFontScaling={false}style={styles.cardTitle}>{item.name}</Text>
                        <View style={styles.cardRow}>
                            <Text allowFontScaling={false}style={styles.deliveryTime}>{item.type ?? t('categoryOverlay.defaultType')}</Text>
                            <View style={styles.ratingRow}>
                                <Star size={s(14)} color="#FACC15" fill="#FACC15" />
                                <Text allowFontScaling={false}style={styles.ratingText}>{ratingDisplay}</Text>
                            </View>
                        </View>
                        <Text allowFontScaling={false}style={styles.deliveryFee}>{formatDeliveryFee(item.deliveryFee ?? 0)}</Text>
                    </View>
                </TouchableOpacity>
            );
        },
        [formatDeliveryFee, navigation, onClose, t]
    );

    const listFooter = React.useMemo(
        () =>
            isFetchingNextPage ? (
                <View style={styles.listFooter}>
                    <ActivityIndicator size="small" color="#CA251B" />
                </View>
            ) : null,
        [isFetchingNextPage]
    );

    const listEmptyComponent = React.useCallback(
        () => (
            <View style={styles.emptyWrapper}>
                <Text allowFontScaling={false}style={styles.emptyText}>
                    {t('categoryOverlay.empty.title', { values: { category: categoryLabelForCopy } })}
                </Text>
            </View>
        ),
        [categoryLabelForCopy, t]
    );

    let content: React.ReactNode;

    if (!hasLocation) {
        content = (
            <View style={styles.emptyWrapper}>
                <Text allowFontScaling={false}style={styles.emptyText}>{t('categoryOverlay.addressPrompt')}</Text>
            </View>
        );
    } else if (isLoading) {
        content = (
            <View style={styles.loadingWrapper}>
                <ActivityIndicator size="large" color="#CA251B" />
            </View>
        );
    } else if (isError) {
        content = (
            <View style={styles.errorWrapper}>
                <Text allowFontScaling={false}style={styles.errorText}>
                    {t('categoryOverlay.error.title', { values: { category: categoryLabelForCopy } })}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                    <Text allowFontScaling={false}style={styles.retryText}>{t('common.retry')}</Text>
                </TouchableOpacity>
            </View>
        );
    } else {
        content = (
            <FlatList
                data={restaurants}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderRestaurant}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.cardList,
                    restaurants.length === 0 ? styles.listEmptyContent : undefined,
                ]}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.6}
                ListEmptyComponent={listEmptyComponent}
                ListFooterComponent={listFooter}
            />
        );
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.backdrop}>
                <View style={styles.container}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={onClose}>
                            <X color="#17213A" size={s(22)} />
                        </TouchableOpacity>
                        <Text allowFontScaling={false}style={styles.title}>{categoryTitle}</Text>
                        <View style={{ width: s(22) }} />
                    </View>

                    {content}
                </View>
            </View>
        </Modal>
    );
}

const styles = ScaledSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: "white",
        borderTopLeftRadius: "24@ms",
        borderTopRightRadius: "24@ms",
        padding: "16@s",
        height: "85%",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "12@vs",
    },
    title: {
        fontSize: "18@ms",
        fontWeight: "700",
        color: "#17213A",
    },
    loadingWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
    errorWrapper: { alignItems: "center", justifyContent: "center", flex: 1 },
    errorText: { color: "#CA251B", fontSize: "14@ms", marginBottom: "8@vs" },
    retryButton: {
        backgroundColor: "#CA251B",
        paddingHorizontal: "20@s",
        paddingVertical: "8@vs",
        borderRadius: "10@ms",
    },
    retryText: { color: "white", fontWeight: "600" },
    emptyWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyText: { color: "#6B7280", fontSize: "14@ms" },
    cardList: { paddingBottom: vs(40) },
    listEmptyContent: { flexGrow: 1 },
    listFooter: { paddingVertical: vs(16) },
    card: {
        backgroundColor: "white",
        borderRadius: "12@ms",
        overflow: "hidden",
        marginBottom: "12@vs",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: "6@ms",
        elevation: 3,
        position: "relative",
    },
    cardImage: { width: "100%", height: "140@vs" },
    cardBody: { padding: "10@s" },
    cardTitle: { fontSize: "16@ms", fontWeight: "700", color: "#17213A" },
    promotionStickerContainer: {
        position: "absolute",
        left: "-8@s",
        top: "16@vs",
    },
    promotionSticker: {
        borderTopRightRadius: "14@ms",
        borderBottomRightRadius: "14@ms",
        paddingHorizontal: "12@s",
        paddingVertical: "6@vs",
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "rgba(15, 23, 42, 0.3)",
        shadowOpacity: 0.25,
        shadowRadius: "8@ms",
        shadowOffset: { width: 2, height: 3 },
        elevation: 4,
    },
    promotionText: {
        marginLeft: "4@s",
        fontSize: "11@ms",
        fontWeight: "600",
        color: "#111827",
    },
    cardRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "4@vs",
    },
    ratingRow: { flexDirection: "row", alignItems: "center" },
    ratingText: { fontSize: "12@ms", marginLeft: "4@s", color: "#17213A" },
    deliveryTime: { color: "#CA251B", fontSize: "12@ms" },
    deliveryFee: { color: "#4B5563", fontSize: "11@ms", marginTop: "4@vs" },
});
