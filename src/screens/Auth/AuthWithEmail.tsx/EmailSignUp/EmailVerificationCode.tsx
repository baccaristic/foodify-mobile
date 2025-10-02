import VerificationCodeTemplate from '~/components/VerificationCodeTemplate';

const EmailVerificationCode = () => {
  

    const handleResend = () => {
        console.log("Resending code via Email...");
    };

    return (
          <VerificationCodeTemplate
          contact="flenfoulani@email.com"
            nextScreen="PhoneNumberEntry" 
            resendMethod="Email"
            onResendPress={handleResend}
        />

    );
};

export default EmailVerificationCode;