import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { MapStyleElement, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { GOOGLE_MAPS_API_KEY } from '@env';
import MainLayout from '~/layouts/MainLayout';
import type { LucideIcon } from 'lucide-react-native';
import { ArrowLeft, MapPin, Navigation, Home, Building2, BriefcaseBusiness, School, Sparkles, Search } from 'lucide-react-native';
import LocationSearchOverlay, { LocationPrediction } from './LocationSearchOverlay';

const mapsApiKey = GOOGLE_MAPS_API_KEY;

const palette = {
  surface: '#17213A',
  surfaceAlt: '#1E2A44',
  sheet: '#10182B',
  textPrimary: '#F9FAFB',
  textSecondary: '#94A3B8',
  accent: '#CA251B',
  accentMuted: 'rgba(202, 37, 27, 0.18)',
};

const initialAddress = 'Q5RP+JVP, Tunis, Tunisia';

const DEFAULT_REGION: Region = {
  latitude: 36.8065,
  longitude: 10.1815,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const DARK_MAP_STYLE: MapStyleElement[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#1f2937' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f9fafb' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#111827' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#111827' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2937' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
];

type PlaceOption = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

const PLACE_OPTIONS: PlaceOption[] = [
  {
    id: 'house',
    label: 'House',
    description: 'Single family home or villa',
    icon: Home,
    accent: '#F59E0B',
  },
  {
    id: 'apartment',
    label: 'Apartment',
    description: 'Building or complex',
    icon: Building2,
    accent: '#6366F1',
  },
  {
    id: 'office',
    label: 'Office',
    description: 'Workspace or business',
    icon: BriefcaseBusiness,
    accent: '#0EA5E9',
  },
  {
    id: 'school',
    label: 'School',
    description: 'Campus or education',
    icon: School,
    accent: '#22C55E',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Something different',
    icon: Sparkles,
    accent: '#F472B6',
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
  const [activeOption, setActiveOption] = useState<PlaceOption | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region>(DEFAULT_REGION);
  const [formattedAddress, setFormattedAddress] = useState(initialAddress);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [hasConfirmedPoint, setHasConfirmedPoint] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPredictions, setSearchPredictions] = useState<LocationPrediction[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();

  const screenHeight = useMemo(() => Dimensions.get('screen').height, []);
  const expandedHeaderHeight = useMemo(() => Math.min(screenHeight * 0.48, vs(420)), [screenHeight]);
  const compactHeaderHeight = useMemo(() => Math.max(screenHeight * 0.26, vs(240)), [screenHeight]);

  const collapseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapRef = useRef<MapView | null>(null);
  const mapVisibility = useSharedValue(1);
  const mapCompactProgress = useSharedValue(0);
  const pinOffset = useSharedValue(0);

  const pinLiftOffset = vs(12);
  const mapCollapseOffset = vs(90);
  const mapCompactOffset = vs(36);


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
    mapVisibility.value = withTiming(showSummary ? 0 : 1, { duration: 380 });

    if (collapseTimeout.current) {
      clearTimeout(collapseTimeout.current);
      collapseTimeout.current = null;
    }

    if (showSummary) {
      collapseTimeout.current = setTimeout(() => setHeaderVisible(false), 360);
    } else {
      setHeaderVisible(true);
    }

    return () => {
      if (collapseTimeout.current) {
        clearTimeout(collapseTimeout.current);
        collapseTimeout.current = null;
      }
    };
  }, [showSummary, mapVisibility]);

  useEffect(() => {
    mapCompactProgress.value = withTiming(hasConfirmedPoint || showSummary ? 1 : 0, { duration: 320, easing: Easing.out(Easing.quad) });
  }, [hasConfirmedPoint, mapCompactProgress, showSummary]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };
  }, []);

  const handleRegionChange = useCallback(() => {
    pinOffset.value = withTiming(-pinLiftOffset, { duration: 150 });
    setHasConfirmedPoint(false);
    setShowSummary(false);
    setHeaderVisible(true);
    setGeocodeError(null);
    setIsGeocoding(true);
  }, [pinOffset, pinLiftOffset]);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
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
    setShowSummary(false);
    setHeaderVisible(true);
  }, [isGeocoding]);

  const handleSelectOption = useCallback((option: PlaceOption) => {
    setActiveOption(option);
    setShowSummary(true);
  }, []);

  const handleChangeType = useCallback(() => {
    setShowSummary(false);
  }, []);

  const recenterToDefault = useCallback(() => {
    mapRef.current?.animateToRegion(DEFAULT_REGION, 280);
    setCurrentRegion(DEFAULT_REGION);
    setHasConfirmedPoint(false);
    setShowSummary(false);
    setHeaderVisible(true);
    fetchAddress(DEFAULT_REGION);
  }, [fetchAddress]);

  const mapAnimatedStyle = useAnimatedStyle(() => {
    const hideProgress = 1 - mapVisibility.value;
    const compactProgress = mapCompactProgress.value;
    const translateY = -(hideProgress * mapCollapseOffset + compactProgress * mapCompactOffset);
    const scale = 1 - compactProgress * 0.05 - hideProgress * 0.05;
    return {
      opacity: mapVisibility.value,
      transform: [
        { translateY },
        { scale: Math.max(scale, 0.88) },
      ],
    };
  });

  const pinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pinOffset.value }],
  }));

  const SelectedIcon = activeOption?.icon;
  const confirmDisabled = isGeocoding && !hasConfirmedPoint;

  const openSearch = useCallback(() => {
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
          setShowSummary(false);
          setHeaderVisible(true);
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

  return (
    <>
      <MainLayout
        showHeader={headerVisible && !hasConfirmedPoint}
        headerCollapsed={showSummary || hasConfirmedPoint}
        headerMaxHeight={expandedHeaderHeight}
        headerMinHeight={compactHeaderHeight}
        showFooter={false}
        enableHeaderCollapse={false}
        customHeader={
          headerVisible ? (
            <Animated.View style={[styles.mapContainer, mapAnimatedStyle]}>
              <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                provider={PROVIDER_GOOGLE}
                initialRegion={currentRegion}
                customMapStyle={DARK_MAP_STYLE}
                onRegionChange={handleRegionChange}
                onRegionChangeComplete={handleRegionChangeComplete}
                showsCompass={false}
                showsPointsOfInterest={false}
                showsTraffic={false}
              />
              <View style={[StyleSheet.absoluteFillObject, styles.mapOverlay]}>
                <Animated.View style={[styles.pinWrapper, pinAnimatedStyle]}>
                  <MapPin size={s(46)} color={palette.accent} fill={palette.accent} strokeWidth={1} />
                </Animated.View>
                <View style={styles.pinShadow} />
              </View>
              <View style={styles.addressCard}>
                <View style={styles.addressIcon}>
                  <MapPin size={s(18)} color={palette.textPrimary} />
                </View>
                <View style={styles.addressDetails}>
                  <Text allowFontScaling={false} style={styles.addressTitle} numberOfLines={1}>
                    {isGeocoding ? 'Pinning exact spot...' : formattedAddress}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleConfirmPoint}
                    disabled={confirmDisabled}
                  >
                    {isGeocoding ? (
                      <ActivityIndicator size="small" color={palette.accent} style={{ marginTop: vs(6) }} />
                    ) : (
                      <Text allowFontScaling={false} style={styles.addressActionLink}>
                        {hasConfirmedPoint ? 'Point selected' : 'Use this point'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  {geocodeError && (
                    <Text allowFontScaling={false} style={styles.addressError} numberOfLines={1}>
                      {geocodeError}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.mapActions}>
                <TouchableOpacity activeOpacity={0.85} style={styles.locateButton} onPress={recenterToDefault}>
                  <Navigation size={s(18)} color={palette.surface} />
                </TouchableOpacity>
              </View>
              <View style={styles.googleBrand}>
                <Text allowFontScaling={false} style={styles.googleLabel}>
                  Google
                </Text>
              </View>
            </Animated.View>
          ) : undefined
        }
        mainContent={
          <View style={styles.content}>
            <View style={styles.cardStack}>
              {!hasConfirmedPoint && !showSummary && (
                <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(180)} style={styles.searchPrompt}>
                  <Text allowFontScaling={false} style={styles.searchPromptTitle}>
                    Trouble locating your address?
                  </Text>
                  <Text allowFontScaling={false} style={styles.searchPromptSubtitle}>
                    Try using search instead.
                  </Text>
                  <TouchableOpacity activeOpacity={0.85} onPress={openSearch} style={styles.searchLaunchBar}>
                    <Search size={s(18)} color={palette.textSecondary} style={{ marginRight: s(8) }} />
                    <Text allowFontScaling={false} style={styles.searchLaunchPlaceholder}>
                      Search street, city, district...
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {hasConfirmedPoint && !showSummary && (
                <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(200)} style={styles.selectionCard}>
                  <Text allowFontScaling={false} style={styles.selectionTitle}>
                    What kind of place is this?
                  </Text>
                  <Text allowFontScaling={false} style={styles.selectionSubtitle}>
                    Choose the label that fits best so we remember for next time.
                  </Text>

                  <View style={styles.optionsGrid}>
                    {PLACE_OPTIONS.map((option) => {
                      const isActive = activeOption?.id === option.id;
                      const Icon = option.icon;
                      return (
                        <TouchableOpacity
                          key={option.id}
                          activeOpacity={0.85}
                          style={[
                            styles.optionButton,
                            {
                              borderColor: withOpacity(option.accent, isActive ? 0.6 : 0.2),
                              backgroundColor: withOpacity(option.accent, isActive ? 0.18 : 0.08),
                            },
                          ]}
                          onPress={() => handleSelectOption(option)}
                        >
                          <View style={[styles.optionIconWrapper, { backgroundColor: withOpacity(option.accent, 0.22) }]}>
                            <Icon size={s(24)} color={option.accent} />
                          </View>
                          <Text allowFontScaling={false} style={styles.optionLabel}>
                            {option.label}
                          </Text>
                          <Text allowFontScaling={false} style={styles.optionDescription}>
                            {option.description}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Animated.View>
              )}

              {showSummary && activeOption && SelectedIcon && (
                <Animated.View
                  entering={FadeIn.duration(220)}
                  exiting={FadeOut.duration(200)}
                  style={[styles.detailCard, { borderColor: withOpacity(activeOption.accent, 0.45) }]}
                >
                  <View style={[styles.detailIconShell, { backgroundColor: withOpacity(activeOption.accent, 0.18) }]}>
                    <SelectedIcon size={s(28)} color={activeOption.accent} />
                  </View>
                  <Text allowFontScaling={false} style={styles.detailTitle}>
                    Saved as {activeOption.label}
                  </Text>
                  <Text allowFontScaling={false} style={styles.detailDescription}>
                    We will keep this location marked as your {activeOption.label.toLowerCase()} so you can check out faster next time.
                  </Text>

                  <TouchableOpacity activeOpacity={0.9} style={[styles.primaryButton, { backgroundColor: activeOption.accent }]}>
                    <Text allowFontScaling={false} style={styles.primaryButtonLabel}>
                      Confirm {activeOption.label}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.9} style={styles.secondaryButton} onPress={handleChangeType}>
                    <Text allowFontScaling={false} style={styles.secondaryButtonLabel}>
                      Choose a different type
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        }
      />

      {onClose ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onClose}
          style={[styles.closeOverlayButton, { top: insets.top + vs(12) }]}
        >
          <ArrowLeft size={s(20)} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}

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
    backgroundColor: palette.surface,
  },
  mapOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeOverlayButton: {
    position: 'absolute',
    left: '20@s',
    width: '44@s',
    height: '44@s',
    borderRadius: '22@ms',
    backgroundColor: 'rgba(16, 24, 43, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: '1@s',
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  pinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinShadow: {
    position: 'absolute',
    bottom: '40@vs',
    width: '80@s',
    height: '80@vs',
    borderRadius: '40@ms',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    opacity: 0.4,
    transform: [{ scaleY: 0.3 }],
  },
  addressCard: {
    position: 'absolute',
    top: '32@vs',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '10@vs',
    paddingHorizontal: '16@s',
    borderRadius: '18@ms',
    backgroundColor: palette.sheet,
  },
  addressIcon: {
    width: '32@s',
    height: '32@s',
    borderRadius: '16@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accentMuted,
    marginRight: '10@s',
  },
  addressDetails: {
    flexShrink: 1,
    maxWidth: '200@s',
  },
  addressTitle: {
    color: palette.textPrimary,
    fontSize: '14@ms',
    fontWeight: '600',
  },
  addressActionLink: {
    color: palette.accent,
    fontSize: '12@ms',
    fontWeight: '700',
    marginTop: '6@vs',
  },
  addressError: {
    color: '#FCA5A5',
    fontSize: '10@ms',
    marginTop: '4@vs',
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
    backgroundColor: '#F8FAFC',
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
    paddingTop: '18@vs',
    paddingBottom: '24@vs',
  },
  locationSummary: {
    backgroundColor: palette.surface,
    borderRadius: '24@ms',
    paddingHorizontal: '20@s',
    paddingVertical: '18@vs',
    marginBottom: '18@vs',
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
    backgroundColor: 'rgba(23, 33, 58, 0.85)',
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
    borderRadius: '28@ms',
    paddingHorizontal: '20@s',
    paddingVertical: '24@vs',
    marginBottom: '18@vs',
  },
  searchPromptTitle: {
    color: palette.textPrimary,
    fontSize: '16@ms',
    fontWeight: '600',
  },
  searchPromptSubtitle: {
    color: palette.textSecondary,
    fontSize: '12@ms',
    marginTop: '6@vs',
  },
  searchLaunchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderRadius: '18@ms',
    paddingHorizontal: '14@s',
    paddingVertical: '12@vs',
    marginTop: '18@vs',
  },
  searchLaunchPlaceholder: {
    color: palette.textSecondary,
    fontSize: '13@ms',
  },
  selectionCard: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: '28@ms',
    paddingHorizontal: '20@s',
    paddingVertical: '24@vs',
  },
  selectionTitle: {
    color: palette.textPrimary,
    fontSize: '18@ms',
    fontWeight: '700',
  },
  selectionSubtitle: {
    color: palette.textSecondary,
    fontSize: '13@ms',
    marginTop: '6@vs',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: '20@vs',
  },
  optionButton: {
    width: '48%',
    borderRadius: '20@ms',
    paddingHorizontal: '14@s',
    paddingVertical: '16@vs',
    borderWidth: '1@s',
    marginBottom: '14@vs',
  },
  optionIconWrapper: {
    width: '40@s',
    height: '40@s',
    borderRadius: '20@ms',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10@vs',
  },
  optionLabel: {
    color: palette.textPrimary,
    fontSize: '15@ms',
    fontWeight: '600',
  },
  optionDescription: {
    color: palette.textSecondary,
    fontSize: '12@ms',
    marginTop: '6@vs',
  },
  detailCard: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: '28@ms',
    paddingHorizontal: '20@s',
    paddingVertical: '26@vs',
    borderWidth: '1@s',
  },
  detailIconShell: {
    width: '64@s',
    height: '64@s',
    borderRadius: '32@ms',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18@vs',
  },
  detailTitle: {
    color: palette.textPrimary,
    fontSize: '20@ms',
    fontWeight: '700',
  },
  detailDescription: {
    color: palette.textSecondary,
    fontSize: '13@ms',
    marginTop: '10@vs',
    lineHeight: '20@vs',
  },
  primaryButton: {
    marginTop: '28@vs',
    paddingVertical: '14@vs',
    borderRadius: '18@ms',
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: palette.textPrimary,
    fontSize: '15@ms',
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: '14@vs',
    paddingVertical: '12@vs',
    borderRadius: '16@ms',
    alignItems: 'center',
    borderWidth: '1@s',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  secondaryButtonLabel: {
    color: palette.textPrimary,
    fontSize: '14@ms',
  },
});
