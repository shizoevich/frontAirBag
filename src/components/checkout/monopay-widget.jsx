'use client';
import React from 'react';
import { loadMonoPayScript } from '@/utils/monobank-widget';

const DEFAULT_UI = {
  buttonType: 'pay',
  theme: 'dark',
  corners: 'rounded',
};

const noop = () => {};

const MonoPayWidget = ({ config, callbacks = {} }) => {
  const containerRef = React.useRef(null);
  const cleanupRef = React.useRef(() => {});

  const memoedCallbacks = React.useMemo(
    () => ({
      onButtonReady: callbacks.onButtonReady ?? noop,
      onClick: callbacks.onClick ?? noop,
      onInvoiceCreate: callbacks.onInvoiceCreate ?? noop,
      onSuccess: callbacks.onSuccess ?? noop,
      onError: callbacks.onError ?? noop,
      ui: callbacks.ui ?? DEFAULT_UI,
    }),
    [callbacks]
  );

  React.useEffect(() => {
    if (!config) {
      cleanupRef.current();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      return;
    }

    let isUnmounted = false;

    const init = async () => {
      try {
        await loadMonoPayScript();
        if (isUnmounted) return;
        const MonoPay = window?.MonoPay;
        if (!MonoPay || typeof MonoPay.init !== 'function') {
          throw new Error('MonoPay SDK is not available');
        }

        const { button, destroy } = MonoPay.init({
          ...config,
          ui: memoedCallbacks.ui,
          callbacks: {
            onButtonReady: memoedCallbacks.onButtonReady,
            onClick: memoedCallbacks.onClick,
            onInvoiceCreate: memoedCallbacks.onInvoiceCreate,
            onSuccess: memoedCallbacks.onSuccess,
            onError: memoedCallbacks.onError,
          },
        });

        cleanupRef.current = () => {
          if (typeof destroy === 'function') destroy();
          if (button && containerRef.current?.contains(button)) {
            containerRef.current.removeChild(button);
          }
        };

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          if (button) {
            containerRef.current.appendChild(button);
          }
        }
      } catch (error) {
        if (isUnmounted) return;
        memoedCallbacks.onError(error);
      }
    };

    init();

    return () => {
      isUnmounted = true;
      cleanupRef.current();
    };
  }, [config, memoedCallbacks]);

  return <div ref={containerRef} id="mono-pay-widget-root" />;
};

export default MonoPayWidget;
