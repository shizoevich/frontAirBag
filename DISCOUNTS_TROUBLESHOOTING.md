# Discounts Page Troubleshooting Guide

## Problem: Page Loading Forever

### Symptoms
- Discounts page shows loading spinner indefinitely
- Request to `https://api.airbagad.com/api/v2/discounts/` never completes
- No error message displayed

### Possible Causes & Solutions

#### 1. **API Endpoint Not Implemented**
**Check:** Does `/api/v2/discounts/` exist on your backend?

**Solution:**
```bash
# Test the endpoint directly
curl https://api.airbagad.com/api/v2/discounts/

# Or with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.airbagad.com/api/v2/discounts/
```

If you get 404, the endpoint doesn't exist. You need to:
- Implement the endpoint on your Django backend
- Or use mock data temporarily (see below)

---

#### 2. **CORS Issues**
**Check:** Browser console for CORS errors

**Solution:** Add to your Django settings:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://yourdomain.com",
]

CORS_ALLOW_CREDENTIALS = True
```

---

#### 3. **Authentication Required**
**Check:** Does the endpoint require authentication?

**Solution:** 
- If endpoint requires auth, make sure user is logged in
- Or make endpoint public in Django views:
```python
# views.py
from rest_framework.permissions import AllowAny

class DiscountViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]  # Allow unauthenticated access
```

---

#### 4. **Slow Server Response**
**Check:** Network tab in browser dev tools

**Solution:** Add timeout to RTK Query:
```javascript
// src/redux/api/apiSlice.js
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  // ...
});
```

---

## Temporary Solution: Use Mock Data

While debugging the API, you can use mock data:

### Option 1: Skip API Call When No Data
```javascript
// src/app/[locale]/discounts/page.jsx
const { data: discounts, isLoading, isError } = useGetDiscountsQuery(undefined, {
  skip: !user, // Skip if user not logged in
});
```

### Option 2: Use Mock Data
```javascript
// src/app/[locale]/discounts/page.jsx
const MOCK_DISCOUNTS = {
  count: 4,
  results: [
    { id: 1, percentage: "2.00", month_payment: 1000000 },  // 10,000 грн
    { id: 2, percentage: "4.00", month_payment: 2500000 },  // 25,000 грн
    { id: 3, percentage: "6.00", month_payment: 6400000 },  // 64,000 грн
    { id: 4, percentage: "8.00", month_payment: 13000000 }, // 130,000 грн
  ]
};

const DiscountsPage = () => {
  const { data: apiDiscounts, isLoading, isError } = useGetDiscountsQuery();
  
  // Use mock data if API fails
  const discounts = isError ? MOCK_DISCOUNTS : apiDiscounts;
  
  // ... rest of code
};
```

### Option 3: Conditional Rendering
```javascript
// Show message if API not ready
if (isError && error?.status === 404) {
  return (
    <div className="alert alert-warning">
      <h4>Discounts API Not Yet Implemented</h4>
      <p>The /discounts/ endpoint is not available on the server.</p>
      <p>Please implement it on your Django backend or contact your backend developer.</p>
    </div>
  );
}
```

---

## Django Backend Implementation Example

If you need to implement the endpoint on Django:

```python
# models.py
from django.db import models

class Discount(models.Model):
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    month_payment = models.IntegerField(help_text="Amount in minor units (kopecks)")
    
    class Meta:
        ordering = ['month_payment']

# serializers.py
from rest_framework import serializers

class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ['id', 'percentage', 'month_payment']

# views.py
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

class DiscountViewSet(viewsets.ModelViewSet):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer
    permission_classes = [AllowAny]

# urls.py
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'discounts', DiscountViewSet)

urlpatterns = [
    path('api/v2/', include(router.urls)),
]
```

---

## Quick Diagnostic Checklist

- [ ] API endpoint exists and returns 200
- [ ] CORS headers are configured
- [ ] Authentication works (if required)
- [ ] Response format matches expected structure
- [ ] No network errors in browser console
- [ ] Backend server is running
- [ ] Environment variables are set correctly

---

## Debug Commands

```bash
# Check if API is reachable
curl -I https://api.airbagad.com/api/v2/discounts/

# Check response body
curl https://api.airbagad.com/api/v2/discounts/

# Check with auth token
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.airbagad.com/api/v2/discounts/

# Check CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://api.airbagad.com/api/v2/discounts/
```

---

## Contact Backend Developer

If the issue persists, provide your backend developer with:
1. Expected API endpoint: `GET /api/v2/discounts/`
2. Expected response format (see DISCOUNTS_API_GUIDE.md)
3. This troubleshooting guide
4. Browser console errors
5. Network tab screenshot
