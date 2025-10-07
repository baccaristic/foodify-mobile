import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import MainLayout from '~/layouts/MainLayout';

export default function DeleteAccountScreen() {
    const [step, setStep] = useState<'confirm' | 'deleting' | 'done'>('confirm');
    const [checked, setChecked] = useState(false);

    const handleDelete = () => {
        if (!checked) return;
        setStep('deleting');
        setTimeout(() => {
            setStep('done');
        }, 2500);
    };

    const customHeader = (
        <View>
            <HeaderWithBackButton title="Delete account & Data" titleMarginLeft={s(40)} />
        </View>
    );

    const renderConfirm = () => (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.warningBox}>
                <AlertTriangle size={70} color="#CA251B" />
                <Text style={styles.warningTitle}>This is Irreversible</Text>
                <Text style={styles.warningText}>
                    Deleting your account will permanently remove all your data, including earnings,
                    delivery history, and personal information.
                </Text>
            </View>

            <Text style={styles.confirmTitle}>Please confirm to continue</Text>

            <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setChecked(!checked)}
                activeOpacity={0.8}
            >
                <View
                    style={[
                        styles.checkbox,
                        { backgroundColor: checked ? '#CA251B' : 'transparent' },
                    ]}
                />
                <Text style={styles.checkboxLabel}>
                    I understand that deleting my account is permanent. All my data will be lost forever.
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.deleteButton,
                    { backgroundColor: checked ? '#CA251B' : '#F4CACA' },
                ]}
                disabled={!checked}
                onPress={handleDelete}
            >
                <Text style={styles.deleteText}>Delete My Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setStep('confirm')}
            >
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </ScrollView>
    );


    const renderDeleting = () => (
        <View style={styles.centerBox}>
            <ActivityIndicator color="#CA251B" size="large" />
            <Text style={styles.deletingTitle}>Deleting Your Account</Text>
            <Text style={styles.deletingText}>
                This may take a few moments. Please don’t close the app.
            </Text>
            <View style={styles.progressBarContainer}>
                <View style={styles.progressBar} />
            </View>
            <Text style={styles.deletingSubText}>
                You will be notified when the process is complete or if any issues arise
            </Text>
        </View>
    );


    const renderDone = () => (
        <View style={styles.centerBox}>
            <CheckCircle2 size={72} color="#CA251B" />
            <Text style={styles.doneTitle}>Account Deleted</Text>
            <Text style={styles.doneText}>
                Your account and all associated data have been successfully deleted.{"\n"}
                You will be logged out automatically.
            </Text>
            <TouchableOpacity style={styles.okayButton}>
                <Text style={styles.okayText}>Okay</Text>
            </TouchableOpacity>
        </View>
    );

    const mainContent = (
        <>
            {step === 'confirm' && renderConfirm()}
            {step === 'deleting' && renderDeleting()}
            {step === 'done' && renderDone()}
        </>
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
}

const styles = ScaledSheet.create({
    container: {
        paddingHorizontal: '16@s',
        paddingTop: '24@vs',
    },
    warningBox: {
        backgroundColor: '#FDEAEA',
        borderRadius: '12@ms',
        padding: '16@s',
        alignItems: 'center',
    },
    warningTitle: {
        fontSize: '16@ms',
        fontWeight: '700',
        color: '#CA251B',
        marginTop: '8@vs',
    },
    warningText: {
        fontSize: '12@ms',
        color: '#17213A',
        textAlign: 'center',
        marginTop: '6@vs',
    },
    confirmTitle: {
        fontSize: '15@ms',
        fontWeight: '700',
        color: '#17213A',
        marginTop: '20@vs',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: '12@vs',
    },
    checkbox: {
        width: '22@s',
        height: '22@s',
        borderWidth: 1.5,
        borderColor: '#CA251B',
        borderRadius: '6@ms',
        marginRight: '10@s',
    },
    checkboxLabel: {
        flex: 1,
        fontSize: '11@ms',
        color: '#17213A',
    },
    deleteButton: {
        paddingVertical: '12@vs',
        paddingHorizontal: '38@s',
        borderRadius: '10@ms',
        marginTop: '20@vs',
        alignSelf: 'center',
    },
    deleteText: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        fontWeight: '600',

    },
    cancelButton: {
        marginTop: '12@vs',
        backgroundColor: '#17213A',
        borderRadius: '10@ms',
        paddingVertical: '12@vs',
        paddingHorizontal: '80@vs',
        alignSelf: 'center',
    },
    cancelText: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        fontWeight: '600',
    },
    centerBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '24@s',
    },
    deletingTitle: {
        fontSize: '16@ms',
        fontWeight: '700',
        color: '#CA251B',
        marginTop: '20@vs',
    },
    deletingText: {
        textAlign: 'center',
        fontSize: '12@ms',
        color: '#17213A',
        marginVertical: '10@vs',
    },
    progressBarContainer: {
        width: '100%',
        height: '6@vs',
        backgroundColor: '#FADADA',
        borderRadius: '4@ms',
        overflow: 'hidden',
        marginVertical: '12@vs',
    },
    progressBar: {
        width: '50%',
        height: '100%',
        backgroundColor: '#CA251B',
    },
    deletingSubText: {
        textAlign: 'center',
        fontSize: '12@ms',
        color: '#999',
    },
    doneTitle: {
        fontSize: '17@ms',
        fontWeight: '700',
        color: '#CA251B',
        marginTop: '16@vs',
    },
    doneText: {
        textAlign: 'center',
        fontSize: '12@ms',
        color: '#17213A',
        marginTop: '8@vs',
        lineHeight: 20,
    },
    okayButton: {
        backgroundColor: '#17213A',
        borderRadius: '10@ms',
        paddingVertical: '12@vs',
        paddingHorizontal: '40@s',
        marginTop: '24@vs',
    },
    okayText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: '15@ms',
    },
});
