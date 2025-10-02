import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Modal,
  GestureResponderEvent,
} from 'react-native';
import { useNavigation, useRoute, NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import { ArrowLeft, ChevronDown, CreditCard, TicketPercent, MapPin, PenSquare, Wallet, X } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';

const sectionTitleColor = '#17213A';
const accentColor = '#CA251B';
const borderColor = '#E8E9EC';

interface AccordionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, expanded, onToggle, children }) => (
  <View className="mt-4 overflow-hidden rounded-3xl border bg-white" style={{ borderColor }}>
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      className="flex-row items-center justify-between px-5 py-4"
    >
      <Text allowFontScaling={false} className="text-base font-semibold" style={{ color: sectionTitleColor }}>
        {title}
      </Text>
      <ChevronDown
        size={20}
        color={sectionTitleColor}
        style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
      />
    </TouchableOpacity>
    {expanded && (
      <View className="border-t px-5 pb-5 pt-4" style={{ borderColor }}>
        {children}
      </View>
    )}
  </View>
);

const PaymentModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (method: string) => void;
  selected: string;
}> = ({ visible, onClose, onSelect, selected }) => (
  <Modal
    animationType="fade"
    transparent
    visible={visible}
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-center bg-[#17213A]/40 px-6">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="absolute inset-0"
      />
      <View className="rounded-3xl bg-white p-6 shadow-lg">
        <Text allowFontScaling={false} className="text-center text-lg font-semibold" style={{ color: sectionTitleColor }}>
          Payment method
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelect('Add new Credit Card')}
          className="mt-6 flex-row items-center justify-between rounded-2xl border px-4 py-4"
          style={{
            borderColor: selected === 'Add new Credit Card' ? accentColor : '#EFEFF1',
            backgroundColor: selected === 'Add new Credit Card' ? '#FFF5F4' : 'white',
          }}
        >
          <View className="flex-row items-center">
            <CreditCard size={22} color={accentColor} />
            <Text allowFontScaling={false} className="ml-3 text-base font-semibold" style={{ color: sectionTitleColor }}>
              Add new Credit Card
            </Text>
          </View>
          <ChevronDown size={20} color={sectionTitleColor} style={{ transform: [{ rotate: '-90deg' }] }} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelect('Pay by Cash')}
          className="mt-4 flex-row items-center justify-between rounded-2xl border px-4 py-4"
          style={{
            borderColor: selected === 'Pay by Cash' ? accentColor : '#EFEFF1',
            backgroundColor: selected === 'Pay by Cash' ? '#FFF5F4' : 'white',
          }}
        >
          <View className="flex-row items-center">
            <Wallet size={22} color={accentColor} />
            <Text allowFontScaling={false} className="ml-3 text-base font-semibold" style={{ color: sectionTitleColor }}>
              Pay by Cash
            </Text>
          </View>
          <View
            className="h-5 w-5 items-center justify-center rounded-full border"
            style={{ borderColor: accentColor, backgroundColor: 'white' }}
          >
            {selected === 'Pay by Cash' && (
              <View className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: accentColor }} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

type CheckoutRouteParams = {
  couponCode?: string;
  discountAmount?: number;
  couponValid?: boolean;
};

type CheckoutRoute = RouteProp<{ CheckoutOrder: CheckoutRouteParams }, 'CheckoutOrder'>;

const CheckoutOrder: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<CheckoutRoute>();
  const [allergiesExpanded, setAllergiesExpanded] = useState(false);
  const [commentExpanded, setCommentExpanded] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Select Payment method');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  useEffect(() => {
    const params = route.params;
    if (params?.couponValid && params.couponCode) {
      setAppliedCoupon({ code: params.couponCode, discount: params.discountAmount ?? 0 });
      navigation.setParams({ couponCode: undefined, discountAmount: undefined, couponValid: undefined });
    }
  }, [route.params, navigation]);

  const totalProducts = 4;
  const restaurantName = 'Di Napoli';
  const subtotal = 48;
  const fees = 4.5;
  const service = 2.5;
  const discountValue = appliedCoupon?.discount ?? 0;
  const total = useMemo(() => subtotal + fees + service - discountValue, [subtotal, fees, service, discountValue]);

  const handlePaymentSelection = (method: string) => {
    setPaymentMethod(method);
    setIsPaymentModalVisible(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pb-4 pt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 rounded-full border border-[#E4E6EB] p-2">
          <ArrowLeft size={20} color={sectionTitleColor} />
        </TouchableOpacity>
        <Text allowFontScaling={false} className="flex-1 text-center text-xl font-bold" style={{ color: sectionTitleColor }}>
          My Order
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1"
      >
        <View className="px-4">
          <View className="rounded-3xl bg-white">
            <TouchableOpacity activeOpacity={0.8} className="flex-row items-center justify-between rounded-3xl border border-[#F0F1F3] px-5 py-4">
              <View>
                <Text allowFontScaling={false} className="text-sm font-semibold" style={{ color: accentColor }}>
                  {totalProducts} Product from
                </Text>
                <Text allowFontScaling={false} className="text-lg font-bold" style={{ color: accentColor }}>
                  {restaurantName}
                </Text>
              </View>
              <ChevronDown size={20} color={accentColor} />
            </TouchableOpacity>
          </View>

          <Accordion
            title="I have Allergies"
            expanded={allergiesExpanded}
            onToggle={() => setAllergiesExpanded((prev) => !prev)}
          >
            <TextInput
              allowFontScaling={false}
              multiline
              placeholder="Add your allergies"
              placeholderTextColor="#9CA3AF"
              value={allergies}
              onChangeText={setAllergies}
              className="min-h-[80px] rounded-2xl border border-[#F1F2F4] bg-[#F9FAFB] px-4 py-3 text-sm text-[#17213A]"
              textAlignVertical="top"
            />
          </Accordion>

          <Accordion
            title="Add a comment"
            expanded={commentExpanded}
            onToggle={() => setCommentExpanded((prev) => !prev)}
          >
            <TextInput
              allowFontScaling={false}
              multiline
              placeholder="Leave a note for the restaurant"
              placeholderTextColor="#9CA3AF"
              value={comment}
              onChangeText={setComment}
              className="min-h-[80px] rounded-2xl border border-[#F1F2F4] bg-[#F9FAFB] px-4 py-3 text-sm text-[#17213A]"
              textAlignVertical="top"
            />
          </Accordion>

          <View className="mt-6">
            <Text allowFontScaling={false} className="text-base font-bold" style={{ color: sectionTitleColor }}>
              Delivery Address
            </Text>
            <View className="mt-3 overflow-hidden rounded-3xl border" style={{ borderColor }}>
              <View style={styles.mapWrapper}>
                <MapView
                  style={StyleSheet.absoluteFill}
                  initialRegion={{
                    latitude: 36.8625,
                    longitude: 10.1956,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  <Marker
                    coordinate={{ latitude: 36.8625, longitude: 10.1956 }}
                    title="Delivery Address"
                    description="Rue Mustapha Abdessalem, Ariana 2091"
                  />
                </MapView>
              </View>
              <View className="flex-row items-start gap-3 bg-white px-4 py-4">
                <MapPin size={18} color={accentColor} />
                <Text allowFontScaling={false} className="flex-1 text-sm text-[#4B5563]">
                  Rue Mustapha Abdessalem, Ariana 2091
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-6">
            <Text allowFontScaling={false} className="text-base font-bold" style={{ color: sectionTitleColor }}>
              Payment method
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsPaymentModalVisible(true)}
              className="mt-3 flex-row items-center justify-between rounded-3xl border border-[#F0F1F3] bg-white px-5 py-4"
            >
              <View className="flex-row items-center">
                <CreditCard size={22} color={accentColor} />
                <Text allowFontScaling={false} className="ml-3 text-base font-semibold" style={{ color: sectionTitleColor }}>
                  {paymentMethod}
                </Text>
              </View>
              <ChevronDown size={20} color={sectionTitleColor} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('CouponCode', {
                currentCode: appliedCoupon?.code,
              })
            }
            className="mt-4 flex-row items-center justify-between rounded-3xl border border-dashed border-[#F0F1F3] bg-white px-5 py-4"
          >
            <View className="flex-1 flex-row items-center">
              <TicketPercent size={22} color={accentColor} />
              <View className="ml-3 flex-1">
                <Text allowFontScaling={false} className="text-base font-semibold" style={{ color: sectionTitleColor }}>
                  {appliedCoupon ? 'Coupon applied' : 'Add Coupon code'}
                </Text>
                {appliedCoupon && (
                  <Text allowFontScaling={false} className="mt-1 text-sm text-[#6B7280]">
                    {appliedCoupon.code} −{appliedCoupon.discount.toFixed(2)} dt
                  </Text>
                )}
              </View>
            </View>
            {appliedCoupon ? (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={(event: GestureResponderEvent) => {
                  event.stopPropagation();
                  handleRemoveCoupon();
                }}
              >
                <X size={20} color={sectionTitleColor} />
              </TouchableOpacity>
            ) : (
              <PenSquare size={20} color={sectionTitleColor} />
            )}
          </TouchableOpacity>

          <View className="mt-6 rounded-3xl border border-[#F0F1F3] bg-white p-5">
            <View className="flex-row items-center justify-between">
              <Text allowFontScaling={false} className="text-sm text-[#6B7280]">Subtotal</Text>
              <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">{subtotal.toFixed(2)} dt</Text>
            </View>
            <View className="mt-3 flex-row items-center justify-between">
              <Text allowFontScaling={false} className="text-sm text-[#6B7280]">Fees</Text>
              <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">{fees.toFixed(2)} dt</Text>
            </View>
            <View className="mt-3 flex-row items-center justify-between">
              <Text allowFontScaling={false} className="text-sm text-[#6B7280]">Service</Text>
              <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">{service.toFixed(2)} dt</Text>
            </View>
            {appliedCoupon && (
              <View className="mt-3 flex-row items-center justify-between">
                <Text allowFontScaling={false} className="text-sm text-[#6B7280]">Coupon ({appliedCoupon.code})</Text>
                <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">-
                  {appliedCoupon.discount.toFixed(2)} dt
                </Text>
              </View>
            )}
            <View className="mt-4 border-t border-dashed pt-4" style={{ borderColor }}>
              <View className="flex-row items-center justify-between">
                <Text allowFontScaling={false} className="text-lg font-bold" style={{ color: sectionTitleColor }}>
                  Total
                </Text>
                <Text allowFontScaling={false} className="text-lg font-bold" style={{ color: accentColor }}>
                  {total.toFixed(2)} dt
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-4 pb-6">
        <TouchableOpacity
          activeOpacity={0.9}
          className="rounded-full bg-[#CA251B] px-6 py-4"
        >
          <Text allowFontScaling={false} className="text-center text-base font-semibold text-white">
            Confirm and pay to order
          </Text>
        </TouchableOpacity>
      </View>

      <PaymentModal
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        onSelect={handlePaymentSelection}
        selected={paymentMethod}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mapWrapper: {
    height: 170,
    width: '100%',
  },
});

export default CheckoutOrder;
