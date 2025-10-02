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
            codeLength={5}
        />

    );
};

export default EmailVerificationCode;