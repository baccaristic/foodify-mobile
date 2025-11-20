import { CircleX, CircleCheckBig } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, ScaledSheet, verticalScale } from 'react-native-size-matters';
import { useTranslation } from '~/localization';

const palette = {
    accent: '#CA251B',
    dark: '#17213A',
};

const QrResultOverlay = ({
    onClose,
    status,
    amountTnd,
}: {
    onClose: () => void;
    status: 'success' | 'error';
    amountTnd?: number;
}) => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();


    return (

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.backdrop, { paddingTop: insets.top }]}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text allowFontScaling={false} style={styles.closeButtonText}>
                                <CircleX color={palette.accent} size={moderateScale(24)} />
                            </Text>
                        </TouchableOpacity>

                    </View>
                    <View style={styles.content}>
                        {status === 'success' ? (
                            <>
                                <CircleCheckBig color="#22C55E" size={moderateScale(72)} />


                                <Text allowFontScaling={false} style={styles.statusTitleSuccess}>
                                    {t("profile.Cash.success")}
                                </Text>


                                <Text allowFontScaling={false} style={styles.statusMessage}>
                                    {t("profile.Cash.ptsWith")}
                                </Text>


                                <Text allowFontScaling={false} style={styles.amountText}>
                                    {amountTnd} Dt
                                </Text>

                                <Text allowFontScaling={false} style={styles.statusMessage}>
                                    {t('profile.Cash.transferred')}
                                </Text>

                            </>
                        ) : (
                            <>
                                <CircleX color={palette.accent} size={moderateScale(72)} />

                                <Text allowFontScaling={false} style={styles.statusTitleFailure}>
                                     {t('profile.Cash.fail')}
                                </Text>

                                <Text allowFontScaling={false} style={styles.statusMessage}>
                                    {t('profile.Cash.insufficient')}
                                </Text>
                            </>
                        )}
                    </View>


                </View>

            </View>
        </TouchableWithoutFeedback>

    );

};

const styles = ScaledSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        padding: '16@s',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeButton: {
        paddingHorizontal: '8@s',
        paddingVertical: '4@vs',
    },

    closeButtonText: {
        fontSize: '18@ms',
        color: palette.dark,
    },

    statusTitle: {
        marginTop: '16@vs',
        fontSize: '22@ms',
        fontWeight: '700',
        color: palette.accent,
    },


    content: {
        
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: '24@vs',
    },

    statusTitleSuccess: {
        marginTop: '16@vs',
        fontSize: '22@ms',
        fontWeight: '700',
        color: '#22C55E',
    },

    statusTitleFailure: {
        marginTop: '16@vs',
        fontSize: '22@ms',
        fontWeight: '700',
        color: palette.accent,
    },

    statusMessage: {
        marginTop: '8@vs',
        fontSize: '14@ms',
        color: palette.dark,
        textAlign: 'center',
    },

    amountText: {
        marginTop: '8@vs',
        fontSize: '22@ms',
        fontWeight: '700',
        color: palette.accent,
    },

});
export default QrResultOverlay;
