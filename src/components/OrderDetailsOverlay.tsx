import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import {
  Banknote,
  HandHeart,
  MapPin,
  OctagonX,
  X,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { moderateScale } from "react-native-size-matters";
import { useCart } from "~/context/CartContext";
import { useDeliveryRatingOverlay } from "~/context/DeliveryRatingOverlayContext";
import type { OrderDto, OrderItemDto } from "~/interfaces/Order";
import { BASE_API_URL } from "@env";
import { useTranslation } from "~/localization";

interface Props {
  visible: boolean;
  onClose: () => void;
  order: OrderDto | null | undefined;
}

const { height } = Dimensions.get("window");
const accentColor = "#CA251B";
const primaryColor = "#17213A";
const borderColor = "#E8E9EC";

const OrderDetailsOverlay: React.FC<Props> = ({ visible, onClose, order }) => {
  const navigation = useNavigation<any>();
  const { addItem } = useCart();
  const { open: openDeliveryRating } = useDeliveryRatingOverlay();
  const { t } = useTranslation();
  if (!order) return null;

  const formatCurrency = (val: number | string | null | undefined): string => {
    const num = Number(val);
    if (!isFinite(num)) return "—";
    return `${num.toFixed(2)} dt`;
  };

  const extractNum = (v: number | string | null | undefined): number => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const cleanStr = v.replace(/[^0-9.,]/g, "");
      const n = Number(cleanStr.replace(",", "."));
      return isFinite(n) ? n : 0;
    }
    return 0;
  };

  const restaurant = {
    id: order.restaurantId,
    name: order.restaurantName,
    address: order.restaurantAddress,
    imageUrl: (order as any).restaurantImage,
  };

  const payment = order;
  const savedAddress = order.savedAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];

  const image =
    restaurant.imageUrl ||
    (order as any).restaurantImage ||
    (restaurant as any).coverImage ||
    undefined;

  const status = order.status?.toUpperCase() || t('orderDetails.fallbacks.status').toUpperCase();
  const total = extractNum(payment.total);
  const subtotal =
    extractNum((payment as any).itemsSubtotal) ||
    extractNum((payment as any).subtotal);
  const deliveryFee = extractNum((payment as any).deliveryFee);
  const tips = extractNum((payment as any).tipAmount);
  const serviceFee = extractNum((payment as any).serviceFee);
  const extras = extractNum((payment as any).extrasTotal);
  const promotion = extractNum((payment as any).promotionDiscount);
  const paymentMethod =
    (payment as any).method || (order as any).paymentMethod || t('orderDetails.fallbacks.paymentMethod');
  const addressTitle = savedAddress.label || t('orderDetails.fallbacks.addressTitle');
  const addressValue =
    savedAddress.formattedAddress || (order as any).deliveryAddress || "";
  const restaurantAddress = restaurant.address || t('orderDetails.fallbacks.addressUnavailable');
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString()
    : "";
  const orderTime = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const ratingSummary = order.rating ?? null;
  const isDelivered = status === "DELIVERED";
  const orderId = order.id;
  const driverName = order.driverName ?? null;
  const restaurantNameForRating = order.restaurantName ?? null;

  const handleReorder = () => {
    if (!order || !restaurant?.id) return;
    items.forEach((it: OrderItemDto) => {
      addItem({
        restaurant: { id: restaurant.id, name: restaurant.name },
        menuItem: {
          id: it.menuItemId || 0,
          name: it.name || it.menuItemName || t('orderDetails.fallbacks.itemName'),
          description: "",
          imageUrl: restaurant.imageUrl,
          price: extractNum(it.lineTotal) / (it.quantity || 1),
        },
        quantity: it.quantity || 1,
        extras: [],
      });
    });
    onClose();
    navigation.navigate("CheckoutOrder");
  };

  const handleOpenRating = () => {
    if (!orderId) {
      return;
    }

    openDeliveryRating({
      orderId,
      rating: ratingSummary,
      driverName,
      restaurantName: restaurantNameForRating,
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            <View style={styles.header}>
              <Image
                source={
                  image ? { uri: `${BASE_API_URL}/auth/image/${image}` } : require("../../assets/TEST.png")
                }
                style={styles.headerImage}
              />
              <View style={styles.imageOverlay} />
              <TouchableOpacity style={styles.backBtn} onPress={onClose}>
                <X size={36} color={accentColor} />
              </TouchableOpacity>
              <Text allowFontScaling={false} style={styles.headerTitle}>{restaurant.name}</Text>
              <TouchableOpacity
                style={styles.goBtn}
                onPress={() => {
                  onClose();
                  if (order.restaurantId) {
                    navigation.navigate("RestaurantDetails", {
                      restaurantId: order.restaurantId,
                    });
                  }
                }}
              >
                <Text allowFontScaling={false} style={styles.goBtnText}>Go to Restaurant</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={styles.leftContentContainer}>
                  {status === "CANCELED" && (
                    <OctagonX
                      size={40}
                      color={accentColor}
                      style={styles.statusIcon}
                    />
                  )}
                  {status === "DELIVERED" && (
                    <HandHeart
                      size={40}
                      color={accentColor}
                      style={styles.statusIcon}
                    />
                  )}
                  <View>
                    <Text allowFontScaling={false} style={styles.delivered}>{status}</Text>
                    <Text allowFontScaling={false} style={styles.smallText}>
                      {orderDate} | {orderTime}
                    </Text>
                    <Text allowFontScaling={false} style={styles.smallText}>ID: {order.id}</Text>
                  </View>
                </View>
                <Text allowFontScaling={false} style={styles.amount}>{formatCurrency(total)}</Text>
              </View>
            </View>

            <Text allowFontScaling={false} style={styles.sectionTitle}>Your Order</Text>
            <View style={styles.card}>
              <Text allowFontScaling={false} style={styles.productsHeader}>
                {items.length} Products from{" "}
                <Text allowFontScaling={false} style={styles.accent}>{restaurant.name}</Text>
              </Text>
              {items.map((it: OrderItemDto, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text allowFontScaling={false} style={styles.itemName}>
                      {it.quantity}x {it.name || it.menuItemName}
                    </Text>
                    {Array.isArray(it.extras) && it.extras.length > 0 ? (
                      <Text allowFontScaling={false} style={styles.itemDesc}>
                        Extras: {it.extras.map((e) => e).join(", ")}
                      </Text>
                    ) : null}
                  </View>
                  <Text allowFontScaling={false} style={styles.itemPrice}>
                    {formatCurrency(extractNum(it.lineTotal))}
                  </Text>
                </View>
              ))}
            </View>

            <Text allowFontScaling={false} style={styles.sectionTitle}>Restaurant Address</Text>
            <View style={styles.card}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MapPin size={18} color={accentColor} />
                <Text allowFontScaling={false} style={[styles.addressTitle, { marginLeft: 8 }]}>
                  {restaurant.name || t('orderDetails.fallbacks.restaurantName')}
                </Text>
              </View>
              <Text allowFontScaling={false} style={styles.addressText}>{restaurantAddress}</Text>
            </View>

            <Text allowFontScaling={false} style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.card}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MapPin size={18} color={accentColor} />
                <Text allowFontScaling={false} style={[styles.addressTitle, { marginLeft: 8 }]}>
                  {addressTitle}
                </Text>
              </View>
              <Text allowFontScaling={false} style={styles.addressText}>{addressValue}</Text>
            </View>

            <Text allowFontScaling={false} style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text allowFontScaling={false} style={styles.summaryLabel}>Subtotal</Text>
                <Text allowFontScaling={false} style={styles.summaryValue}>
                  {formatCurrency(subtotal)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text allowFontScaling={false} style={styles.summaryLabel}>Extras</Text>
                <Text allowFontScaling={false} style={styles.summaryValue}>
                  {formatCurrency(extras)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text allowFontScaling={false} style={styles.summaryLabel}>Delivery</Text>
                <Text allowFontScaling={false} style={styles.summaryValue}>
                  {formatCurrency(deliveryFee)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text allowFontScaling={false} style={styles.summaryLabel}>Service Fee</Text>
                <Text allowFontScaling={false} style={styles.summaryValue}>
                  {formatCurrency(serviceFee)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text allowFontScaling={false} style={styles.summaryLabel}>Tips</Text>
                <Text allowFontScaling={false} style={styles.summaryValue}>
                  {formatCurrency(tips)}
                </Text>
              </View>
              {promotion > 0 && (
                <View style={styles.summaryRow}>
                  <Text allowFontScaling={false} style={styles.summaryLabel}>Promotion</Text>
                  <Text allowFontScaling={false} style={[styles.summaryValue, { color: accentColor }]}>
                    -{formatCurrency(promotion)}
                  </Text>
                </View>
              )}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text allowFontScaling={false} style={styles.totalLabel}>Total</Text>
                <Text allowFontScaling={false} style={styles.totalValue}>
                  {formatCurrency(total)}
                </Text>
              </View>
            </View>

            <View style={styles.paymentRow}>
              <Banknote size={20} color={accentColor} />
              <Text allowFontScaling={false} style={styles.paymentText}>
                Paid with {paymentMethod}
              </Text>
            </View>

            {isDelivered ? (
              <TouchableOpacity style={styles.rateButton} onPress={handleOpenRating}>
                <Text allowFontScaling={false} style={styles.rateButtonText}>
                  {ratingSummary
                    ? t('profile.orderHistory.actions.updateRating')
                    : t('profile.orderHistory.actions.rateDelivery')}
                </Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.reorderBtn} onPress={handleReorder}>
              <Text allowFontScaling={false} style={styles.reorderText}>
                {t('profile.orderHistory.actions.reorder').toUpperCase()}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    height: height * 0.95,
  },
  header: { position: "relative", height: height * 0.3 },
  headerImage: { width: "100%", height: "100%" },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  backBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 6,
  },
  headerTitle: {
    position: "absolute",
    bottom: moderateScale(100),
    alignSelf: "center",
    fontSize: 28,
    fontWeight: "500",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 8,
  },
  goBtn: {
    position: "absolute",
    bottom: moderateScale(40),
    alignSelf: "center",
    backgroundColor: accentColor,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  goBtnText: { color: "#fff", fontWeight: "500", fontSize: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3.84,
    elevation: 4,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", },
  leftContentContainer: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  statusIcon: { marginRight: 12 },
  delivered: { color: accentColor, fontWeight: "700", fontSize: 16 },
  smallText: { color: "#757575", fontSize: 13 },
  amount: {
    marginTop: moderateScale(24),
    fontSize: 18,
    fontWeight: "700",
    color: accentColor,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: primaryColor,
    marginTop: 24,
    marginLeft: 18,
  },
  productsHeader: { fontSize: 13, color: primaryColor, marginBottom: 8 },
  accent: { color: accentColor, fontWeight: "700" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  itemName: { color: primaryColor, fontWeight: "600" },
  itemDesc: { color: "#6B7280", fontSize: 12 },
  itemPrice: { color: primaryColor, fontWeight: "600" },
  addressTitle: { fontWeight: "700", color: primaryColor },
  addressText: { color: "#4B5563", marginTop: 4 },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3.84,
    elevation: 4,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  summaryLabel: { color: "#6B7280", fontSize: 14 },
  summaryValue: { color: "#17213A", fontWeight: "600" },
  summaryDivider: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor,
    marginVertical: 8,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: primaryColor },
  totalValue: { fontSize: 16, fontWeight: "700", color: accentColor },
  paymentRow: {
    marginTop: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 8,
    paddingLeft:moderateScale(24),
  },
  paymentText: { color: accentColor, fontWeight: "400",fontSize:16 },
  rateButton: {
    borderRadius: 25,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: accentColor,
    backgroundColor: "#fff",
  },
  rateButtonText: { color: accentColor, fontWeight: "700", fontSize: 16 },
  reorderBtn: {
    backgroundColor: accentColor,
    borderRadius: 25,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  reorderText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default OrderDetailsOverlay;
