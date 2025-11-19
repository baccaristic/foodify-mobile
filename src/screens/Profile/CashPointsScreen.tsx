import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check, Languages } from 'lucide-react-native';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import { availableLocales, useLocalization, useTranslation } from '~/localization';
import { ScaledSheet, moderateScale, s, vs } from 'react-native-size-matters';
import MainLayout from '~/layouts/MainLayout';

const palette = {
    accent: '#CA251B',
    accentDark: '#17213A',
    muted: '#6B7280',
};

const CashPointsScreen = () => {

    const { locale, setLocale } = useLocalization();
    const { t } = useTranslation();

    


    const customHeader = (
        <View style={styles.header}>
            <HeaderWithBackButton title={t('profile.Cash.title')} />
        </View>
    );
    const mainContent = (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Cash Points content here</Text>
        </View>

    );

    return (
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
    );





};

const styles = ScaledSheet.create({
    header: { borderBottomColor: 'rgba(211,211,211,0.4)', borderBottomWidth: 2 },


});
export default CashPointsScreen;