'use client'
import React, { useEffect, useState } from 'react';
import store from "@/redux/store";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// stripePromise
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const Providers = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Suppress browser extension warnings
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('hydration') || 
         args[0].includes('cz-shortcut-listen') ||
         args[0].includes('server rendered HTML'))
      ) {
        return;
      }
      originalError.call(console, ...args);
    };
  }, []);

  if (!hasMounted) {
    return (
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <Provider store={store}>
          <Elements stripe={stripePromise}>
            <div style={{ minHeight: '100vh' }}>
              {children}
            </div>
          </Elements>
        </Provider>
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <Elements stripe={stripePromise}>
          {children}
        </Elements>
      </Provider>
    </GoogleOAuthProvider>
  );
};

export default Providers;