# 🔍 Руководство по отладке авторизации

## Проблема: "Не могу авторизоваться"

### Симптомы
- Токены есть в localStorage
- Запрос `/auth/me/` возвращает ошибку
- Пользователь не видит свой профиль

### Текущее состояние

**Токены в localStorage:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Декодированный access token:**
```json
{
  "token_type": "access",
  "exp": 1765213664,  // Expires: 2025-12-08 (валиден!)
  "iat": 1765127264,  // Issued: 2025-12-07
  "jti": "6eafeb10f24d498b9f7afc1faa8a8eb7",
  "user_id": "1"
}
```

✅ **Токен валиден** и не истек!

---

## Диагностика

### Шаг 1: Проверьте консоль браузера

Откройте DevTools (F12) → Console и найдите:

```
🔍 GET USER: Making request to /auth/me/
🔍 GET USER: Waiting for response...
❌ GET USER ERROR: {...}
```

Посмотрите на детали ошибки:
- **status**: Код ошибки (404, 401, 500, и т.д.)
- **data**: Тело ответа от сервера
- **message**: Сообщение об ошибке

### Шаг 2: Проверьте Network tab

1. Откройте DevTools → Network
2. Найдите запрос к `/auth/me/`
3. Проверьте:
   - **Status Code**: 200 = OK, 401 = Unauthorized, 404 = Not Found
   - **Request Headers**: Есть ли `Authorization: Bearer ...`?
   - **Response**: Что вернул сервер?

### Шаг 3: Тест через curl

```bash
# Замените YOUR_TOKEN на ваш access token
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     https://api.airbagad.com/api/v2/auth/me/
```

**Ожидаемый ответ (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John",
  "last_name": "Doe",
  "phone": "+380...",
  "is_guest": false,
  "total_spent": 0
}
```

---

## Возможные причины и решения

### 1. ❌ Endpoint не существует (404)

**Проблема:** `/auth/me/` не реализован на бэкенде

**Решение:** Реализуйте endpoint на Django:

```python
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user
    return Response({
        'id': user.id,
        'email': user.email,
        'name': user.first_name,
        'last_name': user.last_name,
        'phone': getattr(user, 'phone', ''),
        'is_guest': getattr(user, 'is_guest', False),
        'total_spent': getattr(user, 'total_spent', 0),
    })

# urls.py
urlpatterns = [
    path('auth/me/', get_current_user, name='current-user'),
]
```

---

### 2. ❌ Неправильный URL (404)

**Проблема:** Endpoint находится по другому пути

**Возможные варианты:**
- `/api/v2/auth/me/` ✅ (текущий)
- `/api/v2/auth/user/`
- `/api/v2/users/me/`
- `/api/v2/me/`

**Решение:** Проверьте документацию API или спросите у бэкенд разработчика

---

### 3. ❌ Токен не передается (401)

**Проблема:** Authorization header не добавляется к запросу

**Проверка:**
```javascript
// В консоли браузера
localStorage.getItem('userInfo')
```

**Решение:** Убедитесь что `apiSlice.js` правильно добавляет header:

```javascript
// src/redux/api/apiSlice.js
prepareHeaders: async (headers) => {
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    console.log('✅ Authorization header added:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    console.warn('⚠️ No access token found!');
  }
  return headers;
}
```

---

### 4. ❌ Токен истек (401)

**Проблема:** Access token больше не валиден

**Проверка:** Декодируйте токен на https://jwt.io/

**Решение:** Автоматическое обновление токена уже реализовано в `apiSlice.js`:
- При 401 автоматически вызывается `/auth/token/refresh/`
- Получается новый access token
- Запрос повторяется

---

### 5. ❌ CORS ошибка

**Проблема:** Браузер блокирует запрос из-за CORS

**Признаки в консоли:**
```
Access to fetch at 'https://api.airbagad.com/api/v2/auth/me/' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Решение:** Добавьте в Django settings:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://yourdomain.com",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

---

### 6. ❌ Неправильный формат ответа

**Проблема:** Сервер возвращает данные в другом формате

**Ожидаемый формат:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John",
  "last_name": "Doe"
}
```

**Если сервер возвращает:**
```json
{
  "user": {
    "id": 1,
    "email": "..."
  }
}
```

**Решение:** Добавьте `transformResponse` в authApi:

```javascript
getUser: builder.query({
  query: () => '/auth/me/',
  transformResponse: (response) => {
    // Если данные вложены в response.user
    return response.user || response;
  },
}),
```

---

## Временное решение: Работа без /auth/me/

Если endpoint не готов, можно временно работать только с токенами:

### Вариант 1: Извлечь данные из токена

```javascript
// src/utils/jwtDecode.js
export function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

// Использование
const tokenData = decodeJWT(accessToken);
const userId = tokenData?.user_id;
```

### Вариант 2: Отключить автозагрузку пользователя

```javascript
// src/layout/headers/header-com/header-main-right.jsx
const { data: userData, error: userError } = useGetUserQuery(undefined, {
  skip: true, // Временно отключаем запрос
});
```

---

## Проверочный чеклист

- [ ] Endpoint `/auth/me/` существует на бэкенде
- [ ] Endpoint возвращает 200 OK при правильном токене
- [ ] Authorization header добавляется к запросу
- [ ] Токен не истек (проверьте `exp` в jwt.io)
- [ ] CORS настроен правильно
- [ ] Формат ответа соответствует ожидаемому
- [ ] В консоли нет ошибок CORS или 401

---

## Следующие шаги

1. **Откройте консоль браузера** и найдите детали ошибки
2. **Проверьте Network tab** - какой статус код?
3. **Протестируйте через curl** - работает ли endpoint?
4. **Свяжитесь с бэкенд разработчиком** если endpoint не работает

---

## Полезные команды

```bash
# Проверить endpoint
curl https://api.airbagad.com/api/v2/auth/me/

# С токеном
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.airbagad.com/api/v2/auth/me/

# Проверить все auth endpoints
curl https://api.airbagad.com/api/v2/auth/

# Декодировать JWT токен
echo "YOUR_TOKEN" | cut -d. -f2 | base64 -d | jq
```

---

**Статус**: 🔍 Требуется диагностика  
**Приоритет**: Высокий  
**Следующий шаг**: Проверить консоль браузера и Network tab
