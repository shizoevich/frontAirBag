'use client';
import React from 'react';
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import Cookies from "js-cookie";
import Link from "next/link";
// internal
import SimplifiedBillingArea from "./simplified-billing-area";
import CheckoutLoginDiscount from "./checkout-login-discount";
import UserInfoModal from "./user-info-modal";
import GuestRegistrationModal from './guest-registration-modal';
import PaymentModal from './payment-modal';
import GooglePayButton from './google-pay-button';
import useOrderCheckout from "@/hooks/use-order-checkout";
import useCartInfo from "@/hooks/use-cart-info";
import { useGetOrdersQuery } from "@/redux/features/ordersApi";
import { useGetDiscountsQuery } from "@/redux/features/discountsApi";
import { useCreatePaymentMutation } from "@/redux/features/paymentsApi";
import { notifyError, notifyInfo } from '@/utils/toast';
import { resolveMonobankPageUrl } from '@/utils/monobank-url';

const OrderCheckoutArea = () => {
  const t = useTranslations('Checkout');
  const router = useRouter();
  const { locale } = useParams();
  
  const [monoPageUrl, setMonoPageUrl] = React.useState(null);
  const [lastOrderId, setLastOrderId] = React.useState(null);
  const [isCreatingPayment, setIsCreatingPayment] = React.useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [monoPaymentError, setMonoPaymentError] = React.useState(null);

  const [createPayment] = useCreatePaymentMutation();

  const {
    handleSubmit,
    submitHandler,
    register,
    formState: { errors },
    setValue,
    watch,
    handleCouponCode,
    handleShippingCost,
    couponRef,
    couponApplyMsg,
    showUserInfoModal,
    setShowUserInfoModal,
    handleUserInfoSubmit,
    showGuestRegistrationModal,
    handleGuestRegistrationClose,
    handleGuestRegistrationRegister,
    paymentMethod,
    setPaymentMethod,
    user,
    accessToken,
    subtotal,
    shippingCost,
    discountAmount,
    total,
    isCheckoutSubmit
  } = useOrderCheckout();

  const getCurrentAccessToken = React.useCallback(() => {
    // Redux token can be stale inside an async handler before re-render.
    // Always try cookies/localStorage as well.
    try {
      if (accessToken) return accessToken;
      const cookieRaw = Cookies.get('userInfo');
      if (cookieRaw) {
        const parsed = JSON.parse(cookieRaw);
        if (parsed?.accessToken) return parsed.accessToken;
      }
    } catch (e) {
      console.warn('Failed to read accessToken from cookies:', e);
    }

    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.accessToken) return parsed.accessToken;
      }
    } catch (e) {
      console.warn('Failed to read accessToken from localStorage:', e);
    }

    return null;
  }, [accessToken]);
  
  const { cart_products } = useSelector((state) => state.cart);
  const { isGuest } = useSelector((state) => state.auth);
  const { quantity } = useCartInfo();

  const showPaymentFrame = paymentMethod === "pay_now" && (isCreatingPayment || !!monoPageUrl);

  // When pay_now is the default selected option, onChange won't fire.
  // This ensures we still create a payment URL once when pay_now is active.
  const didAutoCreatePaymentRef = React.useRef(false);

  // Guests typically don't have permission to list orders -> avoid noisy 403
  const { data: ordersData } = useGetOrdersQuery(undefined, {
    skip: !accessToken || isGuest,
  });
  const { data: discountsData } = useGetDiscountsQuery();

  const formatPrice = (priceMinor) => {
    return (priceMinor / 100).toFixed(2);
  };

  // Рассчитываем текущую скидку пользователя
  const calculateCurrentDiscount = () => {
    if (isGuest) return 0;
    if (!ordersData || !discountsData) return 0;
    
    const orders = ordersData.results || ordersData.data || ordersData;
    const discounts = discountsData.results || discountsData.data || discountsData;
    
    if (!Array.isArray(orders) || !Array.isArray(discounts)) return 0;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Начало и конец прошлого месяца
    const previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const previousMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    // Считаем сумму за прошлый месяц
    let previousMonthTotal = 0;
    orders
      .filter(order => order.is_paid || order.is_completed)
      .forEach(order => {
        const orderDate = new Date(order.created_at || order.date);
        if (orderDate >= previousMonthStart && orderDate <= previousMonthEnd) {
          previousMonthTotal += (order.grand_total_minor || 0) / 100;
        }
      });
    
    // Определяем скидку на основе суммы прошлого месяца
    const sortedDiscounts = [...discounts].sort((a, b) => (b.month_payment || 0) - (a.month_payment || 0));
    
    for (const discount of sortedDiscounts) {
      const threshold = (discount.month_payment || 0) / 100;
      if (previousMonthTotal >= threshold) {
        return parseFloat(discount.percentage);
      }
    }
    
    return 0;
  };

  const currentDiscountPercent = calculateCurrentDiscount();

  // Create payment via backend API (api/v2/payments/create/).
  // NOTE: backend requires `order_id`, so we can only create payment AFTER order is created.
 const customSubmitHandler = async (formData) => {
     const createdOrder = await submitHandler(formData);

     if (!createdOrder?.id) return;

     setLastOrderId(createdOrder.id);

     if (paymentMethod === "pay_now") {
       await createMonoPayment(createdOrder.id);
     }
   };

  const createMonoPayment = async (orderId) => {
    try {
      setIsCreatingPayment(true);
      setMonoPaymentError(null);
      // Custom button only: do not render MonoPay widget.

      // Monobank supports dedicated success/fail return URLs.
      const success_url = `${window.location.origin}/api/monobank/redirect?locale=${encodeURIComponent(
        locale
      )}&order_id=${encodeURIComponent(orderId)}&result=success`;
      const fail_url = `${window.location.origin}/api/monobank/redirect?locale=${encodeURIComponent(
        locale
      )}&order_id=${encodeURIComponent(orderId)}&result=failed`;
      const redirect_url = fail_url;
      console.log('Creating Monobank payment (RTK):', { orderId, redirect_url, success_url, fail_url });

      const data = await createPayment({
        order_id: orderId,
        redirect_url,
        success_url,
        fail_url,
      }).unwrap();

      console.log('Monobank payment raw response:', { data });

      // backend may return different field names depending on implementation
      const pageUrl = resolveMonobankPageUrl(data);

      console.log('Monobank payment resolved pageUrl:', pageUrl);

      if (pageUrl) {
        setMonoPageUrl(pageUrl);
        setIsPaymentModalOpen(true);

        // Modal-only UX: no inline iframe scroll
      } else {
        throw new Error(`Payment creation succeeded but payment URL is missing. Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      const status = error?.status ?? error?.error?.status;
      const data = error?.data ?? error?.error?.data;
      const message =
        data?.detail ||
        data?.message ||
        error?.message ||
        error?.error ||
        'Monobank payment error';

      console.error('Monobank payment error:', { status, message, data, raw: error });
      setMonoPaymentError(message);
      notifyError(t('monobank_payment_create_failed'));
    } finally {
      setIsCreatingPayment(false);
    }
  };

  React.useEffect(() => {
    console.log('Monobank UI state:', {
      paymentMethod,
      monoPageUrl,
      isCreatingPayment,
      cartCount: cart_products?.length,
    });
  }, [paymentMethod, monoPageUrl, isCreatingPayment, cart_products?.length]);

  return (
    <>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        iframeUrl={monoPageUrl}
        orderId={lastOrderId}
        title={t('monobank_payment_title')}
        onPaymentResult={({ result }) => {
          // Close iframe on failure/pending as requested, keep on checkout.
          if (result !== 'success') {
            setMonoPageUrl(null);
          }
        }}
      />

      <section
        className="tp-checkout-area pb-120"
        style={{ backgroundColor: "#EFF1F5" }}
      >
        <div className="container">
          {cart_products.length === 0 && !showPaymentFrame ? (
            <div className="text-center py-5">
              <h4>{t('no_items_in_cart')}</h4>
              <Link href="/shop" className="tp-btn">
                {t('return_to_shop')}
              </Link>
            </div>
          ) : (
            <div className="tp-checkout-wrapper">
              <div className="tp-checkout-top-wrapper">
                <div className="row">
                  <div className="col-xl-12">
                    <CheckoutLoginDiscount user={user} accessToken={accessToken} />
                  </div>
                </div>
              </div>
              
               <form
                 onSubmit={(e) => {
                   // UX requirement: for card payments we create the order only when user initiates payment,
                   // not via the generic form submit.
                   if (paymentMethod === 'pay_now') {
                     e.preventDefault();
                     return;
                   }
                   return handleSubmit(customSubmitHandler)(e);
                 }}
               >
                <div className="row">
                  <div className="col-lg-7">
                    <SimplifiedBillingArea 
                      register={register} 
                      errors={errors} 
                      user={user}
                      setValue={setValue}
                    />
                  </div>
                  
                  <div className="col-lg-5">
                    <div className="tp-checkout-place white-bg">
                      <h3 className="tp-checkout-place-title">{t('your_order')}</h3>

                      <div className="tp-order-info-list">
                        <ul>
                          {/* Header */}
                          <li className="tp-order-info-list-header">
                            <h4>{t('product')}</h4>
                            <h4>{t('total')}</h4>
                          </li>

                          {/* Items list */}
                          {cart_products.map((item, index) => (
                            <li key={item._id || item.id || index} className="tp-order-info-list-desc">
                              <p>
                                {item.title} <span> x {item.orderQuantity}</span>
                              </p>
                              <span>₴{((Number(item.price_minor || 0) / 100) * item.orderQuantity).toFixed(2)}</span>
                            </li>
                          ))}

                          {/* Subtotal */}
                          <li className="tp-order-info-list-subtotal">
                            <span>{t('subtotal')}</span>
                            <span>₴{subtotal.toFixed(2)}</span>
                          </li>

                          {/* Current User Discount */}
                          {currentDiscountPercent > 0 && (
                            <li className="tp-order-info-list-subtotal" style={{ backgroundColor: 'rgb(248, 225, 191)', borderLeft: '4px solid rgb(223, 106, 34)' }}>
                              <span style={{ fontWeight: 600, color: 'rgb(133, 60, 0)' }}>
                                {t('your_discount')} ({currentDiscountPercent}%)
                              </span>
                              <span style={{ fontWeight: 600, color: 'rgb(133, 60, 0)' }}>- ₴{(subtotal * currentDiscountPercent / 100).toFixed(2)}</span>
                            </li>
                          )}

                          {/* Shipping */}
                          <li className="tp-order-info-list-shipping">
                            <div className="tp-order-info-list-shipping-item">
                              <div className="tp-checkout-shipping-option mb-2">
                                <div className="form-check d-flex align-items-center">
                                  <input
                                    {...register(`shippingOption`, {
                                      required: t('shipping_required'),
                                    })}
                                    className="form-check-input me-2"
                                    id="nova_post_delivery"
                                    type="radio"
                                    name="shippingOption"
                                    value="nova_post"
                                    defaultChecked
                                    onChange={() => handleShippingCost(0)}
                                  />
                                  <label
                                    className="form-check-label d-flex justify-content-between w-100"
                                    htmlFor="nova_post_delivery"
                                  >
                                    <span>{t('nova_post_delivery')}</span>
                                  </label>
                                </div>
                              </div>
                              <div className="tp-checkout-shipping-option">
                                <div className="form-check d-flex align-items-center">
                                  <input
                                    {...register(`shippingOption`, {
                                      required: t('shipping_required'),
                                    })}
                                    className="form-check-input me-2"
                                    id="pickup"
                                    type="radio"
                                    name="shippingOption"
                                    value="pickup"
                                    onChange={() => handleShippingCost(0)}
                                  />
                                  <label
                                    className="form-check-label d-flex justify-content-between w-100"
                                    htmlFor="pickup"
                                  >
                                    <span>{t('pickup')}</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </li>



                          {/* Discount */}
                          {discountAmount > 0 && (
                            <li className="tp-order-info-list-subtotal">
                              <span>{t('discount')}</span>
                              <span>- ₴{discountAmount.toFixed(2)}</span>
                            </li>
                          )}

                          {/* Total */}
                          <li className="tp-order-info-list-total">
                            <span>{t('total')}</span>
                            <span>₴{(subtotal - (subtotal * currentDiscountPercent / 100) + shippingCost - discountAmount).toFixed(2)}</span>
                          </li>
                        </ul>
                      </div>

                       {/* Payment Method Selection */}
                       <div className="tp-checkout-payment">
                         <h4 className="tp-checkout-payment-title">{t('payment_method')}</h4>
                        
                         <div className="tp-checkout-payment-item">
                          <input
                            type="radio"
                            id="cash_on_delivery"
                            name="payment"
                            value="cash_on_delivery"
                            checked={paymentMethod === "cash_on_delivery"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <label htmlFor="cash_on_delivery">
                            {t('cash_on_delivery')}
                          </label>
                          <div className="direct-bank-transfer">
                            <p>{t('cash_on_delivery_description')}</p>
                          </div>
                        </div>

                        <div className="tp-checkout-payment-item">
                          <input
                            type="radio"
                            id="pay_now"
                            name="payment"
                            value="pay_now"
                             checked={paymentMethod === "pay_now"}
                              onChange={(e) => {
                                setPaymentMethod(e.target.value);
                              // Backend requires `order_id` to create a Monobank payment.
                              // Payment will be created right after the order is placed.
                              }}
                            />
                          <label htmlFor="pay_now">
                            {t('pay_now')}
                          </label>
                          <div className="direct-bank-transfer">
                            <p>{t('pay_now_description')}</p>
                          </div>

                           {/* Payment iframe is rendered in the pay-now buttons section below to avoid duplication */}
                         </div>
                       </div>

                       {paymentMethod === 'cash_on_delivery' && (
                         <div className="tp-checkout-btn-wrapper">
                           <button
                             type="submit"
                             className="tp-checkout-btn w-100"
                             disabled={isCheckoutSubmit}
                           >
                             {isCheckoutSubmit ? t('processing') : t('place_order')}
                           </button>
                         </div>
                       )}

                       {/* Pay-now buttons must be at the bottom and only visible for pay_now */}
                       {paymentMethod === "pay_now" && (
                          <div className="mt-4">
                            {(() => {
                              // Precompute to avoid nested t() calls inside message formatting.
                              // next-intl supports rich formatting, but we keep it simple.
                              return null;
                            })()}
                            <div style={{ display: 'grid', gap: 10 }}>
                              <GooglePayButton
                                amountMinor={Math.round(
                                  (subtotal - (subtotal * currentDiscountPercent / 100) + shippingCost - discountAmount) * 100
                                )}
                               currencyCode="UAH"
                               merchantName="AirbagAD"
                               gatewayMerchantId={process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID}
                             />
                              {/* Apple Pay button hidden: flow not implemented and should not be shown */}
                           </div>

                            <div className="mt-3" style={{ display: 'grid', gap: 10 }}>
                              {isCreatingPayment && (
                                <p className="mb-2">{t('processing')}</p>
                              )}

                              <div style={{ display: 'grid', gap: 10 }}>
                                  <button
                                    type="button"
                                    className="monopay-btn monopay-btn--dark monopay-btn--corners-rounded monopay-btn--pay monopay-btn--with-text"
                                    style={{
                                      appearance: 'none',
                                      border: 0,
                                      borderRadius: 10,
                                      padding: '14px 20px',
                                      width: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 12,
                                      background: '#0b0b0b',
                                      color: '#fff',
                                      cursor: 'pointer',
                                      boxShadow: '0 8px 18px rgba(0,0,0,0.18)',
                                      transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
                                    }}
                                    disabled={isCheckoutSubmit || isCreatingPayment}
                                    onClick={async () => {
                                      if (monoPageUrl) {
                                        setIsPaymentModalOpen(true);
                                        return;
                                      }

                                      await handleSubmit(async (formData) => {
                                        const createdOrder = await submitHandler(formData);
                                        if (!createdOrder?.id) return;

                                        setLastOrderId(createdOrder.id);
                                        await createMonoPayment(createdOrder.id);
                                      })();
                                    }}
                                  >
                                    <div className="monopay-btn--text-wrapper">
                                      <svg width="98" height="18" viewBox="0 0 103 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12.4485 7.09823C12.4485 8.57361 12.1786 9.84208 11.6388 10.9036C11.0991 11.9607 10.3591 12.7748 9.41903 13.3461C8.48343 13.9129 7.41962 14.1962 6.22763 14.1962C5.03113 14.1962 3.96283 13.9129 3.02273 13.3461C2.08712 12.7748 1.34943 11.9584 0.809658 10.8969C0.269885 9.83533 -1.34856e-06 8.56911 -1.34856e-06 7.09823C-1.34856e-06 5.62285 0.269885 4.35664 0.809658 3.29958C1.34943 2.23803 2.08712 1.42387 3.02273 0.857111C3.96283 0.285851 5.03113 0.000221431 6.22763 0.000221431C7.41962 0.000221431 8.48343 0.285851 9.41903 0.857111C10.3591 1.42387 11.0991 2.23803 11.6388 3.29958C12.1786 4.35664 12.4485 5.62285 12.4485 7.09823ZM10.3839 7.09823C10.3839 5.97371 10.2017 5.02686 9.83736 4.25768C9.47751 3.484 8.98272 2.89925 8.35298 2.50342C7.72774 2.10309 7.01929 1.90292 6.22763 1.90292C5.43146 1.90292 4.72076 2.10309 4.09552 2.50342C3.47029 2.89925 2.9755 3.484 2.61115 4.25768C2.2513 5.02686 2.07138 5.97371 2.07138 7.09823C2.07138 8.22276 2.2513 9.17186 2.61115 9.94553C2.9755 10.7147 3.47029 11.2995 4.09552 11.6998C4.72076 12.0956 5.43146 12.2935 6.22763 12.2935C7.01929 12.2935 7.72774 12.0956 8.35298 11.6998C8.98272 11.2995 9.47751 10.7147 9.83736 9.94553C10.2017 9.17186 10.3839 8.22276 10.3839 7.09823ZM14.8859 14.0073V3.64369H23.3401V14.0073H21.3632V5.38445H16.8493V14.0073H14.8859ZM25.2209 14.0073L25.2141 12.2598H25.5852C25.8731 12.2598 26.1138 12.1991 26.3072 12.0776C26.5051 11.9517 26.667 11.7403 26.793 11.4434C26.9189 11.1465 27.0156 10.7372 27.0831 10.2154C27.1506 9.68914 27.2 9.02792 27.2315 8.23176L27.4137 3.64369H34.6467V14.0073H32.6697V5.38445H29.2827L29.1207 8.90647C29.0803 9.76111 28.9925 10.5078 28.8576 11.1465C28.7272 11.7853 28.536 12.3183 28.2841 12.7456C28.0322 13.1684 27.7083 13.4855 27.3125 13.697C26.9167 13.9039 26.4354 14.0073 25.8686 14.0073H25.2209ZM40.3531 14.2367C39.6963 14.2367 39.1026 14.1153 38.5718 13.8724C38.041 13.625 37.6205 13.2674 37.3101 12.7996C37.0042 12.3318 36.8513 11.7583 36.8513 11.0791C36.8513 10.4943 36.9637 10.013 37.1887 9.63517C37.4136 9.25732 37.7172 8.9582 38.0995 8.73779C38.4819 8.51739 38.9092 8.35096 39.3815 8.2385C39.8538 8.12605 40.3351 8.04059 40.8254 7.98211C41.4461 7.91014 41.9499 7.85167 42.3367 7.80668C42.7236 7.75721 43.0047 7.67849 43.1801 7.57053C43.3556 7.46258 43.4433 7.28715 43.4433 7.04426V6.99703C43.4433 6.40777 43.2768 5.95122 42.944 5.62735C42.6156 5.30349 42.1253 5.14156 41.4731 5.14156C40.7939 5.14156 40.2586 5.29224 39.8673 5.59362C39.4804 5.89049 39.2128 6.2211 39.0644 6.58545L37.1684 6.15363C37.3933 5.5239 37.7217 5.01561 38.1535 4.62877C38.5898 4.23744 39.0914 3.95406 39.6581 3.77863C40.2249 3.59871 40.8209 3.50874 41.4461 3.50874C41.8599 3.50874 42.2985 3.55822 42.7618 3.65718C43.2296 3.75164 43.6659 3.92707 44.0708 4.18346C44.4801 4.43985 44.8152 4.80645 45.0761 5.28325C45.337 5.75555 45.4674 6.36954 45.4674 7.12522V14.0073H43.4972V12.5904H43.4163C43.2858 12.8513 43.0902 13.1077 42.8293 13.3596C42.5684 13.6115 42.2333 13.8207 41.824 13.9871C41.4146 14.1535 40.9243 14.2367 40.3531 14.2367ZM40.7916 12.6174C41.3494 12.6174 41.8262 12.5072 42.222 12.2868C42.6224 12.0664 42.926 11.7785 43.1329 11.4232C43.3443 11.0633 43.45 10.6787 43.45 10.2694V8.93346C43.378 9.00543 43.2386 9.0729 43.0317 9.13588C42.8293 9.19435 42.5976 9.24608 42.3367 9.29106C42.0758 9.33154 41.8217 9.36978 41.5743 9.40576C41.3269 9.43725 41.12 9.46424 40.9536 9.48673C40.5622 9.53621 40.2046 9.61942 39.8808 9.73637C39.5614 9.85332 39.305 10.022 39.1116 10.2424C38.9227 10.4583 38.8282 10.7462 38.8282 11.106C38.8282 11.6053 39.0126 11.9832 39.3815 12.2396C39.7503 12.4915 40.2204 12.6174 40.7916 12.6174ZM46.8691 5.38445V3.64369H55.6135V5.38445H52.2331V14.0073H50.263V5.38445H46.8691ZM59.7242 11.1803L64.292 3.64369H66.4646V14.0073H64.4877V6.464L59.9401 14.0073H57.7472V3.64369H59.7242V11.1803ZM67.8916 5.38445V3.64369H76.6359V5.38445H73.2556V14.0073H71.2854V5.38445H67.8916ZM80.7466 11.1803L85.3145 3.64369H87.487V14.0073H85.5101V6.464L80.9625 14.0073H78.7697V3.64369H80.7466V11.1803ZM94.6137 11.268H96.6784C96.7053 11.6908 96.8965 12.0169 97.2519 12.2463C97.6117 12.4757 98.0773 12.5904 98.6485 12.5904C99.2288 12.5904 99.7236 12.4667 100.133 12.2193C100.542 11.9674 100.747 11.5783 100.747 11.0521C100.747 10.7372 100.668 10.4628 100.511 10.2289C100.358 9.99052 100.14 9.80609 99.8563 9.67565C99.5774 9.5452 99.2468 9.47998 98.8644 9.47998H97.1776V7.8944H98.8644C99.4357 7.8944 99.863 7.76395 100.146 7.50306C100.43 7.24217 100.571 6.91606 100.571 6.52472C100.571 6.1019 100.419 5.7623 100.113 5.5059C99.8113 5.24501 99.3907 5.11457 98.8509 5.11457C98.3022 5.11457 97.8456 5.23827 97.4813 5.48566C97.1169 5.72856 96.9258 6.04343 96.9078 6.43026H94.8701C94.8836 5.85001 95.059 5.34172 95.3964 4.90541C95.7383 4.46459 96.1971 4.12274 96.7728 3.87984C97.3531 3.63244 98.012 3.50874 98.7497 3.50874C99.5189 3.50874 100.185 3.63244 100.747 3.87984C101.309 4.12723 101.743 4.46909 102.049 4.90541C102.359 5.34172 102.515 5.84326 102.515 6.41002C102.515 6.98128 102.344 7.44909 102.002 7.81343C101.665 8.17328 101.224 8.43192 100.679 8.58936V8.69731C101.08 8.7243 101.435 8.84575 101.745 9.06166C102.056 9.27757 102.299 9.5632 102.474 9.91855C102.65 10.2739 102.737 10.6765 102.737 11.1263C102.737 11.7605 102.562 12.3093 102.211 12.7726C101.865 13.2359 101.383 13.5935 100.767 13.8454C100.155 14.0928 99.4559 14.2165 98.6688 14.2165C97.9041 14.2165 97.2181 14.0973 96.6109 13.8589C96.0081 13.616 95.5291 13.2741 95.1737 12.8333C94.8229 12.3925 94.6362 11.8707 94.6137 11.268Z" fill="currentColor"></path>
                                      </svg>
                                    </div>
                                    <div className="monopay-btn--logo-wrapper">
                                      <svg width="103" height="26" viewBox="0 0 103 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M96.9996 0C100.313 0 103 2.68629 103 6V20C103 23.3137 100.313 26 96.9996 26H60.9996C57.6859 26 54.9996 23.3137 54.9996 20V6C54.9996 2.68629 57.6859 0 60.9996 0H96.9996ZM89.1471 20.1406L88.7867 20.96C88.5467 21.48 88.1069 21.6602 87.4469 21.6602C87.2069 21.6601 86.867 21.6 86.6471 21.5L86.2672 23.7803C86.5871 23.8603 87.2269 23.9199 87.527 23.9199C89.187 23.8799 90.4671 23.4001 91.1871 21.5801L95.7272 10.3408H92.9869L90.4674 17.0605L87.9469 10.3408H85.2272L89.1471 20.1406ZM79.8688 10.1006C78.3488 10.1006 76.8281 10.5801 75.6481 11.6201L76.609 13.3203C77.4289 12.5605 78.3885 12.1797 79.4283 12.1797C80.7082 12.1797 81.5483 12.82 81.5485 13.7998V15.1006C80.9085 14.3407 79.7687 13.92 78.4889 13.9199C76.9489 13.9199 75.1286 14.7801 75.1285 17.04C75.1285 19.2 76.9489 20.2402 78.4889 20.2402C79.7488 20.2401 80.8885 19.7799 81.5485 19V20H84.0885V13.7598C84.0883 10.9801 82.0686 10.1006 79.8688 10.1006ZM63.7184 6.66016V20H66.5582V15.2598H69.9586C72.8385 15.2597 74.4381 13.2799 74.4381 10.96C74.438 8.62011 72.8584 6.66026 69.9586 6.66016H63.7184ZM79.5084 15.6396C80.3284 15.6396 81.1285 15.9205 81.5485 16.4805V17.6797C81.1285 18.2397 80.3284 18.5205 79.5084 18.5205C78.5087 18.5205 77.6884 18.0003 77.6881 17.1006C77.6881 16.1606 78.5085 15.6397 79.5084 15.6396ZM69.5787 9.16016C70.6985 9.1603 71.5386 9.84019 71.5387 10.96C71.5387 12.0598 70.6986 12.7596 69.5787 12.7598H66.5582V9.16016H69.5787Z" fill="white"></path>
                                        <path d="M14.3359 19.761H11.8118V13.7467C11.8118 12.7344 11.3386 12.2283 10.392 12.2283C9.98451 12.2283 9.60327 12.34 9.24832 12.5635C8.90652 12.787 8.63045 13.0433 8.42012 13.3326V19.761H5.89605V13.7467C5.89605 12.7344 5.42279 12.2283 4.47627 12.2283C4.08188 12.2283 3.70722 12.34 3.35227 12.5635C2.99732 12.787 2.71468 13.0499 2.50434 13.3523V19.761H0V10.2366H2.50434V11.4789C2.74097 11.1371 3.15508 10.8085 3.74666 10.493C4.33823 10.1643 4.96268 10 5.61998 10C7.00033 10 7.88112 10.5784 8.26236 11.7353C8.56472 11.262 9.01169 10.8545 9.60327 10.5127C10.208 10.1709 10.8522 10 11.5358 10C12.4297 10 13.1199 10.2432 13.6063 10.7296C14.0927 11.2029 14.3359 11.9193 14.3359 12.879V19.761Z" fill="white"></path>
                                        <path d="M24.8771 18.5582C23.9568 19.5178 22.7342 19.9977 21.2093 19.9977C19.6843 19.9977 18.4617 19.5178 17.5415 18.5582C16.6344 17.5853 16.1809 16.3956 16.1809 14.989C16.1809 13.5823 16.6344 12.3992 17.5415 11.4395C18.4617 10.4798 19.6843 10 21.2093 10C22.7342 10 23.9568 10.4798 24.8771 11.4395C25.7973 12.3992 26.2574 13.5823 26.2574 14.989C26.2574 16.3956 25.7973 17.5853 24.8771 18.5582ZM19.4345 16.9806C19.8684 17.5065 20.4599 17.7694 21.2093 17.7694C21.9586 17.7694 22.5502 17.5065 22.984 16.9806C23.431 16.4416 23.6545 15.7777 23.6545 14.989C23.6545 14.2133 23.431 13.5626 22.984 13.0368C22.5502 12.4978 21.9586 12.2283 21.2093 12.2283C20.4599 12.2283 19.8684 12.4978 19.4345 13.0368C19.0007 13.5626 18.7838 14.2133 18.7838 14.989C18.7838 15.7777 19.0007 16.4416 19.4345 16.9806Z" fill="white"></path>
                                        <path d="M37.0481 19.761H34.5438V14.003C34.5438 12.8198 33.9588 12.2283 32.7888 12.2283C31.8817 12.2283 31.1587 12.6029 30.6197 13.3523V19.761H28.1153V10.2366H30.6197V11.4789C31.4479 10.493 32.5587 10 33.9522 10C34.9776 10 35.7467 10.2695 36.2594 10.8085C36.7852 11.3475 37.0481 12.0902 37.0481 13.0368V19.761Z" fill="white"></path>
                                        <path d="M47.6197 18.5582C46.6994 19.5178 45.4768 19.9977 43.9519 19.9977C42.4269 19.9977 41.2043 19.5178 40.2841 18.5582C39.377 17.5853 38.9235 16.3956 38.9235 14.989C38.9235 13.5823 39.377 12.3992 40.2841 11.4395C41.2043 10.4798 42.4269 10 43.9519 10C45.4768 10 46.6994 10.4798 47.6197 11.4395C48.5399 12.3992 49 13.5823 49 14.989C49 16.3956 48.5399 17.5853 47.6197 18.5582ZM42.1771 16.9806C42.611 17.5065 43.2025 17.7694 43.9519 17.7694C44.7012 17.7694 45.2928 17.5065 45.7266 16.9806C46.1736 16.4416 46.3971 15.7777 46.3971 14.989C46.3971 14.2133 46.1736 13.5626 45.7266 13.0368C45.2928 12.4978 44.7012 12.2283 43.9519 12.2283C43.2025 12.2283 42.611 12.4978 42.1771 13.0368C41.7433 13.5626 41.5264 14.2133 41.5264 14.989C41.5264 15.7777 41.7433 16.4416 42.1771 16.9806Z" fill="white"></path>
                                      </svg>
                                    </div>
                                  </button>
                              </div>

                              {monoPaymentError && (
                                <p className="mb-0" style={{ color: '#b00020' }}>
                                  {monoPaymentError}
                                </p>
                              )}

                              {/* We no longer show the "place order" hint for pay_now, because we create order on payment click. */}

                              {monoPageUrl && (
                                <button
                                  type="button"
                                  className="tp-btn w-100"
                                  onClick={() => setIsPaymentModalOpen(true)}
                                >
                                  {t('open_payment')}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                     </div>
                   </div>
                 </div>
               </form>
            </div>
          )}
        </div>
      </section>

    
    </>
  );
};

export default OrderCheckoutArea;
