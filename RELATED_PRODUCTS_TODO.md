# Рекомендуемые товары - План реализации

## Текущее состояние
- ✅ Создана заглушка для endpoint `getRelatedProducts`
- ✅ Исправлена ошибка с `tags[1]` в `product-item.jsx`
- ✅ Компонент `related-products.jsx` корректно обрабатывает данные
- ✅ Временно показываются первые 4 товара из общего списка

## Что нужно реализовать на бэкенде (Remonline)

### 1. Добавить поле для связанных товаров
В Remonline нужно добавить поле в товарах для хранения ID связанных товаров:
- **Название поля**: `related_products` или `recommended_products`
- **Тип**: Текстовое поле
- **Формат**: ID товаров через запятую (например: "123,456,789")

### 2. Обновить API endpoint
Когда поле будет добавлено, нужно обновить endpoint в `productsApi.js`:

```javascript
// Заменить текущую заглушку на:
getRelatedProducts: builder.query({
  query: (id) => `/goods/?related_to=${id}`,
  transformResponse: (response) => {
    return {
      data: response.results || response.data || response || []
    };
  },
  providesTags: ['RelatedProducts'],
}),
```

### 3. Логика на бэкенде
API должен:
1. Получить товар по ID
2. Извлечь значение поля `related_products`
3. Разделить по запятой и получить массив ID
4. Вернуть товары с этими ID
5. Если поле пустое - вернуть товары из той же категории

## Альтернативные варианты

### Вариант 1: По категории
```javascript
query: (id) => `/goods/${id}/category-products/?limit=4`
```

### Вариант 2: По тегам
```javascript
query: (id) => `/goods/?similar_tags=${id}&limit=4`
```

### Вариант 3: Популярные товары
```javascript
query: (id) => `/goods/?popular=true&limit=4`
```

## Текущая заглушка
Пока что используется простая заглушка, которая возвращает первые 4 товара:
```javascript
query: (id) => `/goods/?limit=4`
```

## Когда реализовать
После того, как в Remonline будет добавлено поле для связанных товаров, просто обновите endpoint в `src/redux/features/productsApi.js` и функционал заработает автоматически.
