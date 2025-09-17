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
            // Безопасная конвертация: если price_minor отсутствует, считаем 0
            const minor = Number(price_minor ?? 0);
            const qty = Number(orderQuantity ?? 0);
            const priceInMainCurrency = minor / 100;
            const itemTotal = priceInMainCurrency * qty;
            cartTotal.total += itemTotal
            cartTotal.quantity += qty

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