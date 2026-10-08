'use client';
import React, { useState } from 'react';
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
import PaymentModal from './payment-modal';
import GooglePayButton from './google-pay-button';
import BankTransferDetails from './bank-transfer-details';
import useOrderCheckout from "@/hooks/use-order-checkout";
import useCartInfo from "@/hooks/use-cart-info";
import { useGetOrdersQuery } from "@/redux/features/ordersApi";
import { useGetDiscountsQuery } from "@/redux/features/discountsApi";
import { useCreatePaymentMutation, useGetPaymentConfigQuery } from "@/redux/features/paymentsApi";
import useTelegramWebApp from "@/hooks/use-telegram-webapp";
import { openExternalLink } from "@/utils/telegram";
import { notifyError, notifyInfo } from '@/utils/toast';
import { resolveMonobankPageUrl } from '@/utils/monobank-url';

const OrderCheckoutArea = () => {
  const t = useTranslations('Checkout');
  const tv = useTranslations('CheckoutValidation');
  const router = useRouter();
  const { locale } = useParams();
  
  const [monoPageUrl, setMonoPageUrl] = React.useState(null);
  const [lastOrderId, setLastOrderId] = React.useState(null);
  const [isCreatingPayment, setIsCreatingPayment] = React.useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [monoPaymentError, setMonoPaymentError] = React.useState(null);

  const [createPayment] = useCreatePaymentMutation();
  // Мини-апп Telegram: кошельки в WebView не работают, поэтому страница Monobank
  // открывается снаружи, а возврат — ссылкой в бота (ADR-0022).
  const { hasInitData: isTelegramWebApp } = useTelegramWebApp();
  const { data: paymentConfig } = useGetPaymentConfigQuery();
  const telegramBotUsername = paymentConfig?.telegram_bot_username || null;
  const backToBotUrl = (orderId) =>
    telegramBotUsername ? `https://t.me/${telegramBotUsername}?start=order_${orderId}` : null;

  const {
    handleSubmit,
    submitHandler,
    register,
    control,
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
    paymentMethod,
    setPaymentMethod,
    bankTransferFile,
    setBankTransferFile,
    user,
    accessToken,
    subtotal,
    shippingCost,
    discountAmount,
    total,
    isCheckoutSubmit
  } = useOrderCheckout();

  const [isPickup, setIsPickup] = useState(false);

  // Форма не прошла проверку — говорим об этом явно: ошибка может висеть на
  // поле, которого не видно, и тогда кнопка «молча не реагирует».
  const onInvalid = () => notifyError(tv('fill_required_fields'));

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
  const { quantity } = useCartInfo();

  const showPaymentFrame = paymentMethod === "pay_now" && (isCreatingPayment || !!monoPageUrl);

  // When pay_now is the default selected option, onChange won't fire.
  // This ensures we still create a payment URL once when pay_now is active.
  const didAutoCreatePaymentRef = React.useRef(false);

  const { data: ordersData } = useGetOrdersQuery(undefined, {
    skip: !accessToken,
  });
  const { data: discountsData } = useGetDiscountsQuery();

  const formatPrice = (priceMinor) => {
    return (priceMinor / 100).toFixed(2);
  };

  // Рассчитываем текущую скидку пользователя
  const calculateCurrentDiscount = () => {
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

  // Google Pay: заказ создаётся уже после того, как пользователь подтвердил
  // оплату в шите, поэтому нужен отдельный резолвер, а не общий submit-флоу.
  const resolveGooglePayOrderId = async () => {
    if (lastOrderId) return lastOrderId;

    let createdId = null;
    await handleSubmit(async (formData) => {
      const createdOrder = await submitHandler(formData);
      if (createdOrder?.id) {
        createdId = createdOrder.id;
        setLastOrderId(createdOrder.id);
      }
    }, onInvalid)();

    return createdId;
  };

  const handleGooglePayResult = (res, orderId) => {
    // 3DS: Monobank отдаёт tdsUrl — открываем его в той же модалке, что и mono-флоу.
    // resolveMonobankPageUrl здесь не подходит: он достраивает ссылку из invoiceId,
    // который приходит всегда, и увёл бы в 3DS даже успешный платёж без челленджа.
    const tdsUrl = res?.monobank?.tdsUrl;
    if (tdsUrl) {
      setMonoPageUrl(tdsUrl);
      setIsPaymentModalOpen(true);
      return;
    }

    const status = res?.payment?.status;
    const result = status === 'success' ? 'success' : status === 'failure' ? 'failed' : 'pending';
    router.push(`/${locale}/payment-redirect?result=${result}&orderId=${orderId}`);
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
      // Из мини-аппа страница оплаты живёт в Safari/Chrome — после оплаты
      // Monobank ведёт обратно в бота, а мини-апп тем временем опрашивает заказ.
      const botUrl = isTelegramWebApp ? backToBotUrl(orderId) : null;
      const urls = botUrl
        ? { redirect_url: botUrl, success_url: botUrl, fail_url: botUrl }
        : { redirect_url, success_url, fail_url };
      console.log('Creating Monobank payment (RTK):', { orderId, ...urls, isTelegramWebApp });

      const data = await createPayment({
        order_id: orderId,
        ...urls,
      }).unwrap();

      console.log('Monobank payment raw response:', { data });

      // backend may return different field names depending on implementation
      const pageUrl = resolveMonobankPageUrl(data);

      console.log('Monobank payment resolved pageUrl:', pageUrl);

      if (pageUrl) {
        setMonoPageUrl(pageUrl);
        if (isTelegramWebApp) openExternalLink(pageUrl);
        // В мини-аппе модалка — экран ожидания с опросом заказа, а не iframe
        setIsPaymentModalOpen(true);
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
        external={isTelegramWebApp}
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
              <Link href={`/${locale}`} className="tp-btn">
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
                   return handleSubmit(customSubmitHandler, onInvalid)(e);
                 }}
               >
                <div className="row">
                  <div className="col-lg-7">
                    <SimplifiedBillingArea
                      control={control}
                      register={register}
                      errors={errors}
                      user={user}
                      setValue={setValue}
                      isPickup={isPickup}
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
                                {item.title} <span style={{ color: '#de8043', fontWeight: 600, whiteSpace: 'nowrap' }}>×{item.orderQuantity} шт</span>
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
                                    onChange={() => { handleShippingCost(0); setIsPickup(false); }}
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
                                    onChange={() => { handleShippingCost(0); setIsPickup(true); }}
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
                            {isPickup ? t('pickup_payment') : t('cash_on_delivery')}
                          </label>
                          <div className="direct-bank-transfer">
                            <p>{isPickup ? t('pickup_payment_description') : t('cash_on_delivery_description')}</p>
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

                        {/* Bank transfer (pay by bank details) */}
                        <div className="tp-checkout-payment-item">
                          <input
                            type="radio"
                            id="bank_transfer"
                            name="payment"
                            value="bank_transfer"
                            checked={paymentMethod === "bank_transfer"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <label htmlFor="bank_transfer">
                            {t('bank_transfer', { defaultValue: 'Оплата за реквізитами' })}
                          </label>
                          <div className="direct-bank-transfer">
                            <p>{t('bank_transfer_description', { defaultValue: 'Сплатіть за наданими реквізитами та прикріпіть документ про оплату' })}</p>
                          </div>
                          {paymentMethod === 'bank_transfer' && (
                            <BankTransferDetails
                              onFileSelect={setBankTransferFile}
                              selectedFile={bankTransferFile}
                            />
                          )}
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

                       {paymentMethod === 'bank_transfer' && (
                         <div className="tp-checkout-btn-wrapper">
                           <button
                             type="submit"
                             className="tp-checkout-btn w-100"
                             disabled={isCheckoutSubmit || !bankTransferFile}
                           >
                             {isCheckoutSubmit ? t('processing') : t('place_order')}
                           </button>
                           {!bankTransferFile && (
                             <small className="text-danger d-block mt-2 text-center">
                               {t('upload_payment_doc_required', { defaultValue: 'Прикріпіть документ про оплату щоб продовжити' })}
                             </small>
                           )}
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
                            {/* Google Pay внутри WebView Telegram не работает (OR_BIBED_15) — кошельки на странице Monobank */}
                            {!isTelegramWebApp && (
                            <div style={{ display: 'grid', gap: 10 }}>
                              <GooglePayButton
                                amountMinor={Math.round(
                                  (subtotal - (subtotal * currentDiscountPercent / 100) + shippingCost - discountAmount) * 100
                                )}
                               currencyCode="UAH"
                               merchantName="AirbagAD"
                               gatewayMerchantId={process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID}
                               resolveOrderId={resolveGooglePayOrderId}
                               onResult={handleGooglePayResult}
                             />
                              {/* Apple Pay button hidden: flow not implemented and should not be shown */}
                           </div>
                            )}

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
                                        if (isTelegramWebApp) openExternalLink(monoPageUrl);
                                        setIsPaymentModalOpen(true);
                                        return;
                                      }

                                      await handleSubmit(async (formData) => {
                                        const createdOrder = await submitHandler(formData);
                                        if (!createdOrder?.id) return;

                                        setLastOrderId(createdOrder.id);
                                        await createMonoPayment(createdOrder.id);
                                      }, onInvalid)();
                                    }}
                                  >
                                    <div className="monopay-btn--icons">
                                      <span className="monopay-btn--icon" aria-label="Apple Pay">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                        </svg>
                                      </span>
                                      <span className="monopay-btn--icon" aria-label="Google Pay">
                                        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
                                          <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
                                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
                                        </svg>
                                      </span>
                                      <span className="monopay-btn--icon" aria-label={t('payment_card_badge')}>
                                        <svg width="18" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                          <rect x="2" y="5" width="20" height="14" rx="2.5" />
                                          <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2.4" />
                                          <line x1="5.5" y1="15" x2="10.5" y2="15" />
                                        </svg>
                                      </span>
                                    </div>
                                    <div className="monopay-btn--divider" aria-hidden="true" />
                                    <div className="monopay-btn--brand">
                                      <span className="monopay-btn--brand-text">{t('pay_with_mono')}</span>
                                      <div className="monopay-btn--logo-wrapper">
                                        <svg width="103" height="26" viewBox="0 0 103 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M96.9996 0C100.313 0 103 2.68629 103 6V20C103 23.3137 100.313 26 96.9996 26H60.9996C57.6859 26 54.9996 23.3137 54.9996 20V6C54.9996 2.68629 57.6859 0 60.9996 0H96.9996ZM89.1471 20.1406L88.7867 20.96C88.5467 21.48 88.1069 21.6602 87.4469 21.6602C87.2069 21.6601 86.867 21.6 86.6471 21.5L86.2672 23.7803C86.5871 23.8603 87.2269 23.9199 87.527 23.9199C89.187 23.8799 90.4671 23.4001 91.1871 21.5801L95.7272 10.3408H92.9869L90.4674 17.0605L87.9469 10.3408H85.2272L89.1471 20.1406ZM79.8688 10.1006C78.3488 10.1006 76.8281 10.5801 75.6481 11.6201L76.609 13.3203C77.4289 12.5605 78.3885 12.1797 79.4283 12.1797C80.7082 12.1797 81.5483 12.82 81.5485 13.7998V15.1006C80.9085 14.3407 79.7687 13.92 78.4889 13.9199C76.9489 13.9199 75.1286 14.7801 75.1285 17.04C75.1285 19.2 76.9489 20.2402 78.4889 20.2402C79.7488 20.2401 80.8885 19.7799 81.5485 19V20H84.0885V13.7598C84.0883 10.9801 82.0686 10.1006 79.8688 10.1006ZM63.7184 6.66016V20H66.5582V15.2598H69.9586C72.8385 15.2597 74.4381 13.2799 74.4381 10.96C74.438 8.62011 72.8584 6.66026 69.9586 6.66016H63.7184ZM79.5084 15.6396C80.3284 15.6396 81.1285 15.9205 81.5485 16.4805V17.6797C81.1285 18.2397 80.3284 18.5205 79.5084 18.5205C78.5087 18.5205 77.6884 18.0003 77.6881 17.1006C77.6881 16.1606 78.5085 15.6397 79.5084 15.6396ZM69.5787 9.16016C70.6985 9.1603 71.5386 9.84019 71.5387 10.96C71.5387 12.0598 70.6986 12.7596 69.5787 12.7598H66.5582V9.16016H69.5787Z" fill="white"></path>
                                        <path d="M14.3359 19.761H11.8118V13.7467C11.8118 12.7344 11.3386 12.2283 10.392 12.2283C9.98451 12.2283 9.60327 12.34 9.24832 12.5635C8.90652 12.787 8.63045 13.0433 8.42012 13.3326V19.761H5.89605V13.7467C5.89605 12.7344 5.42279 12.2283 4.47627 12.2283C4.08188 12.2283 3.70722 12.34 3.35227 12.5635C2.99732 12.787 2.71468 13.0499 2.50434 13.3523V19.761H0V10.2366H2.50434V11.4789C2.74097 11.1371 3.15508 10.8085 3.74666 10.493C4.33823 10.1643 4.96268 10 5.61998 10C7.00033 10 7.88112 10.5784 8.26236 11.7353C8.56472 11.262 9.01169 10.8545 9.60327 10.5127C10.208 10.1709 10.8522 10 11.5358 10C12.4297 10 13.1199 10.2432 13.6063 10.7296C14.0927 11.2029 14.3359 11.9193 14.3359 12.879V19.761Z" fill="white"></path>
                                        <path d="M24.8771 18.5582C23.9568 19.5178 22.7342 19.9977 21.2093 19.9977C19.6843 19.9977 18.4617 19.5178 17.5415 18.5582C16.6344 17.5853 16.1809 16.3956 16.1809 14.989C16.1809 13.5823 16.6344 12.3992 17.5415 11.4395C18.4617 10.4798 19.6843 10 21.2093 10C22.7342 10 23.9568 10.4798 24.8771 11.4395C25.7973 12.3992 26.2574 13.5823 26.2574 14.989C26.2574 16.3956 25.7973 17.5853 24.8771 18.5582ZM19.4345 16.9806C19.8684 17.5065 20.4599 17.7694 21.2093 17.7694C21.9586 17.7694 22.5502 17.5065 22.984 16.9806C23.431 16.4416 23.6545 15.7777 23.6545 14.989C23.6545 14.2133 23.431 13.5626 22.984 13.0368C22.5502 12.4978 21.9586 12.2283 21.2093 12.2283C20.4599 12.2283 19.8684 12.4978 19.4345 13.0368C19.0007 13.5626 18.7838 14.2133 18.7838 14.989C18.7838 15.7777 19.0007 16.4416 19.4345 16.9806Z" fill="white"></path>
                                        <path d="M37.0481 19.761H34.5438V14.003C34.5438 12.8198 33.9588 12.2283 32.7888 12.2283C31.8817 12.2283 31.1587 12.6029 30.6197 13.3523V19.761H28.1153V10.2366H30.6197V11.4789C31.4479 10.493 32.5587 10 33.9522 10C34.9776 10 35.7467 10.2695 36.2594 10.8085C36.7852 11.3475 37.0481 12.0902 37.0481 13.0368V19.761Z" fill="white"></path>
                                        <path d="M47.6197 18.5582C46.6994 19.5178 45.4768 19.9977 43.9519 19.9977C42.4269 19.9977 41.2043 19.5178 40.2841 18.5582C39.377 17.5853 38.9235 16.3956 38.9235 14.989C38.9235 13.5823 39.377 12.3992 40.2841 11.4395C41.2043 10.4798 42.4269 10 43.9519 10C45.4768 10 46.6994 10.4798 47.6197 11.4395C48.5399 12.3992 49 13.5823 49 14.989C49 16.3956 48.5399 17.5853 47.6197 18.5582ZM42.1771 16.9806C42.611 17.5065 43.2025 17.7694 43.9519 17.7694C44.7012 17.7694 45.2928 17.5065 45.7266 16.9806C46.1736 16.4416 46.3971 15.7777 46.3971 14.989C46.3971 14.2133 46.1736 13.5626 45.7266 13.0368C45.2928 12.4978 44.7012 12.2283 43.9519 12.2283C43.2025 12.2283 42.611 12.4978 42.1771 13.0368C41.7433 13.5626 41.5264 14.2133 41.5264 14.989C41.5264 15.7777 41.7433 16.4416 42.1771 16.9806Z" fill="white"></path>
                                      </svg>
                                      </div>
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
                                  onClick={() => {
                                    if (isTelegramWebApp) openExternalLink(monoPageUrl);
                                    setIsPaymentModalOpen(true);
                                  }}
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
