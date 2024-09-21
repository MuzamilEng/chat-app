import { useTranslationContext } from 'context/TranslationContext';
import React, { useEffect } from 'react';

function Thanks() {
  const { setCurrentStep } = useTranslationContext();

  useEffect(() => {
    setCurrentStep(6); // Assuming step 6 is 'Thanks' or similar
  }, []);

  return (
    <div className="thanks-message-container">
      <div className="thank-you-box">
        <h1>Thank you for your registration!</h1>
        <p>Your account is currently under review.</p>
        <p>You will be notified via E-Mail once your account has been verified.</p>
        <p>This process may take up to 48 hours.</p>
      </div>
    </div>
  );
}

export default Thanks;
