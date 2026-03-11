'use client';
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCreateOrderMutation } from "@/redux/features/ordersApi";
import { useGetUserQuery, useCreateGuestMutation } from "@/redux/features/auth/authApi";
import { useUpdateClientPutMutation } from '@/redux/features/clientsApi';
import { userLoggedIn } from "@/redux/features/auth/authSlice";
import { clearCart } from "@/redux/features/cartSlice";
import { notifySuccess, notifyError } from "@/utils/toast";
import Cookies from "js-cookie";
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
      .matches(/^[\+]?[0-9\(\)\-\s]+$/, t("phone_invalid")),
    city: Yup.string().required(t("city_required")),
    warehouse: Yup.string().required(t("warehouse_required")),
    orderNotes: Yup.string().max(500, t("order_notes_max", { count: 500 })),
  });

const useOrderCheckout = () => {
  const tv = useTranslations("CheckoutValidation");
  const tg = useTranslations("GuestValidation");
  const checkoutSchema = buildCheckoutSchema(tv);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [couponInfo, setCouponInfo] = useState({});
  const [couponApplyMsg, setCouponApplyMsg] = useState("");
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showGuestRegistrationModal, setShowGuestRegistrationModal] = useState(false);
  // Checkout UX: default to card payment ("pay now").
  const [paymentMethod, setPaymentMethod] = useState("pay_now"); // "cash_on_delivery" | "pay_now"

  const dispatch = useDispatch();
  const router = useRouter();
  const { locale } = useParams();
  const { cart_products } = useSelector((state) => state.cart);
  const { user, accessToken } = useSelector((state) => state.auth);
  // Do not call /auth/me/ here.
  // Backend can return 403 or non-JSON in some environments; checkout works with token-only.
  const { data: userData } = useGetUserQuery(undefined, { skip: true });
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [createGuest, { isLoading: isCreatingGuest }] = useCreateGuestMutation();
  const [updateClientPut] = useUpdateClientPutMutation();

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
      // Remember whether user started checkout without auth.
      // We use this later to decide whether to show guest registration suggestions.
      const startedUnauthenticated = !accessToken;

      // Проверяем, что все обязательные поля заполнены
      if (!data.firstName || !data.lastName || !data.phone || !data.city || !data.warehouse) {
        notifyError(tv("fill_required_fields"));
        setIsCheckoutSubmit(false);
        return;
      }

      // Подготавливаем данные заказа
      const currentUser = userData || user;
      
      // Формируем адрес Nova Poshta из города и отделения
      const novaPostAddress = `${data.city}, ${data.warehouse}`;
      
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

      // Если пользователь не авторизован, создаем гостевой аккаунт
      if (!accessToken) {
        // If we already have guest/user tokens in storage, sync them and do NOT create another guest.
        // This prevents situations where guest was created on backend, but checkout retries and hits
        // `phone already exists`.
        try {
          const ls = getAuth();
          if (ls?.accessToken) {
            dispatch(
              userLoggedIn({
                accessToken: ls.accessToken,
                user: ls.user ?? null,
                isGuest: ls.isGuest ?? false,
                guestId: ls.guestId ?? null,
              })
            );
            console.log("Using existing auth token from localStorage, skipping guest creation");
          }
        } catch (e) {
          console.warn("Failed to sync auth from localStorage:", e);
        }

        const cookieRaw = Cookies.get("userInfo");
        if (!accessToken && cookieRaw) {
          try {
            const c = JSON.parse(cookieRaw);
            if (c?.accessToken) {
              dispatch(
                userLoggedIn({
                  accessToken: c.accessToken,
                  user: c.user ?? null,
                  isGuest: c.isGuest ?? false,
                  guestId: c.guestId ?? null,
                })
              );
              console.log("Using existing auth token from cookies, skipping guest creation");
            }
          } catch (e) {
            console.warn("Failed to parse cookie userInfo:", e);
          }
        }

        // After sync attempt, if token exists in storage, proceed to create order
        const finalLs = (() => {
          try {
            return getAuth();
          } catch {
            return null;
          }
        })();
        if (finalLs?.accessToken) {
          console.log("Auth token is present in storage, continuing order creation without new guest");
        } else {
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
        } catch (guestError) {
          console.error("Failed to create guest account:", guestError);
          console.error("Guest error details:", {
            message: guestError?.message,
            status: guestError?.status,
            data: guestError?.data
          });

          // If backend says the phone already exists, we might be retrying after a successful guest create.
          // If tokens are already in storage, allow checkout to continue.
          if (guestError?.status === 400 && guestError?.data?.phone?.[0]?.includes("already exists")) {
            const existing = (() => {
              try {
                return getAuth();
              } catch {
                return null;
              }
            })();
            if (existing?.accessToken) {
              console.warn("Guest already exists by phone, but token is present in storage. Continuing...");
              // do not throw
              return;
            }
          }

          // If we failed due to client-side validation, surface the exact fields
          if (guestError?.status === "CLIENT_VALIDATION_ERROR") {
            const errs = guestError?.data?.errors || {};

            const formatGuestFieldError = (field, err) => {
              if (!err) return null;
              const label = (() => {
                try {
                  return tg(field);
                } catch {
                  return field;
                }
              })();

              if (typeof err === "string") return `${label}: ${err}`;
              const code = err?.code;
              if (!code) return `${label}: ${JSON.stringify(err)}`;

              if (code === "maxLength") return `${label}: ${tg("maxLength", { max: err.max })}`;
              return `${label}: ${tg(code)}`;
            };

            const parts = Object.entries(errs)
              .map(([field, err]) => formatGuestFieldError(field, err))
              .filter(Boolean);

            const details = parts.length ? parts.join("; ") : tv("guest_validation_failed_generic");
            throw new Error(`${tv("guest_create_failed")}: ${details}`);
          }

          // If backend returns 400 with field errors, show them as well
          if (guestError?.status === 400 && guestError?.data) {
            const d = guestError.data;

            // translate common backend messages
            const phoneAlreadyExists =
              Array.isArray(d.phone) &&
              typeof d.phone[0] === "string" &&
              d.phone[0].includes("already exists");

            const msg =
              d.detail ||
              (phoneAlreadyExists && tv("phone_already_exists")) ||
              (d.phone && `Телефон: ${d.phone[0]}`) ||
              (d.name && `Имя: ${d.name[0]}`) ||
              (d.last_name && `Фамилия: ${d.last_name[0]}`) ||
              (d.nova_post_address && `Адрес доставки: ${d.nova_post_address[0]}`) ||
              (d.email && `Email: ${d.email[0]}`) ||
              (d.login && `Логин: ${d.login[0]}`) ||
              (d.telegram_id && `Telegram: ${d.telegram_id[0]}`) ||
              "Некорректные данные гостя";
            throw new Error(`Не удалось создать гостевой аккаунт: ${msg}`);
          }
          
          throw new Error(tv("guest_create_failed_try_again"));
        }
        }
      }

      // Создаем заказ
      const result = await createOrder(orderData).unwrap();

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

      // Если пользователь не авторизован, показываем модальное окно предложения регистрации
      if (startedUnauthenticated) {
        setShowGuestRegistrationModal(true);
        // Сохраняем информацию о заказе для последующего перенаправления
        sessionStorage.setItem('pendingOrderRedirect', JSON.stringify({
          orderId: result.id,
          paymentMethod
        }));
      } else {
        // Если наложка — обычный редирект
        router.push(`/${locale}/order-success`);
      }
      
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
