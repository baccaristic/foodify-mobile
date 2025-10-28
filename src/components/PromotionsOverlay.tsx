import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import type { ListRenderItem } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Percent, Star, X } from "lucide-react-native";
import { ScaledSheet, s, vs } from "react-native-size-matters";
import { BASE_API_URL } from "@env";

import { getNearbyPromotions } from "~/api/restaurants";
import type { PageResponse, RestaurantDisplayDto } from "~/interfaces/Restaurant";
import useSelectedAddress from "~/hooks/useSelectedAddress";
import { useTranslation } from "~/localization";

interface PromotionsOverlayProps {
    visible: boolean;
    onClose: () => void;
}

const PAGE_SIZE = 10;

export default function PromotionsOverlay({ visible, onClose }: PromotionsOverlayProps) {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { selectedAddress } = useSelectedAddress();

    const userLatitude = selectedAddress?.coordinates.latitude;
    const userLongitude = selectedAddress?.coordinates.longitude;

    const hasValidCoordinates =
        typeof userLatitude === "number" &&
        Number.isFinite(userLatitude) &&
        typeof userLongitude === "number" &&
        Number.isFinite(userLongitude);

    const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteQuery<PageResponse<RestaurantDisplayDto>>({
            queryKey: ["nearby-promotions", userLatitude, userLongitude],
            queryFn: ({ pageParam = 0 }) =>
                getNearbyPromotions({
                    lat: userLatitude as number,
                    lng: userLongitude as number,
                    page: pageParam,
                    pageSize: PAGE_SIZE,
                }),
            initialPageParam: 0,
            getNextPageParam: (lastPage) => {
                if (!lastPage || lastPage.items.length === 0) {
                    return undefined;
                }

                const fetchedItems = (lastPage.page + 1) * lastPage.pageSize;

                if (fetchedItems >= lastPage.totalItems) {
                    return undefined;
                }

                return lastPage.page + 1;
            },
            enabled: visible && hasValidCoordinates,
        });

    const restaurants = React.useMemo(() => {
        if (!data?.pages?.length) {
            return [] as RestaurantDisplayDto[];
        }

        return data.pages.flatMap((page) => page.items ?? []);
    }, [data]);

    const formatDeliveryFee = React.useCallback(
        (fee: number) =>
            fee > 0
                ? t("categoryOverlay.delivery.withFee", {
                      values: { fee: fee.toFixed(3).replace(".", ",") },
                  })
                : t("home.delivery.free"),
        [t],
    );

    const handleEndReached = React.useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const renderRestaurant = React.useCallback<ListRenderItem<RestaurantDisplayDto>>(
        ({ item }) => {
            const ratingDisplay = item.rating ? `${item.rating}/5` : t("home.rating.new");
            const imageSource = item.imageUrl
                ? { uri: `${BASE_API_URL}/auth/image/${item.imageUrl}` }
                : require("../../assets/baguette.png");

            return (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => {
                        navigation.navigate(
                            "RestaurantDetails" as never,
                            { restaurantId: item.id } as never,
                        );
                        onClose();
                    }}
                    activeOpacity={0.85}
                >
                    <Image source={imageSource} style={styles.cardImage} contentFit="cover" />
                    {item.promotionSummary ? (
                        <View style={styles.promotionBadgeContainer}>
                            <LinearGradient
                                colors={["#FACC15", "#F97316"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={styles.promotionBadge}
                            >
                                <Percent size={s(12)} color="#0F172A" />
                                <Text style={styles.promotionText} numberOfLines={1}>
                                    {item.promotionSummary}
                                </Text>
                            </LinearGradient>
                        </View>
                    ) : null}
                    <View style={styles.cardBody}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <View style={styles.cardRow}>
                            <Text style={styles.cardSubtitle} numberOfLines={1}>
                                {item.type ?? item.description ?? t("categoryOverlay.defaultType")}
                            </Text>
                            <View style={styles.ratingRow}>
                                <Star size={s(14)} color="#FACC15" fill="#FACC15" />
                                <Text style={styles.ratingText}>{ratingDisplay}</Text>
                            </View>
                        </View>
                        <Text style={styles.deliveryFee}>
                            {formatDeliveryFee(item.deliveryFee ?? 0)}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        },
        [formatDeliveryFee, navigation, onClose, t],
    );

    const listFooter = React.useMemo(
        () =>
            isFetchingNextPage ? (
                <View style={styles.listFooter}>
                    <ActivityIndicator size="small" color="#CA251B" />
                </View>
            ) : null,
        [isFetchingNextPage],
    );

    const listEmptyComponent = React.useCallback(
        () => (
            <View style={styles.emptyWrapper}>
                <Text style={styles.emptyText}>{t("promotionsOverlay.empty.title")}</Text>
            </View>
        ),
        [t],
    );

    let content: React.ReactNode;

    if (!hasValidCoordinates) {
        content = (
            <View style={styles.emptyWrapper}>
                <Text style={styles.emptyText}>{t("promotionsOverlay.addressPrompt")}</Text>
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
                <Text style={styles.errorText}>{t("promotionsOverlay.error.title")}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                    <Text style={styles.retryText}>{t("common.retry")}</Text>
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
                        <Text style={styles.title}>{t("promotionsOverlay.title")}</Text>
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
    errorWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
    errorText: { color: "#CA251B", fontSize: "14@ms", textAlign: "center", marginBottom: "12@vs" },
    retryButton: {
        backgroundColor: "#CA251B",
        paddingHorizontal: "20@s",
        paddingVertical: "8@vs",
        borderRadius: "10@ms",
    },
    retryText: { color: "white", fontWeight: "600" },
    emptyWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyText: { color: "#6B7280", fontSize: "14@ms", textAlign: "center" },
    cardList: { paddingBottom: vs(40) },
    listEmptyContent: { flexGrow: 1 },
    listFooter: { paddingVertical: "16@vs" },
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
    cardBody: { padding: "12@s" },
    cardTitle: { fontSize: "16@ms", fontWeight: "700", color: "#111827" },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "6@vs",
    },
    cardSubtitle: { fontSize: "12@ms", color: "#64748B", flex: 1, marginRight: "8@s" },
    ratingRow: { flexDirection: "row", alignItems: "center" },
    ratingText: { marginLeft: "4@s", fontSize: "12@ms", color: "#0F172A", fontWeight: "600" },
    deliveryFee: { marginTop: "8@vs", fontSize: "12@ms", color: "#CA251B", fontWeight: "600" },
    promotionBadgeContainer: { position: "absolute", top: "12@vs", left: "12@s" },
    promotionBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: "10@s",
        paddingVertical: "6@vs",
        borderRadius: "16@ms",
    },
    promotionText: { marginLeft: "6@s", fontSize: "12@ms", fontWeight: "600", color: "#0F172A", maxWidth: "180@s" },
});
