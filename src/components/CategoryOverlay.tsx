import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { ScaledSheet, s, vs } from "react-native-size-matters";
import { X, Star } from "lucide-react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { getNearbyRestaurants } from "~/api/restaurants";
import type { RestaurantSummary } from "~/interfaces/Restaurant";
import { BASE_API_URL } from "@env";

interface CategoryOverlayProps {
    visible: boolean;
    category: string;
    onClose: () => void;
}

const formatDeliveryFee = (fee: number) =>
    fee > 0 ? `${fee.toFixed(3).replace('.', ',')} DT delivery fee` : 'Free delivery';

export default function CategoryOverlay({
    visible,
    category,
    onClose,
}: CategoryOverlayProps) {
    const navigation = useNavigation();
    const userLatitude = 36.8065;
    const userLongitude = 10.1815;

    const {
        data: restaurants,
        isLoading,
        isError,
        refetch,
    } = useQuery<RestaurantSummary[]>({
        queryKey: ["category-restaurants", category, userLatitude, userLongitude],
        queryFn: () =>
            getNearbyRestaurants({
                lat: userLatitude,
                lng: userLongitude,
                radiusKm: 5,
                category,
            }),
        enabled: visible && Boolean(category),
    });

    let content: React.ReactNode;

    if (isLoading) {
        content = (
            <View style={styles.loadingWrapper}>
                <ActivityIndicator size="large" color="#CA251B" />
            </View>
        );
    } else if (isError) {
        content = (
            <View style={styles.errorWrapper}>
                <Text style={styles.errorText}>
                    Could not load {category} restaurants.
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    } else if (!restaurants || restaurants.length === 0) {
        content = (
            <View style={styles.emptyWrapper}>
                <Text style={styles.emptyText}>No {category} restaurants found.</Text>
            </View>
        );
    } else {
        content = (
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.cardList}
            >
                {restaurants.map((restaurant) => (
                    <TouchableOpacity
                        key={restaurant.id}
                        style={styles.card}
                        onPress={() =>
                            navigation.navigate(
                                "RestaurantDetails" as never,
                                { restaurantId: restaurant.id } as never
                            )
                        }
                        activeOpacity={0.85}
                    >
                        <Image
                            source={
                                restaurant.imageUrl
                                    ? { uri: `${BASE_API_URL}/auth/image/${restaurant.imageUrl}` }
                                    : require("../../assets/baguette.png")
                            }
                            style={styles.cardImage} 
                            contentFit="cover"
                        />
                        <View style={styles.cardBody}>
                            <Text style={styles.cardTitle}>{restaurant.name}</Text>
                            <View style={styles.cardRow}>
                                <Text style={styles.deliveryTime}>{restaurant.type}</Text>
                                <View style={styles.ratingRow}>
                                    <Star size={s(14)} color="#FACC15" fill="#FACC15" />
                                    <Text style={styles.ratingText}>
                                        {restaurant.rating ? `${restaurant.rating}/5` : "New"}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.deliveryFee}>{formatDeliveryFee(restaurant.deliveryFee)}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
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
                        <Text style={styles.title}>{category.toUpperCase()}</Text>
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
    card: {
        backgroundColor: "white",
        borderRadius: "12@ms",
        overflow: "hidden",
        marginBottom: "12@vs",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: "6@ms",
        elevation: 3,
    },
    cardImage: { width: "100%", height: "140@vs" },
    cardBody: { padding: "10@s" },
    cardTitle: { fontSize: "16@ms", fontWeight: "700", color: "#17213A" },
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
