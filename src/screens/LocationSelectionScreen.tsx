import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { GOOGLE_MAPS_API_KEY } from '@env';
import MainLayout from '~/layouts/MainLayout';
import type { LucideIcon } from 'lucide-react-native';
import {
  Navigation,
  Home,
  Building2,
  BriefcaseBusiness,
  Sparkles,
  Search,
  MapPin,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react-native';
import FoodifyPin from '~/components/icons/FoodifyPin';
import LocationSearchOverlay, { LocationPrediction } from './LocationSearchOverlay';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mapsApiKey = GOOGLE_MAPS_API_KEY;

const palette = {
  background: '#FFFFFF',
  surface: '#F5F7FA',
  surfaceAlt: '#FFFFFF',
  sheet: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  accent: '#E03131',
  accentMuted: 'rgba(224, 49, 49, 0.12)',
  divider: '#E2E8F0',
};

const initialAddress = 'Q5RP+JVP, Tunis, Tunisia';

const DEFAULT_REGION: Region = {
  latitude: 36.8065,
  longitude: 10.1815,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

type AddressField = {
  id: string;
  label: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
};

type EntranceOption = {
  id: string;
  label: string;
  helper: string;
};

type AddressTypeConfig = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  detailFields: AddressField[];
  entranceOptions: EntranceOption[];
};

const ADDRESS_TYPES: AddressTypeConfig[] = [
  {
    id: 'home',
    label: 'Home',
    description: 'House, villa or standalone property',
    icon: Home,
    accent: '#F97316',
    detailFields: [
      { id: 'houseNumber', label: 'House number', placeholder: 'e.g. 24 or Villa Nour' },
      { id: 'directions', label: 'Directions for the rider', placeholder: 'Landmarks, gate color…' },
    ],
    entranceOptions: [
      { id: 'leaveAtDoor', label: 'Leave at the door', helper: 'Ideal when someone is home' },
      { id: 'callOnArrival', label: 'Call when outside', helper: 'We will ring you as we arrive' },
      { id: 'meetOutside', label: 'Meet me outside', helper: 'I will meet the rider at the gate' },
    ],
  },
  {
    id: 'apartment',
    label: 'Apartment',
    description: 'Multi-unit building or residence',
    icon: Building2,
    accent: '#6366F1',
    detailFields: [
      { id: 'building', label: 'Building', placeholder: 'Tower, block or residence name' },
      { id: 'floor', label: 'Floor', placeholder: 'e.g. 5th', keyboardType: 'number-pad' },
      { id: 'unit', label: 'Apartment', placeholder: 'e.g. 5B or 17' },
      { id: 'complement', label: 'Complementary info', placeholder: 'How to reach the buzzer, etc.' },
    ],
    entranceOptions: [
      { id: 'buzz', label: 'Ring the buzzer', helper: 'Provide code or apartment name if needed' },
      { id: 'security', label: 'Check in with security', helper: 'Rider will leave ID if required' },
    ],
  },
  {
    id: 'work',
    label: 'Work',
    description: 'Office, co-working or store front',
    icon: BriefcaseBusiness,
    accent: '#0EA5E9',
    detailFields: [
      { id: 'company', label: 'Company or organization', placeholder: 'Foodify, Inc.' },
      { id: 'department', label: 'Department', placeholder: 'e.g. Product, HR' },
      { id: 'contact', label: 'Reception contact', placeholder: 'Name or phone for handoff' },
    ],
    entranceOptions: [
      { id: 'reception', label: 'Drop at reception', helper: 'Front desk signs off the delivery' },
      { id: 'securityDesk', label: 'Leave with security', helper: 'Perfect when access is limited' },
      { id: 'callUponArrival', label: 'Call when outside', helper: 'We ring you before heading up' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Any other type of location',
    icon: Sparkles,
    accent: '#F472B6',
    detailFields: [
      { id: 'label', label: 'Give it a name', placeholder: 'Friend, gym, studio…' },
      { id: 'notes', label: 'Notes for the rider', placeholder: 'Describe the entrance or drop point' },
    ],
    entranceOptions: [
      { id: 'call', label: 'Call me on arrival', helper: 'Best for one-off meetups' },
      { id: 'text', label: 'Send a text update', helper: 'Get a quick SMS when close' },
    ],
  },
];

type SavedAddress = {
  id: string;
  title: string;
  subtitle: string;
  details?: string;
  icon: LucideIcon;
  accent: string;
  region: Region;
  typeId: AddressTypeConfig['id'];
};

const SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'home',
    title: 'Home',
    subtitle: 'Rue Monji Slim, Ariana',
    details: 'Apartment 12B, Building Atlas',
    icon: Home,
    accent: '#F97316',
    region: {
      latitude: 36.8665,
      longitude: 10.1645,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    },
    typeId: 'home',
  },
  {
    id: 'work',
    title: 'Work',
    subtitle: 'Technopark El Ghazela',
    details: 'Level 5, Foodify HQ',
    icon: BriefcaseBusiness,
    accent: '#0EA5E9',
    region: {
      latitude: 36.9009,
      longitude: 10.1879,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    },
    typeId: 'work',
  },
  {
    id: 'parents',
    title: "Parent's place",
    subtitle: 'La Marsa, Tunis',
    details: 'Behind Safir Hotel, white gate',
    icon: Sparkles,
    accent: '#6366F1',
    region: {
      latitude: 36.8913,
      longitude: 10.3231,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    },
    typeId: 'other',
  },
];

function withOpacity(hex: string, opacity: number): string {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) {
    return hex;
  }
  const alpha = Math.round(Math.max(0, Math.min(1, opacity)) * 255);
  return `#${sanitized}${alpha.toString(16).padStart(2, '0')}`;
}

function formatRegion(region: Region): string {
  return `${region.latitude.toFixed(4)} lat, ${region.longitude.toFixed(4)} lng`;
}

type LocationSelectionScreenProps = {
  onClose?: () => void;
} & Record<string, unknown>;

export default function LocationSelectionScreen({ onClose }: LocationSelectionScreenProps) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const insets = useSafeAreaInsets();
  const [screenState, setScreenState] = useState<'list' | 'compose' | 'details'>('list');
  const [activeType, setActiveType] = useState<AddressTypeConfig | null>(null);
  const [detailForm, setDetailForm] = useState<Record<string, string>>({});
  const [entranceChoice, setEntranceChoice] = useState<string | null>(null);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [currentRegion, setCurrentRegion] = useState<Region>(DEFAULT_REGION);
  const [formattedAddress, setFormattedAddress] = useState(initialAddress);
  const [hasConfirmedPoint, setHasConfirmedPoint] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPredictions, setSearchPredictions] = useState<LocationPrediction[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const screenHeight = useMemo(() => Dimensions.get('screen').height, []);
  const expandedHeaderHeight = useMemo(() => Math.min(screenHeight * 0.52, vs(460)), [screenHeight]);
  const compactHeaderHeight = useMemo(() => Math.max(screenHeight * 0.28, vs(250)), [screenHeight]);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialRegionSettledRef = useRef(false);
  const programmaticChangeRef = useRef(false);

  const mapRef = useRef<MapView | null>(null);
  const mapCompactProgress = useSharedValue(0);
  const pinOffset = useSharedValue(0);

  const pinLiftOffset = vs(12);
  const mapCompactOffset = vs(36);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation, onClose]);


  const fetchAddress = useCallback(
    async (region: Region) => {
      setIsGeocoding(true);
      setGeocodeError(null);

      if (!mapsApiKey) {
        setFormattedAddress(formatRegion(region));
        setIsGeocoding(false);
        return;
      }

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${region.latitude},${region.longitude}&key=${mapsApiKey}`
        );
        const data = await response.json();

        if (data.status === 'OK' && data.results?.length) {
          setFormattedAddress(data.results[0].formatted_address);
        } else {
          setFormattedAddress(formatRegion(region));
          setGeocodeError(data.error_message ?? 'Precise address unavailable');
        }
      } catch {
        setFormattedAddress(formatRegion(region));
        setGeocodeError('Could not reach Google Maps');
      } finally {
        setIsGeocoding(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAddress(DEFAULT_REGION);
  }, [fetchAddress]);
  useEffect(() => {
    mapCompactProgress.value = withTiming(hasConfirmedPoint ? 1 : 0, {
      duration: 320,
      easing: Easing.out(Easing.quad),
    });
  }, [hasConfirmedPoint, mapCompactProgress]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };
  }, []);

  const handleRegionChange = useCallback(() => {
    if (!initialRegionSettledRef.current) {
      return;
    }

    if (programmaticChangeRef.current) {
      return;
    }

    pinOffset.value = withTiming(-pinLiftOffset, { duration: 150 });
    setHasConfirmedPoint(false);
    setScreenState('compose');
    setSelectedSavedId(null);
    setActiveType(null);
    setEntranceChoice(null);
    setGeocodeError(null);
    setIsGeocoding(true);
  }, [pinLiftOffset, pinOffset, setScreenState]);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      initialRegionSettledRef.current = true;
      if (programmaticChangeRef.current) {
        programmaticChangeRef.current = false;
      }
      setCurrentRegion(region);
      setFormattedAddress(formatRegion(region));
      pinOffset.value = withTiming(0, { duration: 180 });
      fetchAddress(region);
    },
    [fetchAddress, pinOffset]
  );

  const handleConfirmPoint = useCallback(() => {
    if (isGeocoding) {
      return;
    }
    setHasConfirmedPoint(true);
    setScreenState('details');
    setSelectedSavedId(null);
    setActiveType((current) => current ?? ADDRESS_TYPES[0]);
    setDetailForm({});
    setEntranceChoice(null);
    setCustomLabel('');
  }, [isGeocoding]);

  const recenterToDefault = useCallback(() => {
    programmaticChangeRef.current = true;
    mapRef.current?.animateToRegion(DEFAULT_REGION, 280);
    setCurrentRegion(DEFAULT_REGION);
    setHasConfirmedPoint(false);
    setScreenState('compose');
    setSelectedSavedId(null);
    setActiveType(null);
    setEntranceChoice(null);
    fetchAddress(DEFAULT_REGION);
  }, [fetchAddress]);

  const handleSelectType = useCallback((type: AddressTypeConfig) => {
    setScreenState('details');
    setHasConfirmedPoint(true);
    setActiveType(type);
    setDetailForm((previous) => {
      const next: Record<string, string> = {};
      type.detailFields.forEach((field) => {
        next[field.id] = previous[field.id] ?? '';
      });
      return next;
    });
    setEntranceChoice(null);
    if (type.id !== 'other') {
      setCustomLabel('');
    }
  }, []);

  const handleDetailChange = useCallback((fieldId: string, value: string) => {
    setDetailForm((previous) => ({
      ...previous,
      [fieldId]: value,
    }));
  }, []);

  const handleEntranceSelect = useCallback((optionId: string) => {
    setEntranceChoice((current) => (current === optionId ? null : optionId));
  }, []);

  const handleSelectSavedAddress = useCallback(
    (address: SavedAddress) => {
      programmaticChangeRef.current = true;
      setScreenState('list');
      setSelectedSavedId(address.id);
      setHasConfirmedPoint(false);
      setEntranceChoice(null);
      const typeForAddress = ADDRESS_TYPES.find((type) => type.id === address.typeId) ?? null;
      setActiveType(typeForAddress);
      if (typeForAddress?.id === 'other') {
        setCustomLabel(address.title);
      } else {
        setCustomLabel('');
      }
      setDetailForm({});
      setFormattedAddress(address.subtitle);
      setCurrentRegion(address.region);
      setGeocodeError(null);
      setIsGeocoding(true);
      mapRef.current?.animateToRegion(address.region, 320);
      fetchAddress(address.region);
    },
    [fetchAddress]
  );

  const handleSaveAddress = useCallback(() => {
    setScreenState('list');
    setHasConfirmedPoint(false);
    setSelectedSavedId(null);
    setActiveType(null);
    setEntranceChoice(null);
    setDetailForm({});
    setCustomLabel('');
  }, []);

  const mapAnimatedStyle = useAnimatedStyle(() => {
    const compactProgress = mapCompactProgress.value;
    const translateY = -(compactProgress * mapCompactOffset);
    const scale = 1 - compactProgress * 0.05;
    return {
      opacity: 1,
      transform: [
        { translateY },
        { scale: Math.max(scale, 0.88) },
      ],
    };
  });

  const pinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pinOffset.value }],
  }));

  const SelectedType = activeType;
  const confirmDisabled = isGeocoding;

  const openSearch = useCallback(() => {
    setScreenState('compose');
    setSelectedSavedId(null);
    setSearchActive(true);
    setSearchQuery('');
    setSearchPredictions([]);
    setSearchError(null);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchActive(false);
    setSearchQuery('');
    setSearchPredictions([]);
    setSearchError(null);
    setSearchLoading(false);
  }, []);

  const performAutocomplete = useCallback(
    async (input: string) => {
      if (!mapsApiKey || input.trim().length < 3) {
        setSearchPredictions([]);
        setSearchError(null);
        return;
      }

      setSearchLoading(true);
      setSearchError(null);

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            input
          )}&language=en&location=${currentRegion.latitude},${currentRegion.longitude}&radius=10000&key=${mapsApiKey}`
        );
        const data = await response.json();

        if (data.status === 'OK' && Array.isArray(data.predictions)) {
          const nextPredictions: LocationPrediction[] = data.predictions.map((item: any) => ({
            placeId: item.place_id,
            primaryText: item.structured_formatting?.main_text ?? item.description,
            secondaryText: item.structured_formatting?.secondary_text ?? '',
            description: item.description,
          }));
          setSearchPredictions(nextPredictions);
          if (!nextPredictions.length) {
            setSearchError('No matching places. Try refining the keywords.');
          }
        } else {
          setSearchPredictions([]);
          setSearchError(data.error_message ?? 'Could not retrieve suggestions.');
        }
      } catch {
        setSearchPredictions([]);
        setSearchError('Could not reach Google Maps.');
      } finally {
        setSearchLoading(false);
      }
    },
    [currentRegion.latitude, currentRegion.longitude]
  );

  const handleSearchQueryChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      setSearchError(null);

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      searchDebounceRef.current = setTimeout(() => {
        performAutocomplete(text.trim());
      }, 350);
    },
    [performAutocomplete]
  );

  const handleSearchSubmit = useCallback(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    performAutocomplete(searchQuery.trim());
  }, [performAutocomplete, searchQuery]);

  const handleSelectPrediction = useCallback(
    async (prediction: LocationPrediction) => {
      if (!mapsApiKey) {
        return;
      }

      setSearchLoading(true);
      setSearchError(null);

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.placeId}&fields=formatted_address,geometry/location&key=${mapsApiKey}`
        );
        const data = await response.json();

        if (data.status === 'OK' && data.result?.geometry?.location) {
          const { lat, lng } = data.result.geometry.location;
          const nextRegion: Region = {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setCurrentRegion(nextRegion);
          setHasConfirmedPoint(false);
          setScreenState('compose');
          setSelectedSavedId(null);
          setActiveType(null);
          setEntranceChoice(null);
          setDetailForm({});
          programmaticChangeRef.current = true;
          setFormattedAddress(data.result.formatted_address ?? prediction.primaryText);
          setGeocodeError(null);
          mapRef.current?.animateToRegion(nextRegion, 320);
          fetchAddress(nextRegion);
          closeSearch();
        } else {
          setSearchError(data.error_message ?? 'Could not load the selected place.');
        }
      } catch {
        setSearchError('Could not load the selected place.');
      } finally {
        setSearchLoading(false);
      }
    },
    [closeSearch, fetchAddress]
  );

  const isListMode = screenState === 'list';
  const isComposeMode = screenState === 'compose';
  const isDetailsMode = screenState === 'details';

  return (
    <>
      <MainLayout
        showHeader
        headerCollapsed={hasConfirmedPoint}
        headerMaxHeight={expandedHeaderHeight}
        headerMinHeight={compactHeaderHeight}
        showFooter={false}
        enableHeaderCollapse={false}
        customHeader={
          <Animated.View style={[styles.mapContainer, mapAnimatedStyle]}>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFillObject}
              provider={PROVIDER_GOOGLE}
              initialRegion={currentRegion}
              onRegionChange={handleRegionChange}
              onRegionChangeComplete={handleRegionChangeComplete}
              showsCompass={false}
              showsPointsOfInterest={false}
              showsTraffic={false}
            />
            <View style={[styles.backButtonContainer, { top: insets.top + vs(8) }]}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleClose}
                style={styles.backButton}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <ArrowLeft size={s(18)} color="white" />
              </TouchableOpacity>
            </View>
            <View style={[StyleSheet.absoluteFillObject, styles.mapOverlay]}>
              <Animated.View style={[styles.pinWrapper, pinAnimatedStyle]}>
                <FoodifyPin width={s(44)} height={s(60)} color={palette.accent} />
              </Animated.View>
              <View style={styles.pinShadow} />
            </View>
            <View style={styles.addressCard}>
              <View style={styles.addressBadge}>
                <Text allowFontScaling={false} style={styles.addressBadgeText}>
                  DELIVERY LOCATION
                </Text>
              </View>
              <Text allowFontScaling={false} style={styles.addressTitle} numberOfLines={2}>
                {isGeocoding ? 'Pinning exact spot…' : formattedAddress}
              </Text>
              {geocodeError && (
                <Text allowFontScaling={false} style={styles.addressError} numberOfLines={1}>
                  {geocodeError}
                </Text>
              )}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleConfirmPoint}
                disabled={confirmDisabled}
                style={[styles.addressActionButton, confirmDisabled && styles.addressActionButtonDisabled]}
              >
                {isGeocoding ? (
                  <ActivityIndicator size="small" color={palette.surfaceAlt} />
                ) : (
                  <Text allowFontScaling={false} style={styles.addressActionText}>
                    {hasConfirmedPoint && isDetailsMode ? 'KEEP EDITING DETAILS' : 'USE THIS ADDRESS'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.mapActions}>
              <TouchableOpacity activeOpacity={0.85} style={styles.locateButton} onPress={recenterToDefault}>
                <Navigation size={s(18)} color={palette.accent} />
              </TouchableOpacity>
            </View>
            <View style={styles.googleBrand}>
              <Text allowFontScaling={false} style={styles.googleLabel}>
                Google
              </Text>
            </View>
          </Animated.View>
        }
        mainContent={
          <View style={styles.content}>
            {(isComposeMode || isDetailsMode) && (
              <Animated.View entering={FadeIn.duration(220)} style={styles.locationSummary}>
                <Text allowFontScaling={false} style={styles.summaryLabel}>
                  Pinned location
                </Text>
                <Text allowFontScaling={false} style={styles.summaryAddress}>
                  {formattedAddress}
                </Text>
                <View style={styles.coordinatesPill}>
                  <MapPin size={s(16)} color={palette.textSecondary} />
                  <Text allowFontScaling={false} style={styles.coordinatesText}>
                    {formatRegion(currentRegion)}
                  </Text>
                </View>
                <Text allowFontScaling={false} style={styles.summaryHint}>
                  Drag the pin or use the search bar to fine tune your drop-off point.
                </Text>
              </Animated.View>
            )}

            <View style={styles.cardStack}>
              {isListMode && (
                <Animated.View entering={FadeIn.duration(220)} style={styles.savedAddressesCard}>
                  <Text allowFontScaling={false} style={styles.savedTitle}>
                    Saved addresses
                  </Text>
                  <Text allowFontScaling={false} style={styles.savedSubtitle}>
                    Choose a frequent spot or add a brand new location.
                  </Text>

                  {SAVED_ADDRESSES.map((address) => {
                    const Icon = address.icon;
                    const isActive = selectedSavedId === address.id;
                    return (
                      <TouchableOpacity
                        key={address.id}
                        activeOpacity={0.85}
                        onPress={() => handleSelectSavedAddress(address)}
                        style={[
                          styles.savedAddressRow,
                          isActive && {
                            borderColor: withOpacity(address.accent, 0.5),
                            backgroundColor: withOpacity(address.accent, 0.14),
                          },
                        ]}
                      >
                        <View style={[styles.savedIconBadge, { backgroundColor: withOpacity(address.accent, 0.22) }]}>
                          <Icon size={s(20)} color={address.accent} />
                        </View>
                        <View style={styles.savedCopy}>
                          <Text allowFontScaling={false} style={styles.savedRowTitle}>
                            {address.title}
                          </Text>
                          <Text allowFontScaling={false} style={styles.savedRowSubtitle} numberOfLines={1}>
                            {address.subtitle}
                          </Text>
                          {address.details ? (
                            <Text allowFontScaling={false} style={styles.savedRowDetails} numberOfLines={1}>
                              {address.details}
                            </Text>
                          ) : null}
                        </View>
                        <ChevronRight size={s(18)} color={palette.textSecondary} />
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity activeOpacity={0.9} style={styles.addAddressButton} onPress={openSearch}>
                    <Text allowFontScaling={false} style={styles.addAddressLabel}>
                      Add new address
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {isComposeMode && (
                <Animated.View entering={FadeIn.duration(220)} style={styles.searchPrompt}>
                  <Text allowFontScaling={false} style={styles.searchPromptTitle}>
                    Search for a different spot
                  </Text>
                  <Text allowFontScaling={false} style={styles.searchPromptSubtitle}>
                    Drag the pin on the map above or look up an exact street, building or landmark.
                  </Text>
                  <TouchableOpacity activeOpacity={0.85} onPress={openSearch} style={styles.searchLaunchBar}>
                    <Search size={s(18)} color={palette.textSecondary} style={{ marginRight: s(8) }} />
                    <Text allowFontScaling={false} style={styles.searchLaunchPlaceholder}>
                      Search your delivery location
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {isDetailsMode && SelectedType && (
                <Animated.View entering={FadeIn.duration(220)} style={styles.detailsCard}>
                  <Text allowFontScaling={false} style={styles.detailsTitle}>
                    Label this address as
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.typeChipRow}
                  >
                    {ADDRESS_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isActive = SelectedType.id === type.id;
                      return (
                        <TouchableOpacity
                          key={type.id}
                          activeOpacity={0.85}
                          style={[
                            styles.typeChip,
                            {
                              borderColor: withOpacity(type.accent, isActive ? 0.6 : 0.25),
                              backgroundColor: withOpacity(type.accent, isActive ? 0.16 : 0.08),
                            },
                          ]}
                          onPress={() => handleSelectType(type)}
                        >
                          <Icon size={s(18)} color={type.accent} />
                          <Text allowFontScaling={false} style={styles.typeChipLabel}>
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <View style={styles.detailsSection}>
                    <Text allowFontScaling={false} style={styles.sectionHeading}>
                      Address details
                    </Text>
                    {SelectedType.detailFields.map((field) => (
                      <View key={field.id} style={styles.inputGroup}>
                        <Text allowFontScaling={false} style={styles.inputLabel}>
                          {field.label}
                        </Text>
                        <TextInput
                          value={detailForm[field.id] ?? ''}
                          onChangeText={(value) => handleDetailChange(field.id, value)}
                          placeholder={field.placeholder}
                          placeholderTextColor={palette.textSecondary}
                          style={styles.textInput}
                          keyboardType={field.keyboardType}
                        />
                      </View>
                    ))}

                    {SelectedType.id === 'other' && (
                      <View style={styles.inputGroup}>
                        <Text allowFontScaling={false} style={styles.inputLabel}>
                          Custom label
                        </Text>
                        <TextInput
                          value={customLabel}
                          onChangeText={setCustomLabel}
                          placeholder="Give this place a friendly name"
                          placeholderTextColor={palette.textSecondary}
                          style={styles.textInput}
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.detailsSection}>
                    <Text allowFontScaling={false} style={styles.sectionHeading}>
                      Mark the entrance
                    </Text>
                    <Text allowFontScaling={false} style={styles.sectionHelper}>
                      Help our rider find you faster and more safely.
                    </Text>
                    <View style={styles.entranceGrid}>
                      {SelectedType.entranceOptions.map((option) => {
                        const isActive = entranceChoice === option.id;
                        return (
                          <TouchableOpacity
                            key={option.id}
                            activeOpacity={0.9}
                            onPress={() => handleEntranceSelect(option.id)}
                            style={[
                              styles.entranceOption,
                              isActive && styles.entranceOptionActive,
                            ]}
                          >
                            <Text allowFontScaling={false} style={styles.entranceLabel}>
                              {option.label}
                            </Text>
                            <Text allowFontScaling={false} style={styles.entranceHelper}>
                              {option.helper}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={handleSaveAddress}>
                    <Text allowFontScaling={false} style={styles.primaryButtonText}>
                      Save and continue
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.secondaryButton}
                    onPress={() => setScreenState('compose')}
                  >
                    <Text allowFontScaling={false} style={styles.secondaryButtonText}>
                      Adjust pin location
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        }
      />

      <LocationSearchOverlay
        visible={searchActive}
        query={searchQuery}
        loading={searchLoading}
        predictions={searchPredictions}
        error={searchError}
        onChangeQuery={handleSearchQueryChange}
        onSelectPrediction={handleSelectPrediction}
        onClose={closeSearch}
        onSubmitQuery={handleSearchSubmit}
      />
    </>
  );

}

const styles = ScaledSheet.create({
  mapContainer: {
    height: '100%',
    borderBottomLeftRadius: '32@ms',
    borderBottomRightRadius: '32@ms',
    overflow: 'hidden',
    backgroundColor: palette.surfaceAlt,
  },
  backButtonContainer: {
    position: 'absolute',
    left: '16@s',
    zIndex: 10,
  },
  backButton: {
    width: '44@s',
    height: '44@s',
    borderRadius: '22@ms',
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  mapOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '40@vs',
  },
  closeOverlayButton: {
    position: 'absolute',
    left: '20@s',
    width: '44@s',
    height: '44@s',
    borderRadius: '22@ms',
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  pinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinShadow: {
    position: 'absolute',
    bottom: '40@vs',
    width: '74@s',
    height: '74@vs',
    borderRadius: '37@ms',
    backgroundColor: 'rgba(15, 23, 42, 0.16)',
    opacity: 0.32,
    transform: [{ scaleY: 0.28 }],
  },
  addressCard: {
    position: 'absolute',
    bottom: '28@vs',
    left: '56@s',
    right: '56@s',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: '22@ms',
    paddingVertical: '14@vs',
    paddingHorizontal: '18@s',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: '12@ms',
    elevation: 6,
  },
  addressBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: '10@s',
    paddingVertical: '3@vs',
    borderRadius: '999@ms',
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: '8@vs',
  },
  addressBadgeText: {
    color: palette.textPrimary,
    fontSize: '10@ms',
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  addressTitle: {
    color: palette.textPrimary,
    fontSize: '15@ms',
    fontWeight: '600',
    lineHeight: '21@vs',
  },
  addressError: {
    color: '#ef4444',
    fontSize: '11@ms',
    marginTop: '6@vs',
  },
  addressActionButton: {
    marginTop: '12@vs',
    borderRadius: '16@ms',
    backgroundColor: palette.accent,
    paddingVertical: '11@vs',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressActionButtonDisabled: {
    opacity: 0.7,
  },
  addressActionText: {
    color: '#FFFFFF',
    fontSize: '12.5@ms',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mapActions: {
    position: 'absolute',
    right: '16@s',
    bottom: '24@vs',
  },
  locateButton: {
    width: '44@s',
    height: '44@s',
    borderRadius: '22@ms',
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: '6@ms',
    elevation: 5,
  },
  googleBrand: {
    position: 'absolute',
    left: '16@s',
    bottom: '16@vs',
  },
  googleLabel: {
    color: palette.textSecondary,
    fontSize: '12@ms',
  },
  content: {
    paddingHorizontal: '16@s',
    paddingTop: '24@vs',
    paddingBottom: '32@vs',
    backgroundColor: palette.background,
  },
  locationSummary: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: '24@ms',
    paddingHorizontal: '20@s',
    paddingVertical: '18@vs',
    marginBottom: '18@vs',
    borderWidth: 1,
    borderColor: palette.divider,
  },
  summaryLabel: {
    color: palette.textSecondary,
    fontSize: '12@ms',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryAddress: {
    color: palette.textPrimary,
    fontSize: '18@ms',
    fontWeight: '700',
    marginTop: '8@vs',
  },
  coordinatesPill: {
    marginTop: '10@vs',
    paddingHorizontal: '12@s',
    paddingVertical: '6@vs',
    borderRadius: '999@ms',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  coordinatesText: {
    color: palette.textSecondary,
    fontSize: '12@ms',
    marginLeft: '6@s',
  },
  summaryHint: {
    color: palette.textSecondary,
    fontSize: '12@ms',
    marginTop: '12@vs',
    lineHeight: '18@vs',
  },
  cardStack: {
    minHeight: '280@vs',
  },
  searchPrompt: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: '24@ms',
    paddingHorizontal: '20@s',
    paddingVertical: '22@vs',
    marginBottom: '18@vs',
    borderWidth: 1,
    borderColor: palette.divider,
  },
  searchPromptTitle: {
    color: palette.textPrimary,
    fontSize: '16@ms',
    fontWeight: '600',
  },
  searchLaunchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: '16@ms',
    paddingHorizontal: '16@s',
    paddingVertical: '14@vs',
    marginTop: '18@vs',
    borderWidth: 1,
    borderColor: palette.divider,
  },
  searchLaunchPlaceholder: {
    color: palette.textSecondary,
    fontSize: '13@ms',
  },
  searchPromptSubtitle: {
    color: palette.textSecondary,
    fontSize: '13@ms',
    marginTop: '10@vs',
    lineHeight: '20@vs',
  },
  savedAddressesCard: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: '24@ms',
    paddingHorizontal: '20@s',
    paddingVertical: '24@vs',
    borderWidth: 1,
    borderColor: palette.divider,
  },
  savedTitle: {
    color: palette.textPrimary,
    fontSize: '18@ms',
    fontWeight: '700',
  },
  savedSubtitle: {
    color: palette.textSecondary,
    fontSize: '13@ms',
    marginTop: '6@vs',
    marginBottom: '18@vs',
  },
  savedAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '18@ms',
    borderWidth: '1@s',
    borderColor: palette.divider,
    paddingHorizontal: '14@s',
    paddingVertical: '14@vs',
    marginBottom: '12@vs',
    backgroundColor: palette.surface,
  },
  savedIconBadge: {
    width: '40@s',
    height: '40@s',
    borderRadius: '20@ms',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12@s',
  },
  savedCopy: {
    flex: 1,
  },
  savedRowTitle: {
    color: palette.textPrimary,
    fontSize: '15@ms',
    fontWeight: '600',
  },
  savedRowSubtitle: {
    color: palette.textSecondary,
    fontSize: '12.5@ms',
    marginTop: '4@vs',
  },
  savedRowDetails: {
    color: palette.textSecondary,
    fontSize: '12@ms',
    marginTop: '2@vs',
  },
  addAddressButton: {
    marginTop: '8@vs',
    paddingVertical: '14@vs',
    borderRadius: '16@ms',
    alignItems: 'center',
    borderWidth: '1@s',
    borderColor: withOpacity(palette.accent, 0.4),
    backgroundColor: withOpacity(palette.accent, 0.12),
  },
  addAddressLabel: {
    color: palette.accent,
    fontSize: '14@ms',
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: '24@ms',
    paddingHorizontal: '20@s',
    paddingVertical: '24@vs',
    borderWidth: 1,
    borderColor: palette.divider,
  },
  detailsTitle: {
    color: palette.textPrimary,
    fontSize: '17@ms',
    fontWeight: '700',
    marginBottom: '14@vs',
  },
  typeChipRow: {
    paddingVertical: '4@vs',
    paddingRight: '12@s',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '16@ms',
    borderWidth: '1@s',
    paddingHorizontal: '14@s',
    paddingVertical: '10@vs',
    marginRight: '12@s',
  },
  typeChipLabel: {
    color: palette.textPrimary,
    fontSize: '13@ms',
    fontWeight: '600',
    marginLeft: '8@s',
  },
  detailsSection: {
    marginTop: '22@vs',
  },
  sectionHeading: {
    color: palette.textPrimary,
    fontSize: '14@ms',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: '12@vs',
  },
  sectionHelper: {
    color: palette.textSecondary,
    fontSize: '12.5@ms',
    marginBottom: '14@vs',
    lineHeight: '18@vs',
  },
  inputGroup: {
    marginBottom: '14@vs',
  },
  inputLabel: {
    color: palette.textSecondary,
    fontSize: '12@ms',
    marginBottom: '6@vs',
  },
  textInput: {
    backgroundColor: palette.surface,
    borderRadius: '14@ms',
    paddingHorizontal: '14@s',
    paddingVertical: '12@vs',
    borderWidth: 1,
    borderColor: palette.divider,
    color: palette.textPrimary,
    fontSize: '14@ms',
  },
  entranceGrid: {
    marginTop: '2@vs',
  },
  entranceOption: {
    backgroundColor: palette.surface,
    borderRadius: '18@ms',
    borderWidth: 1,
    borderColor: palette.divider,
    paddingHorizontal: '18@s',
    paddingVertical: '14@vs',
    marginBottom: '12@vs',
  },
  entranceOptionActive: {
    borderColor: withOpacity(palette.accent, 0.7),
    backgroundColor: withOpacity(palette.accent, 0.14),
  },
  entranceLabel: {
    color: palette.textPrimary,
    fontSize: '13.5@ms',
    fontWeight: '600',
  },
  entranceHelper: {
    color: palette.textSecondary,
    fontSize: '12@ms',
    marginTop: '6@vs',
    lineHeight: '18@vs',
  },
  primaryButton: {
    marginTop: '28@vs',
    paddingVertical: '14@vs',
    borderRadius: '18@ms',
    alignItems: 'center',
    backgroundColor: palette.accent,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: '15@ms',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  secondaryButton: {
    marginTop: '14@vs',
    paddingVertical: '12@vs',
    borderRadius: '16@ms',
    alignItems: 'center',
    borderWidth: '1@s',
    borderColor: palette.divider,
    backgroundColor: palette.surfaceAlt,
  },
  secondaryButtonText: {
    color: palette.textPrimary,
    fontSize: '14@ms',
    fontWeight: '600',
  },
});
