'use client';
import React from 'react';
import { useParams } from 'next/navigation';

const ApplePayButton = () => {
  const [supported, setSupported] = React.useState(false);
  const { locale } = useParams();

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
      onClick={onClick}
      lang={locale}
      // Apple Pay "standard" button styles
      // Docs: https://developer.apple.com/design/human-interface-guidelines/apple-pay/overview/buttons-and-marks/
      style={{
        WebkitAppearance: 'none',
        appearance: 'none',
        width: '100%',
        height: 48,
        borderRadius: 10,
        border: '1px solid #000',
        backgroundColor: '#000',
        color: '#fff',
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: 0.2,
        cursor: 'pointer',
      }}
      title={'Apple Pay'}
      aria-label={'Apple Pay'}
    >
      {/* Keep it simple: black button with Apple Pay label */}
      Apple Pay
    </button>
  );
};

export default ApplePayButton;
