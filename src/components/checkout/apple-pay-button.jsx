'use client';
import React from 'react';

const ApplePayButton = () => {
  const [supported, setSupported] = React.useState(false);

  React.useEffect(() => {
    try {
      // Apple Pay JS API is only available in Safari with proper domain configuration.
      setSupported(typeof window !== 'undefined' && !!window.ApplePaySession);
    } catch {
      setSupported(false);
    }
  }, []);

  const onClick = () => {
    // Placeholder: real implementation must create ApplePaySession and send aToken to backend.
    // eslint-disable-next-line no-alert
    alert('Apple Pay button is added. ApplePaySession flow is not implemented yet.');
  };

  // Requirement: hide Apple Pay button entirely if device/browser does not support it.
  if (!supported) return null;

  return (
    <button
      type="button"
      className="tp-btn tp-btn-2 w-100"
      onClick={onClick}
      style={{
        background: '#000',
        color: '#fff',
        border: '1px solid #000',
      }}
      title={'Apple Pay'}
    >
      Apple Pay
    </button>
  );
};

export default ApplePayButton;
