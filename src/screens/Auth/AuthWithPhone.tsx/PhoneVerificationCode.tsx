import VerificationCodeTemplate from '~/components/VerificationCodeTemplate';

const PhoneVerificationCode = () => {
   

    const handleResend = () => {
        console.log("Resending code via Email...");
    };

    return (
          <VerificationCodeTemplate
          contact="94500805"
            nextScreen="EmailEntry" 
            resendMethod="SMS"
            onResendPress={handleResend}
        />

    );
};

export default PhoneVerificationCode;