import { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { ScaledSheet, s } from 'react-native-size-matters';
import { ArrowLeft, Search } from 'lucide-react-native';


const palette = {
  backdrop: 'rgba(15, 23, 42, 0.48)',
  sheet: '#FFFFFF',
  surface: '#F5F7FA',
  surfaceAlt: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  accent: '#E03131',
  divider: '#E2E8F0',
};

export interface LocationPrediction {
  placeId: string;
  primaryText: string;
  secondaryText?: string;
  description: string;
}

interface LocationSearchOverlayProps {
  visible: boolean;
  query: string;
  loading: boolean;
  predictions: LocationPrediction[];
  error?: string | null;
  onChangeQuery: (text: string) => void;
  onSelectPrediction: (prediction: LocationPrediction) => void;
  onClose: () => void;
  onSubmitQuery: () => void;
}

export default function LocationSearchOverlay({
  visible,
  query,
  loading,
  predictions,
  error,
  onChangeQuery,
  onSelectPrediction,
  onClose,
  onSubmitQuery,
}: LocationSearchOverlayProps) {
  const inputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (!visible) {
      inputRef.current?.blur();
      return;
    }

    const focusTimeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => clearTimeout(focusTimeout);
  }, [visible]);

  const emptyState = useMemo(() => {
    if (!query.trim()) {
      return 'Start typing to search for a street, building or area.';
    }
    if (loading) {
      return '';
    }
    if (error) {
      return error;
    }
    if (!predictions.length) {
      return 'No matching places. Try refining the keywords.';
    }
    return '';
  }, [error, loading, predictions.length, query]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoider}
        >
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutDown.duration(160)}
            style={styles.sheet}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <ArrowLeft size={s(20)} color={palette.textPrimary} />
              </TouchableOpacity>
              <View style={styles.inputContainer}>
                <Search size={s(18)} color={palette.textSecondary} style={styles.inputIcon} />
                <TextInput
                  ref={inputRef}
                  value={query}
                  onChangeText={onChangeQuery}
                  onSubmitEditing={onSubmitQuery}
                  placeholder="Enter street, building number, etc"
                  placeholderTextColor={palette.textSecondary}
                  style={styles.input}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.resultsWrapper}>
              {loading && (
                <View style={styles.loaderWrapper}>
                  <ActivityIndicator size="small" color={palette.accent} />
                </View>
              )}

              {!loading && !!predictions.length && (
                <FlatList
                  data={predictions}
                  keyExtractor={(item) => item.placeId}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.resultItem}
                      onPress={() => onSelectPrediction(item)}
                    >
                      <Text allowFontScaling={false} style={styles.resultTitle}>
                        {item.primaryText}
                      </Text>
                      {item.secondaryText ? (
                        <Text allowFontScaling={false} style={styles.resultSubtitle}>
                          {item.secondaryText}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  )}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.resultsContent}
                />
              )}

              {!loading && !predictions.length && emptyState ? (
                <View style={styles.emptyState}>
                  <Text allowFontScaling={false} style={styles.emptyText}>
                    {emptyState}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text allowFontScaling={false} style={styles.poweredBy}>
              Powered by Google
            </Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = ScaledSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: palette.backdrop,
    justifyContent: 'flex-end',
  },
  keyboardAvoider: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.sheet,
    paddingTop: '36@vs',
    paddingHorizontal: '20@s',
    paddingBottom: Platform.OS === 'ios' ? '30@vs' : '24@vs',
    borderTopLeftRadius: '32@ms',
    borderTopRightRadius: '32@ms',
    minHeight: '70%',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: '20@ms',
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '20@vs',
  },
  backButton: {
    width: '40@s',
    height: '40@s',
    borderRadius: '20@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    marginRight: '12@s',
    borderWidth: 1,
    borderColor: palette.divider,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceAlt,
    borderRadius: '20@ms',
    paddingHorizontal: '14@s',
    paddingVertical: Platform.OS === 'ios' ? '10@vs' : '8@vs',
    borderWidth: 1,
    borderColor: palette.divider,
  },
  inputIcon: {
    marginRight: '8@s',
  },
  input: {
    flex: 1,
    color: palette.textPrimary,
    fontSize: '14@ms',
  },
  resultsWrapper: {
    flex: 1,
    marginTop: '24@vs',
  },
  loaderWrapper: {
    paddingVertical: '20@vs',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsContent: {
    paddingBottom: '12@vs',
  },
  resultItem: {
    paddingVertical: '14@vs',
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  resultTitle: {
    color: palette.textPrimary,
    fontSize: '15@ms',
    fontWeight: '600',
  },
  resultSubtitle: {
    color: palette.textSecondary,
    fontSize: '12@ms',
    marginTop: '4@vs',
  },
  emptyState: {
    paddingVertical: '24@vs',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '16@s',
  },
  emptyText: {
    color: palette.textSecondary,
    fontSize: '13@ms',
    textAlign: 'center',
    lineHeight: '20@vs',
  },
  poweredBy: {
    color: palette.textSecondary,
    fontSize: '11@ms',
    textAlign: 'center',
    marginTop: '16@vs',
  },
});



