'use client';
import React from 'react';
import {
  useGooglePayMutation,
  useGetPaymentConfigQuery,
} from '@/redux/features/paymentsApi';
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
  gatewayMerchantId: gatewayMerchantIdProp,
  // async () => orderId — создаёт заказ (или возвращает уже созданный).
  // Бэкенд берёт сумму из заказа, поэтому без order_id оплата невозможна.
  resolveOrderId,
  // (response, orderId) => void — куда вести пользователя после списания.
  onResult,
}) => {
  const { locale } = useParams();
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [googlePay, { isLoading }] = useGooglePayMutation();
  const { data: paymentConfig, isError: isConfigError } =
    useGetPaymentConfigQuery(undefined, { refetchOnMountOrArgChange: true });
  // Режим и merchantId управляются бэком (PaymentSettings).
  // Fallback'а на TEST здесь намеренно нет: молчаливый откат в тест на боевом
  // режиме означал бы, что оплата не проходит по-настоящему.
  const gpayEnvironment = paymentConfig?.google_pay_environment;
  const gatewayMerchantId =
    paymentConfig?.google_pay_merchant_id || gatewayMerchantIdProp;
  const configReady = Boolean(gpayEnvironment && gatewayMerchantId);

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
    // Без конфига с бэка клиент не создаём — иначе он залипнет в TEST.
    if (!configReady) return;
    paymentsClientRef.current = new window.google.payments.api.PaymentsClient({
      // Режим (TEST/PRODUCTION) приходит с бэка через /payments/config/.
      // Переключается в Django admin или из админ-бота.
      environment: gpayEnvironment,
      // Locale affects the Google Pay UI language.
      locale,
    });
    console.log('Google Pay client initialized', { environment: gpayEnvironment });
  }, [locale, ready, gpayEnvironment, configReady]);

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

      // Заказ создаём ПОСЛЕ шита Google Pay: loadPaymentData обязан вызываться
      // из user gesture, а любой await до него ломает открытие окна.
      // Списания на этом шаге ещё нет — оно происходит на нашем POST ниже,
      // поэтому неудачное создание заказа деньги не трогает.
      const orderId = await resolveOrderId?.();
      if (!orderId) {
        throw new Error('Не вдалося створити замовлення — перевірте поля форми');
      }

      const res = await googlePay({
        gToken,
        order_id: orderId,
        redirectUrl: `${window.location.origin}/api/monobank/redirect?locale=${encodeURIComponent(
          locale
        )}&order_id=${encodeURIComponent(orderId)}&result=success`,
      }).unwrap();
      console.log('Google Pay backend response:', res);
      onResult?.(res, orderId);
    } catch (e) {
      console.error('Google Pay click error:', {
        message: e?.message || String(e),
        name: e?.name,
        code: e?.code,
        stack: e?.stack,
        keys: e ? Object.getOwnPropertyNames(e) : [],
        raw: e,
      });
      // Пользователь закрыл шит Google Pay — это не ошибка, сообщение не нужно.
      if (e?.statusCode === 'CANCELED') return;
      setError(
        e?.data?.detail ||
          e?.data?.order_id?.[0] ||
          e?.message ||
          String(e)
      );
    }
  }, [
    buildPaymentDataRequest,
    googlePay,
    gatewayMerchantId,
    ready,
    resolveOrderId,
    onResult,
    locale,
  ]);

  // Render official Google Pay button UI (via PaymentsClient.createButton)
  React.useEffect(() => {
    if (!ready) return;
    if (!configReady) return;
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
  }, [onClick, ready, configReady]);

  return (
    <div>
      <div ref={buttonRootRef} />
      {/* Fallback / loading state */}
      {(!ready || !configReady) && (
        <button type="button" className="tp-btn tp-btn-2 w-100" disabled>
          Google Pay
        </button>
      )}
      {isLoading && (
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>Processing…</div>
      )}
      {isConfigError && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#b00020' }}>
          Не вдалося отримати конфігурацію оплати. Оновіть сторінку.
        </div>
      )}
      {error && <div style={{ marginTop: 8, fontSize: 12, color: '#b00020' }}>{error}</div>}
    </div>
  );
};

export default GooglePayButton;
