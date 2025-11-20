import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import {useLocalization, useTranslation } from '~/localization';
import { ScaledSheet, moderateScale, s, vs } from 'react-native-size-matters';
import MainLayout from '~/layouts/MainLayout';
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { getLoyaltyBalance } from "~/api/loyalty";
import QrCodeOverlay from '~/components/QrCodeOverlay';

const FOODY_IMAGE = require('../../../assets/foodypoints.png');


const formatPointsValue = (value: number) => {
    if (!Number.isFinite(value)) return "0";
    const absolute = Math.abs(value);
    const fractionDigits = absolute % 1 === 0 ? 0 : 2;
    return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: 2,
    }).format(value);
};

const palette = {
    accent: '#CA251B',
    accentDark: '#17213A',
    muted: '#6B7280',
};

const CashPointsScreen = () => {

    const { locale, setLocale } = useLocalization();
    const [showQrOverlay, setShowQrOverlay] = useState(false);
    const { t } = useTranslation();
    const {
        data: balance,
        isFetching: isBalanceFetching,
        refetch: refetchBalance,
    } = useQuery({
        queryKey: ["loyalty", "balance"],
        queryFn: getLoyaltyBalance,
    });

    const rawPoints = Number(balance?.balance ?? 0);
    const totalPoints = formatPointsValue(rawPoints);
    const equivalentTnd = formatPointsValue(rawPoints * 0.01);

    const refreshing = isBalanceFetching;



    const customHeader = (
        <View style={styles.header}>
            <HeaderWithBackButton title={t('profile.Cash.title')} />
        </View>
    );
    const mainContent = (

        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: moderateScale(16),
            }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    colors={[palette.accent]}
                    onRefresh={() => {
                        refetchBalance();
                    }}
                />
            }


            showsVerticalScrollIndicator={false}
        >
            <View style={{ flex: 1 }}>
                <View style={styles.logoContainer}>
                    <Image
                        source={FOODY_IMAGE}
                        style={{ width: 160, height: 160 }}
                        contentFit="contain"
                    />
                </View>
                <Text allowFontScaling={false} style={styles.payWithText}>
                    {t("profile.Cash.payWith")}
                </Text>

                <View style={styles.pointsCard}>
                    <View>
                        <Text allowFontScaling={false} style={styles.smallLabel}>
                            {t("profile.Cash.total")}
                        </Text>

                        <Text allowFontScaling={false} style={styles.bigValue}>

                            {totalPoints}
                        </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                        <View style={styles.equalRow}>

                            <Text allowFontScaling={false} style={styles.equalLabel}>
                                {t("profile.Cash.equal")}
                            </Text>
                            <Text allowFontScaling={false} style={styles.equalValue}>
                                {equivalentTnd} dt

                            </Text>
                        </View>
                    </View>

                </View>

                <TouchableOpacity style={styles.scanButton} activeOpacity={0.8} onPress={() => setShowQrOverlay(true)}>

                    <Text allowFontScaling={false} style={styles.scanButtonText}>
                        {t("profile.Cash.qrScan")}
                    </Text>
                </TouchableOpacity>


            </View>

        </ScrollView>


    );

    return (
        <>
            <MainLayout
                showHeader
                showFooter
                collapsedHeader={false}
                enableHeaderCollapse={false}
                headerMaxHeight={vs(70)}
                headerMinHeight={vs(30)}
                activeTab="Profile"
                enforceResponsiveHeaderSize={false}
                customHeader={customHeader}
                mainContent={mainContent}
            />
            {showQrOverlay && (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                >
                    <QrCodeOverlay onClose={() => setShowQrOverlay(false)} />
                </View>
            )}
        </>
    );





};

const styles = ScaledSheet.create({
    header: { borderBottomColor: 'rgba(211,211,211,0.4)', borderBottomWidth: 2 },
    logoContainer: {
        alignItems: "center",
    },
    payWithText: {
        marginTop: '12@vs',
        fontSize: '20@ms',
        color: palette.accentDark,
        fontWeight: '500',
    },
    pointsCard: {
        marginTop: '16@vs',
        backgroundColor: '#FFFFFF',
        borderRadius: '16@ms',
        borderColor: '#F5F6F7',
        borderWidth: 2,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: '14@vs',
        paddingHorizontal: '14@s',
    },
    equalLabel: {
        marginTop: '4@vs',
        fontSize: '16@ms',
        fontWeight: '500',
        color: palette.accentDark,
    },

    smallLabel: {
        color: palette.muted,
        fontSize: '12@ms',
    },

    bigValue: {
        marginTop: '4@vs',
        fontSize: '20@ms',
        fontWeight: '700',
        color: palette.accentDark,
    },

    equalValue: {
        marginTop: '4@vs',
        fontSize: '16@ms',
        fontWeight: '700',
        color: palette.accent,
    },

    scanButton: {
        marginTop: '24@vs',
        alignSelf: 'center',
        backgroundColor: palette.accent,
        borderRadius: '20@ms',
        paddingVertical: '10@vs',
        paddingHorizontal: '32@s',
    },

    scanButtonText: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        fontWeight: '700',
    },
    equalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(4),
    },



});
export default CashPointsScreen;