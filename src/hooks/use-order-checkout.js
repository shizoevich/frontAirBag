'use client';
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useCreateOrderMutation } from "@/redux/features/ordersApi";
import { useGetMeQuery } from "@/redux/features/authApi";
import { clearCart } from "@/redux/features/cartSlice";
import { notifySuccess, notifyError } from "@/utils/toast";

const useOrderCheckout = () => {
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [couponInfo, setCouponInfo] = useState({});
  const [couponApplyMsg, setCouponApplyMsg] = useState("");
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showGuestRegistrationModal, setShowGuestRegistrationModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery"); // "cash_on_delivery" или "pay_now"

  const dispatch = useDispatch();
  const router = useRouter();
  const { cart_products } = useSelector((state) => state.cart);
  const { user, accessToken } = useSelector((state) => state.auth);
  const { data: userData } = useGetMeQuery(undefined, { skip: !accessToken });
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm();

  let couponRef = useRef("");

  // Вычисление общей суммы корзины
  const cartTotal = cart_products.reduce((total, item) => {
    return total + (Number(item.price_minor || 0) * item.orderQuantity);
  }, 0);

  const subtotal = cartTotal / 100; // Конвертируем из минорных единиц
  const total = subtotal + shippingCost - discountAmount;

  // Обработка изменения стоимости доставки
  const handleShippingCost = (value) => {
    setShippingCost(value);
  };

  // Обработка применения купона
  const handleCouponCode = (e) => {
    e.preventDefault();
    const couponValue = couponRef.current.value;
    
    if (couponValue === "DISCOUNT10") {
      const discount = (subtotal * 10) / 100;
      setDiscountAmount(discount);
      setDiscountPercentage(10);
      setCouponApplyMsg("Купон успешно применен!");
      setCouponInfo({ code: couponValue, discountPercentage: 10 });
    } else {
      setCouponApplyMsg("Недействительный код купона");
      setDiscountAmount(0);
      setDiscountPercentage(0);
    }
  };

  // Обработка отправки заказа
  const submitHandler = async (data) => {
    setIsCheckoutSubmit(true);

    try {
      // Проверяем, что все обязательные поля заполнены
      if (!data.firstName || !data.lastName || !data.phone || !data.city || !data.warehouse) {
        notifyError("Пожалуйста, заполните все обязательные поля");
        setIsCheckoutSubmit(false);
        return;
      }

      // Подготавливаем данные заказа
      const currentUser = userData || user;
      
      // Формируем адрес Nova Poshta из города и отделения
      const novaPostAddress = `${data.city}, ${data.warehouse}`;
      
      const orderData = {
        name: data.firstName || currentUser?.name || "",
        last_name: data.lastName || currentUser?.last_name || "",
        phone: data.phone || currentUser?.phone || "",
        nova_post_address: novaPostAddress,
        description: data.orderNote || "",
        prepayment: paymentMethod === "pay_now",
        items: cart_products.map(item => ({
          good: item.id, // Используем good вместо good_external_id согласно API схеме
          quantity: item.orderQuantity
        }))
      };

      // Создаем заказ
      const result = await createOrder(orderData).unwrap();
      
      // Очищаем корзину
      dispatch(clearCart());
      
      // Показываем сообщение об успехе
      notifySuccess("Заказ успешно создан!");
      
      // Если пользователь не авторизован, показываем модальное окно предложения регистрации
      if (!accessToken) {
        setShowGuestRegistrationModal(true);
        // Сохраняем информацию о заказе для последующего перенаправления
        sessionStorage.setItem('pendingOrderRedirect', JSON.stringify({
          orderId: result.id,
          paymentMethod
        }));
      } else {
        // Для авторизованных пользователей сразу перенаправляем
        if (paymentMethod === "pay_now") {
          router.push(`/payment/${result.id}`);
        } else {
          router.push(`/order-confirmation/${result.id}`);
        }
      }
      
    } catch (error) {
      console.error("Ошибка создания заказа:", error);
      notifyError("Ошибка при создании заказа. Попробуйте еще раз.");
    } finally {
      setIsCheckoutSubmit(false);
    }
  };

  // Обработка сохранения информации пользователя из модального окна
  const handleUserInfoSubmit = (userInfo) => {
    // Здесь можно обновить информацию пользователя через API
    setValue("firstName", userInfo.firstName);
    setValue("lastName", userInfo.lastName);
    setValue("phone", userInfo.phone);
    setValue("address", userInfo.address);
    setShowUserInfoModal(false);
    
    // После сохранения информации, повторно отправляем заказ
    handleSubmit(submitHandler)();
  };

  // Обработка закрытия модального окна регистрации
  const handleGuestRegistrationClose = () => {
    setShowGuestRegistrationModal(false);
    
    // Получаем сохраненную информацию о заказе и перенаправляем
    const pendingRedirect = sessionStorage.getItem('pendingOrderRedirect');
    if (pendingRedirect) {
      const { orderId, paymentMethod: savedPaymentMethod } = JSON.parse(pendingRedirect);
      sessionStorage.removeItem('pendingOrderRedirect');
      
      if (savedPaymentMethod === "pay_now") {
        router.push(`/payment/${orderId}`);
      } else {
        router.push(`/order-confirmation/${orderId}`);
      }
    }
  };

  // Обработка перехода к регистрации
  const handleGuestRegistrationRegister = () => {
    setShowGuestRegistrationModal(false);
    // Перенаправляем на страницу регистрации, сохраняя информацию о заказе
    router.push('/register');
  };

  return {
    handleSubmit,
    submitHandler,
    register,
    formState: { errors },
    setValue,
    watch,
    handleShippingCost,
    cartTotal: total,
    subtotal,
    shippingCost,
    discountAmount,
    total,
    isCheckoutSubmit,
    handleCouponCode,
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
    user: userData || user,
    accessToken
  };
};

export default useOrderCheckout;
