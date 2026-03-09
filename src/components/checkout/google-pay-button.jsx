'use client';
import React from 'react';
import { useGooglePayMutation } from '@/redux/features/paymentsApi';
import { useParams } from 'next/navigation';

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve(false);
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return resolve(true);
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const GooglePayButton = ({
  amountMinor,
  currencyCode = 'UAH',
  merchantName = 'Merchant',
  gatewayMerchantId,
}) => {
  const { locale } = useParams();
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [googlePay, { isLoading }] = useGooglePayMutation();

  const paymentsClientRef = React.useRef(null);
  const buttonRootRef = React.useRef(null);

  React.useEffect(() => {
    loadScriptOnce('https://pay.google.com/gp/p/js/pay.js')
      .then(() => setReady(true))
      .catch((e) => setError(String(e)));
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    if (typeof window === 'undefined') return;
    if (!window.google?.payments?.api) return;
    paymentsClientRef.current = new window.google.payments.api.PaymentsClient({
      // TEST environment for development/testing.
      // Switch to PRODUCTION only when merchant is approved and IDs are live.
      environment: 'TEST',
      // Locale affects the Google Pay UI language.
      locale,
    });
    console.log('Google Pay client initialized');
  }, [locale, ready]);

  const buildPaymentDataRequest = React.useCallback(() => {
    const totalPrice = (Number(amountMinor || 0) / 100).toFixed(2);
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['VISA', 'MASTERCARD'],
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'monobank',
              gatewayMerchantId,
            },
          },
        },
      ],
      merchantInfo: {
        merchantName,
        merchantId: gatewayMerchantId,
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice,
        currencyCode,
      },
    };
  }, [amountMinor, currencyCode, gatewayMerchantId, merchantName]);

  const extractGToken = (paymentData) => {
    return paymentData?.paymentMethodData?.tokenizationData?.token ?? '';
  };

  const onClick = React.useCallback(async () => {
    try {
      if (!ready) throw new Error('Google Pay SDK not loaded yet');
      if (!gatewayMerchantId) throw new Error('Google Pay gatewayMerchantId is not configured');

      const client = paymentsClientRef.current;
      if (!client) throw new Error('Google Pay client is not initialized');

      const paymentDataRequest = buildPaymentDataRequest();
      const paymentData = await client.loadPaymentData(paymentDataRequest);
      const gToken = extractGToken(paymentData);

      if (!gToken) throw new Error('gToken is empty');

      // Send token to backend
      const res = await googlePay({ gToken }).unwrap();
      console.log('Google Pay backend response:', res);
    } catch (e) {
      console.error('Google Pay click error:', e);
      setError(e?.message || String(e));
    }
  }, [buildPaymentDataRequest, googlePay, gatewayMerchantId, ready]);

  // Render official Google Pay button UI (via PaymentsClient.createButton)
  React.useEffect(() => {
    if (!ready) return;
    if (typeof window === 'undefined') return;

    const client = paymentsClientRef.current;
    const root = buttonRootRef.current;
    if (!client || !root) return;

    // Clean previous button on re-render
    root.innerHTML = '';

    const button = client.createButton({
      onClick,
      buttonType: 'buy',
      buttonColor: 'default',
      buttonSizeMode: 'fill',
    });

    // Ensure full width in our layout
    button.style.width = '100%';
    button.style.borderRadius = '10px';
    root.appendChild(button);
  }, [onClick, ready]);

  return (
    <div>
      <div ref={buttonRootRef} />
      {/* Fallback / loading state */}
      {!ready && (
        <button type="button" className="tp-btn tp-btn-2 w-100" disabled>
          Google Pay
        </button>
      )}
      {isLoading && (
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>Processing…</div>
      )}
      {error && <div style={{ marginTop: 8, fontSize: 12, color: '#b00020' }}>{error}</div>}
    </div>
  );
};

export default GooglePayButton;
