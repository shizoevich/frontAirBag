'use client';
import React from 'react';
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import Cookies from "js-cookie";
import Link from "next/link";
// internal
import SimplifiedBillingArea from "./simplified-billing-area";
import CheckoutLoginDiscount from "./checkout-login-discount";
import UserInfoModal from "./user-info-modal";
import GuestRegistrationModal from './guest-registration-modal';
import useOrderCheckout from "@/hooks/use-order-checkout";
import useCartInfo from "@/hooks/use-cart-info";

const OrderCheckoutArea = () => {
  const t = useTranslations('Checkout');
  const router = useRouter();
  
  // Убираем принудительную аутентификацию - разрешаем неавторизованным пользователям оформлять заказы
  
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
  
  const { cart_products } = useSelector((state) => state.cart);
  const { quantity } = useCartInfo();

  const formatPrice = (priceMinor) => {
    return (priceMinor / 100).toFixed(2);
  };

  return (
    <>
      <section
        className="tp-checkout-area pb-120"
        style={{ backgroundColor: "#EFF1F5" }}
      >
        <div className="container">
          {cart_products.length === 0 ? (
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
              
              <form onSubmit={handleSubmit(submitHandler)}>
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
                              <span>-₴{discountAmount.toFixed(2)}</span>
                            </li>
                          )}

                          {/* Total */}
                          <li className="tp-order-info-list-total">
                            <span>{t('total')}</span>
                            <span>₴{(subtotal + shippingCost - discountAmount).toFixed(2)}</span>
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
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <label htmlFor="pay_now">
                            {t('pay_now')}
                          </label>
                          <div className="direct-bank-transfer">
                            <p>{t('pay_now_description')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="tp-checkout-btn-wrapper">
                        <button 
                          type="submit" 
                          className="tp-checkout-btn w-100"
                          disabled={isCheckoutSubmit}
                        >
                          {isCheckoutSubmit ? t('processing') : t('place_order')}
                        </button>
                      </div>
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
