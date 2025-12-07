# Discounts API Integration Guide

## API Endpoints

### 1. GET /discounts/
Получить список всех скидок с поддержкой пагинации.

**Parameters:**
- `limit` (integer, optional) - Количество результатов на странице
- `offset` (integer, optional) - Начальный индекс для возврата результатов

**Response (200):**
```json
{
  "count": 4,
  "next": "string($uri)",
  "previous": "string($uri)",
  "results": [
    {
      "id": 1,
      "percentage": "2.00",
      "month_payment": 1000000
    }
  ]
}
```

**Usage in React:**
```javascript
import { useGetDiscountsQuery } from '@/redux/features/discountsApi';

// Получить все скидки
const { data, isLoading, isError } = useGetDiscountsQuery();

// С пагинацией
const { data, isLoading, isError } = useGetDiscountsQuery({ limit: 10, offset: 0 });
```

---

### 2. POST /discounts/
Создать новую скидку (только для администраторов).

**Request Body:**
```json
{
  "percentage": "2.00",
  "month_payment": 1000000
}
```

**Response (201):**
```json
{
  "id": 1,
  "percentage": "2.00",
  "month_payment": 1000000
}
```

**Usage in React:**
```javascript
import { useCreateDiscountMutation } from '@/redux/features/discountsApi';

const [createDiscount, { isLoading }] = useCreateDiscountMutation();

const handleCreate = async () => {
  try {
    const result = await createDiscount({
      percentage: "2.00",
      month_payment: 1000000
    }).unwrap();
    console.log('Discount created:', result);
  } catch (error) {
    console.error('Error creating discount:', error);
  }
};
```

---

### 3. GET /discounts/{id}/
Получить скидку по ID.

**Parameters:**
- `id` (integer, required) - Уникальный идентификатор скидки

**Response (200):**
```json
{
  "id": 1,
  "percentage": "2.00",
  "month_payment": 1000000
}
```

**Usage in React:**
```javascript
import { useGetDiscountByIdQuery } from '@/redux/features/discountsApi';

const { data, isLoading, isError } = useGetDiscountByIdQuery(1);
```

---

### 4. PUT /discounts/{id}/
Полное обновление скидки.

**Request Body:**
```json
{
  "percentage": "4.00",
  "month_payment": 2500000
}
```

**Response (200):**
```json
{
  "id": 1,
  "percentage": "4.00",
  "month_payment": 2500000
}
```

---

### 5. PATCH /discounts/{id}/
Частичное обновление скидки.

**Request Body:**
```json
{
  "percentage": "4.00"
}
```

**Response (200):**
```json
{
  "id": 1,
  "percentage": "4.00",
  "month_payment": 1000000
}
```

**Usage in React:**
```javascript
import { useUpdateDiscountMutation } from '@/redux/features/discountsApi';

const [updateDiscount, { isLoading }] = useUpdateDiscountMutation();

const handleUpdate = async () => {
  try {
    const result = await updateDiscount({
      id: 1,
      percentage: "4.00"
    }).unwrap();
    console.log('Discount updated:', result);
  } catch (error) {
    console.error('Error updating discount:', error);
  }
};
```

---

### 6. DELETE /discounts/{id}/
Удалить скидку.

**Parameters:**
- `id` (integer, required) - Уникальный идентификатор скидки

**Response (204):** No Content

**Usage in React:**
```javascript
import { useDeleteDiscountMutation } from '@/redux/features/discountsApi';

const [deleteDiscount, { isLoading }] = useDeleteDiscountMutation();

const handleDelete = async (id) => {
  try {
    await deleteDiscount(id).unwrap();
    console.log('Discount deleted');
  } catch (error) {
    console.error('Error deleting discount:', error);
  }
};
```

---

## Data Model

### Discount Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Уникальный идентификатор (read-only) |
| `percentage` | string (decimal) | Процент скидки (0-100) |
| `month_payment` | integer | Минимальная сумма покупок за месяц в копейках |

**Important Notes:**
- `month_payment` хранится в **копейках** (minor units)
- Для отображения в гривнах нужно делить на 100: `month_payment / 100`
- `percentage` - строка с десятичным числом, например "2.00", "4.50"

---

## Discounts Page Features

### 1. Milestone Progress Bar
Визуальный прогресс-бар с точками для каждого уровня скидки:
- Показывает текущую сумму покупок
- Отображает сколько осталось до следующего уровня
- Зеленые точки для достигнутых уровней
- Серые точки для недостигнутых уровней

### 2. Rules Section
Секция с правилами начисления скидок:
- Описание системы накопительных скидок
- Список всех уровней скидок с суммами
- Порядок начисления (ежемесячно, на весь каталог)
- Активные уровни выделены зеленым цветом

### 3. Discount Cards
Карточки для каждого уровня скидки:
- Процент скидки
- Необходимая сумма покупок
- Индивидуальный прогресс-бар
- Статус (доступна/заблокирована)

---

## Translations

Все тексты поддерживают 3 языка: **Ukrainian (uk)**, **Russian (ru)**, **English (en)**

### Available Translation Keys:
- `Discounts.page_title` - Заголовок страницы
- `Discounts.page_description` - Описание страницы
- `Discounts.rules_title` - Заголовок правил
- `Discounts.rules_intro` - Вступление к правилам
- `Discounts.rules_description` - Описание системы скидок
- `Discounts.rules_calculation_title` - Заголовок порядка начисления
- `Discounts.rules_calculation_monthly` - Ежемесячный расчет
- `Discounts.rules_calculation_all_products` - Скидка на весь каталог
- `Discounts.from` - "От"
- `Discounts.to` - "до"
- `Discounts.and_more` - "и более"

---

## Example: Complete Discounts Page Component

```javascript
'use client';
import { useGetDiscountsQuery } from '@/redux/features/discountsApi';
import { useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';

const DiscountsPage = () => {
  const t = useTranslations('Discounts');
  const { data: discounts, isLoading, isError } = useGetDiscountsQuery();
  const { user } = useSelector((state) => state.auth);
  
  const userTotalSpent = user?.total_spent || 0;
  
  // Clone and sort discounts (RTK Query data is frozen)
  const sortedDiscounts = (Array.isArray(discounts?.results) 
    ? [...discounts.results] 
    : []
  ).sort((a, b) => (a?.month_payment || 0) - (b?.month_payment || 0));
  
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading discounts</div>;
  
  return (
    <div>
      <h1>{t('page_title')}</h1>
      {/* Render discounts */}
    </div>
  );
};
```

---

## Notes

1. **Immutable Data**: RTK Query возвращает замороженные (frozen) объекты. Всегда создавайте копию перед сортировкой:
   ```javascript
   const sortedDiscounts = [...discounts.results].sort(...);
   ```

2. **Currency Conversion**: `month_payment` в копейках, конвертируйте в гривны:
   ```javascript
   const amountUAH = discount.month_payment / 100;
   ```

3. **Percentage Parsing**: `percentage` - строка, конвертируйте в число:
   ```javascript
   const percent = parseFloat(discount.percentage);
   ```

4. **User Total Spent**: Получайте из Redux state:
   ```javascript
   const { user } = useSelector((state) => state.auth);
   const userTotalSpent = user?.total_spent || 0;
   ```
