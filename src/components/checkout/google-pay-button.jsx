'use client';
import React from 'react';
import { useGooglePayMutation } from '@/redux/features/paymentsApi';

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
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [googlePay, { isLoading }] = useGooglePayMutation();

  const paymentsClientRef = React.useRef(null);

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
      environment: 'PRODUCTION',
    });
    console.log('Google Pay client initialized');
  }, [ready]);

  const buildPaymentDataRequest = () => {
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
  };

  const extractGToken = (paymentData) => {
    return paymentData?.paymentMethodData?.tokenizationData?.token ?? '';
  };

  const onClick = async () => {
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
  };

  // Minimal placeholder button (do not call Google Pay until backend ready)
  return (
    <div>
      <button
        type="button"
        className="tp-btn tp-btn-2 w-100"
        onClick={onClick}
        disabled={!ready || isLoading}
      >
        {isLoading ? 'Processing...' : 'Google Pay'}
      </button>
      {error && <div style={{ marginTop: 8, fontSize: 12, color: '#b00020' }}>{error}</div>}
    </div>
  );
};

export default GooglePayButton;
