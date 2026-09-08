'use client';
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCreateOrderMutation, useUploadPaymentDocMutation } from "@/redux/features/ordersApi";
import { useGetUserQuery } from "@/redux/features/auth/authApi";
import { readTelegramInitData } from "@/utils/telegram";
import { PHONE_RE } from "@/utils/phone";
import { useUpdateClientPutMutation } from '@/redux/features/clientsApi';
import { clearCart } from "@/redux/features/cartSlice";
import { notifySuccess, notifyError } from "@/utils/toast";
import { uploadPaymentDocWithRetry } from "@/utils/upload-payment-doc";
import { getAuth } from "@/utils/authStorage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchGoodIdBy(paramName, paramValue) {
  if (!API_BASE_URL) return null;
  if (paramValue === undefined || paramValue === null || paramValue === "") return null;

  const url = `${API_BASE_URL}/goods/?${paramName}=${encodeURIComponent(paramValue)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const good = data?.results?.[0];
  return good?.id ?? null;
}

async function resolveCartItemGoodId(item) {
  // Prefer internal PK when present.
  const direct = Number(item?.id ?? item?._id);
  if (Number.isFinite(direct) && direct > 0) {
    // Verify it exists to avoid “Invalid pk” at order creation.
    const byId = await fetchGoodIdBy("id", direct);
    if (byId) return byId;
  }

  const remonline = Number(item?.id_remonline);
  if (Number.isFinite(remonline) && remonline > 0) {
    const byRem = await fetchGoodIdBy("id_remonline", remonline);
    if (byRem) return byRem;
  }

  return null;
}

function getRemonlineId(client) {
  if (!client) return null;
  const direct = client?.id_remonline ?? client?.remonline_id ?? client?.remonlineId;
  if (direct !== undefined && direct !== null && String(direct).trim() !== "") {
    return direct;
  }
  return null;
}

// Валидационная схема для checkout формы
const buildCheckoutSchema = (t) =>
  Yup.object().shape({
    firstName: Yup.string()
      .required(t("first_name_required"))
      .min(2, t("min_characters", { count: 2 })),
    lastName: Yup.string()
      .required(t("last_name_required"))
      .min(2, t("min_characters", { count: 2 })),
    phone: Yup.string()
      .required(t("phone_required"))
      .matches(PHONE_RE, t("phone_invalid")),
    city: Yup.string().required(t("city_required")),
    warehouse: Yup.string().required(t("warehouse_required")),
    orderNotes: Yup.string().max(500, t("order_notes_max", { count: 500 })),
  });

const useOrderCheckout = () => {
  const tv = useTranslations("CheckoutValidation");
  const checkoutSchema = buildCheckoutSchema(tv);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [couponInfo, setCouponInfo] = useState({});
  const [couponApplyMsg, setCouponApplyMsg] = useState("");
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  // Checkout UX: default to card payment ("pay now").
  const [paymentMethod, setPaymentMethod] = useState("pay_now"); // "cash_on_delivery" | "pay_now" | "bank_transfer"
  // Bank transfer payment confirmation document (uploaded after order creation)
  const [bankTransferFile, setBankTransferFile] = useState(null);

  const dispatch = useDispatch();
  const router = useRouter();
  const { locale } = useParams();
  const { cart_products } = useSelector((state) => state.cart);
  const { user, accessToken } = useSelector((state) => state.auth);
  // Do not call /auth/me/ here.
  // Backend can return 403 or non-JSON in some environments; checkout works with token-only.
  const { data: userData } = useGetUserQuery(undefined, { skip: true });
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [uploadPaymentDoc] = useUploadPaymentDocMutation();
  const [updateClientPut] = useUpdateClientPutMutation();

  const { register, handleSubmit, setValue, control, formState: { errors }, watch } = useForm({
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
      // Оформление — только под аккаунтом (ADR-0021). Сессия могла умереть уже
      // после открытия страницы: тогда на вход, корзина в localStorage дождётся.
      if (!accessToken && !getAuth()?.accessToken) {
        localStorage.setItem('redirectAfterLogin', `/${locale}/checkout`);
        setIsCheckoutSubmit(false);
        router.push(`/${locale}/login`);
        return;
      }

      // Проверяем, что все обязательные поля заполнены
      if (!data.firstName || !data.lastName || !data.phone || !data.city || !data.warehouse) {
        notifyError(tv("fill_required_fields"));
        setIsCheckoutSubmit(false);
        return;
      }

      // Подготавливаем данные заказа
      const currentUser = userData || user;
      
      // Формируем адрес Nova Poshta из города и отделения.
      // AIRBAG-82/83: при самовывозе (shippingOption === 'pickup') адрес НЕ отправляем,
      // даже если поля города/отделения остались заполнены — иначе бэкенд считает
      // заказ доставкой ("Накладений платіж") и success-страница показывает доставку.
      const isPickup = data.shippingOption === 'pickup';
      const novaPostAddress = (!isPickup && data.city && data.warehouse)
        ? `${data.city}, ${data.warehouse}`
        : "";
      
      // Resolve Good PKs for cart items (prevents backend: Invalid pk ".." - object does not exist)
      const resolvedItems = await Promise.all(
        cart_products.map(async (item) => {
          const goodId = await resolveCartItemGoodId(item);
          const quantity = Number(item?.orderQuantity ?? 0);
          return {
            good: goodId,
            quantity,
            title: item?.title,
          };
        })
      );

      const invalid = resolvedItems.find((it) => !it.good || !Number.isFinite(it.quantity) || it.quantity <= 0);
      if (invalid) {
        // Most common case: stale cart item id that doesn't exist in backend.
        const name = invalid?.title || "товар";
        throw new Error(`Товар "${name}" не найден в базе. Удалите его из корзины и добавьте заново.`);
      }

      const orderData = {
        name: data.firstName || currentUser?.name || "",
        last_name: data.lastName || currentUser?.last_name || "",
        phone: data.phone || currentUser?.phone || "",
        nova_post_address: novaPostAddress,
        prepayment: paymentMethod === "pay_now",
        bank_transfer: paymentMethod === "bank_transfer",
        items: resolvedItems.map(({ good, quantity }) => ({ good, quantity })),
      };

      // After first order, persist user-entered checkout fields into the Client profile.
      // This enables prefilling the checkout form next time.
      let updatedClient = null;
      try {
        const userId = currentUser?.id;
        const canUpdateClient = Boolean(accessToken && userId);
        if (canUpdateClient) {
          const merged = {
            ...currentUser,
            name: data.firstName || currentUser?.name || null,
            last_name: data.lastName || currentUser?.last_name || null,
            nova_post_address: novaPostAddress || currentUser?.nova_post_address || null,
            // Keep required email if backend enforces it
            email: currentUser?.email,
          };
          updatedClient = await updateClientPut({ id: userId, data: merged }).unwrap();
        }
      } catch (e) {
        // Non-blocking: order creation should still succeed
        console.warn('Client profile update failed (non-blocking):', e);
      }

      // No remonline id validation on the client. Backend should not require it for checkout.

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

      // Заказ из мини-аппа: бэкенд запишет, с какого Telegram оформили
      const initData = readTelegramInitData();
      if (initData) orderData.init_data = initData;

      // Создаем заказ
      const result = await createOrder(orderData).unwrap();

      // Bank transfer: upload the payment confirmation document (order_id is now available)
      //
      // Раньше ошибка загрузки уходила в console.warn как «non-blocking», и
      // клиент об этом не узнавал: заказ создан, а квитанции к нему нет. Пока
      // существовал путь через бота, документ можно было донести оттуда; после
      // его удаления это единственный способ, поэтому о неудаче надо сказать.
      if (paymentMethod === "bank_transfer" && bankTransferFile) {
        const uploaded = await uploadPaymentDocWithRetry(
          (args) => uploadPaymentDoc(args).unwrap(),
          result.id,
          bankTransferFile
        );
        if (!uploaded) {
          notifyError(
            `Замовлення №${result.id} створено, але документ про оплату не завантажився. ` +
            `Будь ласка, зв'яжіться з нами і надішліть квитанцію.`
          );
        }
      }

      // For pay-now flow we keep the cart until payment is completed.
      // Clearing immediately makes the checkout totals show 0 while payment iframe is open.
      if (paymentMethod !== 'pay_now') {
        dispatch(clearCart());
        notifySuccess("Заказ успешно создан!");
      } else {
        notifySuccess("Заказ создан. Перейдите к оплате.");
      }
      
      // Сохраняем информацию о заказе в sessionStorage для отображения на странице успеха
      sessionStorage.setItem('lastOrderInfo', JSON.stringify({
        orderId: result.id,
        paymentMethod,
        orderData,
        timestamp: new Date().toISOString()
      }));

      // For card payments we must return the created order so the caller can open the payment iframe.
      if (paymentMethod === "pay_now") {
        return result;
      }

      // Самовывоз / оплата потом — заказ создан, оплата не подтверждена.
      // AIRBAG-83: прокидываем способ доставки, чтобы на странице успеха
      // не показывать текст про отправку при самовывозе.
      const deliveryParam = novaPostAddress ? "shipping" : "pickup";
      router.push(`/${locale}/order-success?payment=pending&delivery=${deliveryParam}`);
      
    } catch (error) {
      // RTK Query / fetch errors can look like {} in console (non-enumerable fields).
      const status = error?.status ?? error?.error?.status;
      const data = error?.data ?? error?.error?.data;
      const message =
        data?.detail ||
        data?.message ||
        error?.message ||
        error?.error ||
        "Unknown error";

      const safeStringify = (v) => {
        try {
          return JSON.stringify(v, null, 2);
        } catch (e) {
          return "[unstringifiable]";
        }
      };

      console.error("Ошибка создания заказа (details):", {
        status,
        message,
        data,
        keys: error ? Object.getOwnPropertyNames(error) : [],
        raw: error,
      });

      if (data) {
        console.error("Server error response:", safeStringify(data));
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
          // Чужой номер — код от бэкенда, текст наш (ADR-0021)
          const phoneError = [].concat(error.data.phone)[0];
          errorMessage = phoneError === "phone_belongs_to_other_account"
            ? tv("phone_belongs_to_other_account")
            : phoneError;
        } else if (error.data.nova_post_address) {
          errorMessage = `Адрес доставки: ${error.data.nova_post_address[0]}`;
        }
      } else if (error?.status === 400) {
        errorMessage = "Проверьте правильность заполнения всех полей";
      } else if (error?.status === 401) {
        errorMessage = "Ошибка авторизации. Попробуйте войти в аккаунт";
      } else if (error?.status >= 500) {
        errorMessage = "Ошибка сервера. Попробуйте позже";
      } else if (message) {
        errorMessage = message;
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

  return {
    handleSubmit,
    submitHandler,
    register,
    control,
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
    paymentMethod,
    setPaymentMethod,
    bankTransferFile,
    setBankTransferFile,
    user: userData || user,
    accessToken
  };
};

export default useOrderCheckout;
