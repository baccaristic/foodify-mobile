import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Platform, StyleSheet } from 'react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { ChevronRight } from 'lucide-react-native';
import MainLayout from '~/layouts/MainLayout';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import { useTranslation } from '~/localization';

const palette = {
    accent: '#CA251B',
    accentDark: '#17213A',
    lightGray: '#F9FAFB',
};

const PrivacyScreen = () => {
    const [personalizedAds, setPersonalizedAds] = useState(true);
    const [locationAccess, setLocationAccess] = useState(true);
    const { t } = useTranslation();

    const customHeader = (
        <View>
            <HeaderWithBackButton title={t('profile.privacy.title')} titleMarginLeft={s(60)} />
        </View>
    );

    const mainContent = (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <Text allowFontScaling={false} style={styles.sectionTitle}>
                {t('profile.privacy.sections.personalization')}
            </Text>

            <View style={styles.card}>
                <View style={styles.rowTop}>
                    <Text allowFontScaling={false} style={styles.rowTitle}>
                        {t('profile.privacy.cards.personalizedRecommendations.title')}
                    </Text>
                    <Switch
                        value={personalizedAds}
                        onValueChange={setPersonalizedAds}
                        trackColor={{ false: '#ccc', true: '#CA251B40' }}
                        thumbColor={personalizedAds ? '#CA251B' : '#f4f3f4'}
                        ios_backgroundColor="#ccc"
                    />
                </View>
                <Text allowFontScaling={false} style={styles.rowDescription}>
                    {t('profile.privacy.cards.personalizedRecommendations.description')}
                </Text>
            </View>

            <Text allowFontScaling={false} style={styles.sectionTitle}>
                {t('profile.privacy.sections.location')}
            </Text>

            <View style={styles.card}>
                <View style={styles.rowTop}>
                    <Text allowFontScaling={false} style={styles.rowTitle}>
                        {t('profile.privacy.cards.location.title')}
                    </Text>
                    <Switch
                        value={locationAccess}
                        onValueChange={setLocationAccess}
                        trackColor={{ false: '#ccc', true: '#CA251B40' }}
                        thumbColor={locationAccess ? '#CA251B' : '#f4f3f4'}
                        ios_backgroundColor="#ccc"
                    />
                </View>
                <Text allowFontScaling={false} style={styles.rowDescription}>
                    {t('profile.privacy.cards.location.description')}
                </Text>
            </View>

            <Text allowFontScaling={false} style={styles.sectionTitle}>
                {t('profile.privacy.sections.data')}
            </Text>

            <View style={styles.card}>
                <TouchableOpacity activeOpacity={0.7} style={styles.linkRow}>
                    <Text allowFontScaling={false} style={styles.linkText}>
                        {t('profile.privacy.links.policy')}
                    </Text>
                    <ChevronRight size={s(18)} color={palette.accent} />
                </TouchableOpacity>

                <View style={styles.separator} />

                <TouchableOpacity activeOpacity={0.7} style={styles.linkRow}>
                    <Text allowFontScaling={false} style={styles.linkText}>
                        {t('profile.privacy.links.download')}
                    </Text>
                    <ChevronRight size={s(18)} color={palette.accent} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    return (
        <MainLayout
            showHeader
            showFooter
            collapsedHeader={false}
            enableHeaderCollapse={false}
            headerMaxHeight={vs(60)}
            headerMinHeight={vs(30)}
            activeTab="Profile"
            enforceResponsiveHeaderSize={false}
            customHeader={customHeader}
            mainContent={mainContent}
        />
    );
};

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: '4@s',
        borderTopColor: palette.lightGray,
        borderColor:palette.lightGray,
        borderTopWidth: 2,
        borderBottomWidth: 0,
    },
    scrollContent: {
        paddingHorizontal: '12@s',
    },
    sectionTitle: {
        color: palette.accent,
        fontSize: '18@ms',
        fontWeight: '700',
        marginBottom: '8@vs',
        marginTop: '12@vs',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '12@ms',
        paddingVertical: '12@vs',
        paddingHorizontal: '14@s',
        marginBottom: '16@vs',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: Platform.OS === 'android' ? 2 : 0,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    rowTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6@vs',
    },
    rowTitle: {
        fontSize: '15@ms',
        fontWeight: '700',
        color: '#000',
        flex: 1,
        paddingRight: '8@s',
    },
    rowDescription: {
        fontSize: '13@ms',
        color: palette.accentDark,
        opacity: 0.8,
    },
    linkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: '12@vs',
    },
    linkText: {
        color: palette.accent,
        fontSize: '15@ms',
        fontWeight: '600',
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
});

export default PrivacyScreen;
