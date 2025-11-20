import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { moderateScale, ScaledSheet, verticalScale } from 'react-native-size-matters';

import { useTranslation } from '~/localization';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleX } from 'lucide-react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scanPointsPayment } from '~/api/loyalty';
const palette = {
    accent: '#CA251B',
    dark: '#17213A',
};

const QrCodeOverlay = ({
    onClose,
    onResult,
}: {
    onClose: () => void;
    onResult: (result: { status: 'success' | 'error'; amountTnd?: number }) => void;
}) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const [permission, requestPermission] = useCameraPermissions();
    const [hasScanned, setHasScanned] = useState(false);


    const { mutateAsync: scan, isPending } = useMutation({
        mutationFn: (payload: { paymentToken: string }) =>
            scanPointsPayment(payload),
        onSuccess: (response) => {
            onResult({
                status: 'success',
                amountTnd: response.amountTnd,
            });
        },
        onError: () => {
            onResult({ status: 'error' });
        },
    });


    const handleBarcodeScanned = useCallback(
        (result: BarcodeScanningResult) => {
            if (hasScanned || isPending) {
                return;
            }

            const data = result.data;
            if (!data) {
                return;
            }

            setHasScanned(true);

            const token = String(data);

           
            onClose();

            
            scan({ paymentToken: token });
        },
        [hasScanned, isPending, onClose, scan],
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.backdrop, { paddingTop: insets.top }]}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>

                        <Text allowFontScaling={false} style={styles.title}>
                            {t("profile.Cash.qrScan")}
                        </Text>

                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text allowFontScaling={false} style={styles.closeButtonText}>
                                <CircleX color={palette.accent} size={moderateScale(24)} />
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {permission?.granted ? (
                        <View style={styles.cameraWrapper}>
                            <CameraView
                                style={styles.camera}
                                facing="back"
                                onBarcodeScanned={handleBarcodeScanned}
                                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                            />

                        </View>
                    ) : (
                        <View style={styles.permissionContainer}>

                            <Text allowFontScaling={false} style={styles.permissionText}>
                                {t("profile.Cash.permissionQr")}
                            </Text>
                            <TouchableOpacity
                                style={styles.permissionButton}
                                onPress={requestPermission}
                            >

                                <Text allowFontScaling={false} style={styles.permissionButtonText}>
                                    {t("profile.Cash.allowCamera")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );

};

const styles = ScaledSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', // overlay semi-transparent
        justifyContent: 'center',
        alignItems: 'center',
    },

    card: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',      // radius transparent du bord
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
        marginBottom: '12@vs',
    },

    title: {
        flex: 1,
        fontSize: '18@ms',
        fontWeight: '700',
        color: palette.dark,
        textAlign: 'center',
    },

    closeButton: {
        paddingHorizontal: '8@s',
        paddingVertical: '4@vs',
    },

    closeButtonText: {
        fontSize: '18@ms',
        color: palette.dark,
    },

    cameraWrapper: {
        borderRadius: '20@ms',     // radius appliqué à la caméra
        overflow: 'hidden',        // pour que la caméra soit arrondie
        height: verticalScale(260),
        backgroundColor: '#000',
    },

    camera: {
        flex: 1,
    },

    permissionContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: '16@vs',
    },

    permissionText: {
        textAlign: 'center',
        color: palette.dark,
        fontSize: '14@ms',
        marginBottom: '12@vs',
    },

    permissionButton: {
        paddingVertical: '8@vs',
        paddingHorizontal: '20@s',
        borderRadius: '20@ms',
        backgroundColor: palette.accent,
    },

    permissionButtonText: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        fontWeight: '600',
    },
});

export default QrCodeOverlay;
