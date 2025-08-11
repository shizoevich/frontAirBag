"use client";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import CartItem from "@/components/cart-components/cart-item";
import RenderCartProgress from "@/components/common/render-cart-progress";

const Cart = () => {
  const { cart_products } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  return (
    <section className="tp-cart-area pb-120">
      <div className="container">
        {cart_products.length === 0 ? (
          <div className="text-center pt-50">
            <h3>No Cart Items Found</h3>
            <Link href="/shop" className="tp-cart-checkout-btn mt-20">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="row">
            <div className="col-xl-9 col-lg-8">
              <div className="tp-cart-list mb-25 mr-30">
                <div className="cartmini__shipping">
                  <RenderCartProgress />
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th colSpan="2" className="tp-cart-header-product">Product</th>
                      <th className="tp-cart-header-price">Price</th>
                      <th className="tp-cart-header-quantity">Quantity</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart_products.map((item, i) => (
                      <CartItem key={i} product={item} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;
