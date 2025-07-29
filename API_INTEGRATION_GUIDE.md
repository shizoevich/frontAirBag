# API Integration Guide для Shofy Template

## Обзор
Этот документ описывает интеграцию пользовательских API endpoints в шаблон Shofy с использованием Redux Toolkit Query.

## Исправленные проблемы
- ✅ Исправлена ошибка `imageURLs.some()` в `DetailsWrapper` компоненте
- ✅ Исправлен некорректный URL в `productsApi.js` для создания товара

## Созданные API слайсы

### 1. Authentication API (`authApi.js`)
```javascript
import { useLoginMutation, useRefreshTokenMutation, useVerifyTokenMutation } from '../redux/features/authApi';
```

**Endpoints:**
- `POST /auth/login/` - Вход в систему
- `POST /auth/token/refresh/` - Обновление токена
- `POST /auth/token/verify/` - Проверка токена

### 2. Cart API (`cartApi.js`)
```javascript
import { 
  useGetCartsQuery, 
  useAddCartItemMutation, 
  useUpdateCartItemMutation, 
  useRemoveCartItemMutation 
} from '../redux/features/cartApi';
```

**Endpoints:**
- `GET /carts/` - Получение всех корзин
- `POST /carts/` - Создание корзины
- `GET /cart-items/` - Получение товаров в корзине
- `POST /cart-items/` - Добавление товара в корзину
- `PATCH /cart-items/{id}/` - Обновление товара в корзине
- `DELETE /cart-items/{id}/` - Удаление товара из корзины

### 3. Orders API (`ordersApi.js`)
```javascript
import { 
  useGetOrdersQuery, 
  useCreateOrderMutation, 
  useGetOrderItemsQuery 
} from '../redux/features/ordersApi';
```

**Endpoints:**
- `GET /orders/` - Получение всех заказов
- `POST /orders/` - Создание заказа
- `GET /order-items/` - Получение товаров заказа
- `GET /order-updates/` - Получение обновлений заказа

### 4. Clients API (`clientsApi.js`)
```javascript
import { 
  useGetClientsQuery, 
  useCreateClientMutation, 
  useGetClientUpdatesQuery 
} from '../redux/features/clientsApi';
```

**Endpoints:**
- `GET /clients/` - Получение всех клиентов
- `POST /clients/` - Создание клиента
- `GET /client-updates/` - Получение обновлений клиента

### 5. Discounts API (`discountsApi.js`)
```javascript
import { 
  useGetDiscountsQuery, 
  useApplyDiscountMutation 
} from '../redux/features/discountsApi';
```

**Endpoints:**
- `GET /discounts/` - Получение всех скидок
- `POST /discounts/` - Создание скидки
- Custom endpoint для применения скидок

### 6. Bot Visitors API (`botVisitorsApi.js`)
```javascript
import { 
  useGetBotVisitorsQuery, 
  useCreateBotVisitorMutation 
} from '../redux/features/botVisitorsApi';
```

### 7. Templates API (`templatesApi.js`)
```javascript
import { 
  useGetTemplatesQuery, 
  useCreateTemplateMutation 
} from '../redux/features/templatesApi';
```

## Конфигурация

### Environment Variables
Убедитесь, что в `.env.local` указан правильный базовый URL:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8010/api/v2
```

### Redux Store
Все API автоматически подключены через `apiSlice.injectEndpoints()` и не требуют дополнительной настройки в store.

## Примеры использования

### Аутентификация
```javascript
const LoginComponent = () => {
  const [login, { isLoading, error }] = useLoginMutation();
  
  const handleLogin = async (credentials) => {
    try {
      const result = await login(credentials).unwrap();
      // Сохранить токены
    } catch (err) {
      console.error('Login failed:', err);
    }
  };
};
```

### Работа с корзиной
```javascript
const CartComponent = () => {
  const { data: carts } = useGetCartsQuery();
  const [addToCart] = useAddCartItemMutation();
  
  const handleAddToCart = async (productId, quantity) => {
    await addToCart({
      cart: 1,
      product: productId,
      quantity: quantity
    });
  };
};
```

### Создание заказа
```javascript
const OrderComponent = () => {
  const [createOrder] = useCreateOrderMutation();
  
  const handleCreateOrder = async (orderData) => {
    const result = await createOrder(orderData).unwrap();
  };
};
```

## Кэширование и теги

Все API используют соответствующие теги для автоматической инвалидации кэша:
- `User` - для аутентификации
- `Carts`, `CartItems` - для корзины
- `Orders`, `OrderItems`, `OrderUpdates` - для заказов
- `Clients`, `ClientUpdates` - для клиентов
- `Discounts` - для скидок
- `BotVisitors` - для bot visitors
- `Templates` - для шаблонов

## Следующие шаги

1. Обновите компоненты шаблона для использования новых API
2. Добавьте обработку ошибок и loading состояний
3. Настройте аутентификацию с токенами
4. Протестируйте все endpoints с реальными данными

## Файлы для проверки

- `src/examples/api-usage-examples.js` - Примеры использования всех API
- `src/redux/features/` - Все созданные API слайсы
- `src/components/product-details/details-wrapper.jsx` - Исправленный компонент
