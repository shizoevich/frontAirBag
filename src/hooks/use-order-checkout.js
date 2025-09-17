'use client';
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { useCreateOrderMutation } from "@/redux/features/ordersApi";
import { useGetUserQuery, useCreateGuestMutation } from "@/redux/features/auth/authApi";
import { clearCart } from "@/redux/features/cartSlice";
import { notifySuccess, notifyError } from "@/utils/toast";
import Cookies from "js-cookie";

// Валидационная схема для checkout формы
const checkoutSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("Имя обязательно для заполнения")
    .min(2, "Имя должно содержать минимум 2 символа"),
  lastName: Yup.string()
    .required("Фамилия обязательна для заполнения")
    .min(2, "Фамилия должна содержать минимум 2 символа"),
  phone: Yup.string()
    .required("Телефон обязателен для заполнения")
    .matches(/^[\+]?[0-9\(\)\-\s]+$/, "Введите корректный номер телефона"),
  city: Yup.string()
    .required("Выберите город"),
  warehouse: Yup.string()
    .required("Выберите отделение Новой Почты"),
  orderNotes: Yup.string()
    .max(500, "Комментарий не должен превышать 500 символов")
});

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
  const { locale } = useParams();
  const { cart_products } = useSelector((state) => state.cart);
  const { user, accessToken } = useSelector((state) => state.auth);
  const { data: userData } = useGetUserQuery(undefined, { skip: !accessToken });
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [createGuest, { isLoading: isCreatingGuest }] = useCreateGuestMutation();

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm({
    resolver: yupResolver(checkoutSchema),
    mode: 'onChange', // Валидация при изменении полей
  });

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
        prepayment: paymentMethod === "pay_now",
        items: cart_products.map(item => ({
          good: item.id, // Используем good вместо good_external_id согласно API схеме
          quantity: item.orderQuantity
        }))
      };

      // Добавляем description только если оно не пустое
      if (data.orderNotes && data.orderNotes.trim() !== "") {
        orderData.description = data.orderNotes.trim();
      }

      // Детальное логирование данных заказа
      console.log("=== ORDER DATA DEBUG ===");
      console.log("Order data being sent:", JSON.stringify(orderData, null, 2));
      console.log("Cart products:", JSON.stringify(cart_products, null, 2));
      console.log("Current user:", JSON.stringify(currentUser, null, 2));
      console.log("Form data:", JSON.stringify(data, null, 2));
      console.log("Payment method:", paymentMethod);
      console.log("Access token exists:", !!accessToken);
      console.log("========================");

      // Если пользователь не авторизован, создаем гостевой аккаунт
      if (!accessToken) {
        console.log("Creating guest account for order...");
        const guestData = {
          name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          nova_post_address: novaPostAddress
        };
        
        try {
          const guestResult = await createGuest(guestData).unwrap();
          console.log("Guest account created successfully:", guestResult);
          
          // Проверяем, что токены были сохранены
          const userInfo = Cookies.get('userInfo');
          console.log("Tokens after guest creation:", userInfo);
          
          if (!userInfo) {
            throw new Error("Токены гостя не были сохранены");
          }
          
          // Даем время для обновления токенов в Redux store и cookies
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Проверяем еще раз
          const finalUserInfo = Cookies.get('userInfo');
          console.log("Final tokens check:", finalUserInfo);
          
        } catch (guestError) {
          console.error("Failed to create guest account:", guestError);
          console.error("Guest error details:", {
            message: guestError?.message,
            status: guestError?.status,
            data: guestError?.data
          });
          
          throw new Error("Не удалось создать гостевой аккаунт. Попробуйте еще раз.");
        }
      }

      // Создаем заказ
      const result = await createOrder(orderData).unwrap();
      
      // Очищаем корзину
      dispatch(clearCart());
      
      // Показываем сообщение об успехе
      notifySuccess("Заказ успешно создан!");
      
      // Сохраняем информацию о заказе в sessionStorage для отображения на странице успеха
      sessionStorage.setItem('lastOrderInfo', JSON.stringify({
        orderId: result.id,
        paymentMethod,
        orderData,
        timestamp: new Date().toISOString()
      }));

      // Если пользователь не авторизован, показываем модальное окно предложения регистрации
      if (!accessToken) {
        setShowGuestRegistrationModal(true);
        // Сохраняем информацию о заказе для последующего перенаправления
        sessionStorage.setItem('pendingOrderRedirect', JSON.stringify({
          orderId: result.id,
          paymentMethod
        }));
      } else {
        // Для всех пользователей перенаправляем на страницу успешного оформления
        // TODO: В будущем можно добавить логику оплаты для paymentMethod === "pay_now"
        router.push(`/${locale}/order-success`);
      }
      
    } catch (error) {
      console.error("Ошибка создания заказа:", error);
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        data: error?.data,
        originalStatus: error?.originalStatus,
        error: error?.error
      });
      
      // Логируем полную структуру ошибки для диагностики
      console.error("Full error object:", JSON.stringify(error, null, 2));
      
      // Если есть детали ошибки от сервера, выводим их
      if (error?.data) {
        console.error("Server error response:", JSON.stringify(error.data, null, 2));
      }
      
      // Более детальное сообщение об ошибке
      let errorMessage = "Ошибка при создании заказа. Попробуйте еще раз.";
      
      // Если есть конкретная ошибка от сервера, показываем её
      if (error?.data?.detail) {
        errorMessage = `Ошибка: ${error.data.detail}`;
      } else if (error?.data?.message) {
        errorMessage = `Ошибка: ${error.data.message}`;
      } else if (error?.status === 400) {
        errorMessage = "Некорректные данные заказа. Проверьте заполнение всех полей.";
      }
      
      if (error?.data) {
        if (error.data.detail) {
          errorMessage = error.data.detail;
        } else if (error.data.message) {
          errorMessage = error.data.message;
        } else if (error.data.non_field_errors) {
          errorMessage = error.data.non_field_errors[0];
        } else if (error.data.phone) {
          errorMessage = `Телефон: ${error.data.phone[0]}`;
        } else if (error.data.nova_post_address) {
          errorMessage = `Адрес доставки: ${error.data.nova_post_address[0]}`;
        }
      } else if (error?.status === 400) {
        errorMessage = "Проверьте правильность заполнения всех полей";
      } else if (error?.status === 401) {
        errorMessage = "Ошибка авторизации. Попробуйте войти в аккаунт";
      } else if (error?.status >= 500) {
        errorMessage = "Ошибка сервера. Попробуйте позже";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      notifyError(errorMessage);
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
