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
import ApplePayButton from './apple-pay-button';
import useOrderCheckout from "@/hooks/use-order-checkout";
import useCartInfo from "@/hooks/use-cart-info";
import { useGetOrdersQuery } from "@/redux/features/ordersApi";
import { useGetDiscountsQuery } from "@/redux/features/discountsApi";
import { useCreatePaymentMutation } from "@/redux/features/paymentsApi";
import { notifyError, notifyInfo } from '@/utils/toast';

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

  // Create payment via Next.js API route (proxy to backend).
  // NOTE: backend requires `order_id`, so we can only create payment AFTER order is created.
  const createMonoPaymentFromApiRoute = React.useCallback(async (orderId) => {
    try {
      setIsCreatingPayment(true);
      setMonoPaymentError(null);

      const resolvedOrderId = orderId ?? lastOrderId;
      if (!resolvedOrderId) {
        throw new Error('Order is not created yet. Please place the order first.');
      }

      // redirect_url MUST accept POST from the payment provider. We use an internal API route
      // to receive POST and convert it into a user-facing GET page with toast + redirects.
      const redirect_url = `${window.location.origin}/api/monobank/redirect?locale=${encodeURIComponent(
        locale
      )}&order_id=${encodeURIComponent(resolvedOrderId)}`;
      const token = getCurrentAccessToken();

      const res = await fetch('/api/create-monobank-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          order_id: resolvedOrderId,
          redirect_url,
        }),
      });

      console.log('[Monobank][api-route] response status:', res.status);

      const data = await res.json();
      console.log('[Monobank][api-route] response json:', data);
      if (!res.ok) {
        const msg = data?.error || data?.message || 'Monobank payment create failed';
        throw new Error(msg);
      }

      if (data?.pageUrl) {
        setMonoPageUrl(data.pageUrl);
        setIsPaymentModalOpen(true);
        notifyInfo(t('monobank_payment_opened'));
        return;
      }

      throw new Error('Payment created but pageUrl is missing');
    } catch (err) {
      console.error('Monobank payment error (api route):', err);
      setMonoPaymentError(err?.message || String(err));
    } finally {
      setIsCreatingPayment(false);
    }
  }, [getCurrentAccessToken, lastOrderId, locale, t]);
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

      // New swagger contract: order_id + redirect_url are required
      const redirect_url = `${window.location.origin}/api/monobank/redirect?locale=${encodeURIComponent(
        locale
      )}&order_id=${encodeURIComponent(orderId)}`;
      console.log('Creating Monobank payment (RTK):', { orderId, redirect_url });

      const data = await createPayment({
        order_id: orderId,
        redirect_url,
      }).unwrap();

      console.log('Monobank payment raw response:', { data });

      // backend may return different field names depending on implementation
      const pageUrl =
        data?.page_url ||
        data?.pageUrl ||
        data?.mono_url ||
        data?.monoUrl ||
        data?.redirect_url ||
        data?.redirectUrl ||
        data?.redirect_url ||
        data?.redirectUrl ||
        data?.invoice_url ||
        data?.invoiceUrl ||
        data?.url ||
        data?.data?.page_url ||
        data?.data?.pageUrl ||
        data?.data?.mono_url ||
        data?.data?.monoUrl ||
        data?.data?.redirect_url ||
        data?.data?.redirectUrl ||
        data?.data?.invoice_url ||
        data?.data?.invoiceUrl ||
        data?.data?.url;

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
        title={t('monobank_payment_title')}
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
                             <ApplePayButton />
                           </div>

                           <div className="mt-3" style={{ display: 'grid', gap: 10 }}>
                             {isCreatingPayment && (
                               <p className="mb-2">{t('processing')}</p>
                             )}

                              <button
                                type="button"
                                className="tp-btn tp-btn-2 w-100"
                                disabled={isCheckoutSubmit || isCreatingPayment}
                                onClick={async () => {
                                  // If we already have payment URL -> show it.
                                  if (monoPageUrl) {
                                    setIsPaymentModalOpen(true);
                                    return;
                                  }

                                  // Create order first, then create Monobank payment for that order.
                                  await handleSubmit(async (formData) => {
                                    const createdOrder = await submitHandler(formData);
                                    if (!createdOrder?.id) return;

                                    setLastOrderId(createdOrder.id);
                                    await createMonoPaymentFromApiRoute(createdOrder.id);
                                  })();
                                }}
                              >
                                {(() => {
                                  // Avoid runtime crash if locale messages are stale in dev (hot reload) and key is missing.
                                  if (isCreatingPayment) return t('processing');
                                  // next-intl provides `.has()` on the translation function.
                                  // If not present, fall back to a safe string.
                                  // eslint-disable-next-line no-prototype-builtins
                                  const hasKey = typeof t?.has === 'function' ? t.has('pay_with_monobank') : true;
                                  return hasKey ? t('pay_with_monobank') : 'Pay with Monobank';
                                })()}
                              </button>

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
