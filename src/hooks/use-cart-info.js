'use client';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useCartInfo = () => {
    const [quantity, setQuantity] = useState(0);
    const [ total, setTotal] = useState(0);
    const { cart_products } = useSelector((state) => state.cart);

    useEffect(() => {
        const cart = cart_products.reduce((cartTotal, cartItem) => {
            const { price_minor, orderQuantity } = cartItem;
            // Конвертируем price_minor (копейки) в основную валюту (гривны) путем деления на 100
            const priceInMainCurrency = price_minor / 100;
            const itemTotal = priceInMainCurrency * orderQuantity;
            cartTotal.total += itemTotal
            cartTotal.quantity += orderQuantity

            return cartTotal;
        }, {
            total: 0,
            quantity: 0,
        })
        setQuantity(cart.quantity);
        setTotal(cart.total);
    }, [cart_products])
    return {
        quantity,
        total,
        setTotal,
    }
}

export default useCartInfo;