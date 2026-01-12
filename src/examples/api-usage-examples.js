// Примеры использования новых API endpoints
// Этот файл содержит примеры того, как использовать созданные API в компонентах

import React from 'react';
import {
  // Auth API
  useLoginMutation,
  useRefreshTokenMutation,
  useVerifyTokenMutation,
} from '../redux/features/authApi';

import {
  // Cart API
  useGetCartsQuery,
  useGetCartByIdQuery,
  useCreateCartMutation,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} from '../redux/features/cartApi';

import {
  // Orders API
  useGetOrdersQuery,
  useCreateOrderMutation,
  useGetOrderItemsQuery,
} from '../redux/features/ordersApi';

import {
  // Clients API
  useGetClientsQuery,
  useCreateClientMutation,
  useGetClientUpdatesQuery,
} from '../redux/features/clientsApi';

import {
  // Discounts API
  useGetDiscountsQuery,
  useApplyDiscountMutation,
} from '../redux/features/discountsApi';

// Пример компонента для аутентификации
export const LoginExample = () => {
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async (credentials) => {
    try {
      const result = await login(credentials).unwrap();
      console.log('Login successful:', result);
      // Сохранить токены в localStorage или cookies
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div>
      <button 
        onClick={() => handleLogin({ username: 'user', password: 'pass' })}
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

// Пример компонента для работы с корзиной
export const CartExample = () => {
  const { data: carts, isLoading } = useGetCartsQuery();
  const [addToCart] = useAddCartItemMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveCartItemMutation();

  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      await addToCart({
        cart: 1, // ID корзины
        product: productId,
        quantity: quantity
      }).unwrap();
      console.log('Product added to cart');
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await updateCartItem({
        id: itemId,
        quantity: newQuantity
      }).unwrap();
      console.log('Cart item updated');
    } catch (err) {
      console.error('Failed to update cart item:', err);
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      await removeFromCart(itemId).unwrap();
      console.log('Item removed from cart');
    } catch (err) {
      console.error('Failed to remove from cart:', err);
    }
  };

  if (isLoading) return <div>Loading carts...</div>;

  return (
    <div>
      <h3>Carts ({carts?.length || 0})</h3>
      <button onClick={() => handleAddToCart(1, 2)}>
        Add Product to Cart
      </button>
      <button onClick={() => handleUpdateQuantity(1, 3)}>
        Update Cart Item
      </button>
      <button onClick={() => handleRemoveFromCart(1)}>
        Remove from Cart
      </button>
    </div>
  );
};

// Пример компонента для работы с заказами
export const OrdersExample = () => {
  const { data: orders, isLoading } = useGetOrdersQuery();
  const [createOrder] = useCreateOrderMutation();

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        client: 1, // ID клиента
        status: 'pending',
        total_amount: 100.00
      };
      
      const result = await createOrder(orderData).unwrap();
      console.log('Order created:', result);
    } catch (err) {
      console.error('Failed to create order:', err);
    }
  };

  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div>
      <h3>Orders ({orders?.length || 0})</h3>
      <button onClick={handleCreateOrder}>
        Create New Order
      </button>
      {orders?.map(order => (
        <div key={order.id}>
          Order #{order.id} - Status: {order.status}
        </div>
      ))}
    </div>
  );
};

// Пример компонента для работы со скидками
export const DiscountsExample = () => {
  const { data: discounts, isLoading } = useGetDiscountsQuery();
  const [applyDiscount] = useApplyDiscountMutation();

  const handleApplyDiscount = async (discountId, targetId) => {
    try {
      await applyDiscount({
        discountId,
        targetId,
        targetType: 'order' // или 'cart'
      }).unwrap();
      console.log('Discount applied successfully');
    } catch (err) {
      console.error('Failed to apply discount:', err);
    }
  };

  if (isLoading) return <div>Loading discounts...</div>;

  return (
    <div>
      <h3>Available Discounts</h3>
      {discounts?.map(discount => (
        <div key={discount.id}>
          <span>{discount.name} - {discount.percentage}%</span>
          <button onClick={() => handleApplyDiscount(discount.id, 1)}>
            Apply to Order
          </button>
        </div>
      ))}
    </div>
  );
};

// Пример компонента для работы с клиентами
export const ClientsExample = () => {
  const { data: clients, isLoading } = useGetClientsQuery();
  const [createClient] = useCreateClientMutation();

  const handleCreateClient = async () => {
    try {
      const clientData = {
        name: 'New Client',
        email: 'client@example.com',
        phone: '+38 098 998 9828'
      };
      
      const result = await createClient(clientData).unwrap();
      console.log('Client created:', result);
    } catch (err) {
      console.error('Failed to create client:', err);
    }
  };

  if (isLoading) return <div>Loading clients...</div>;

  return (
    <div>
      <h3>Clients ({clients?.length || 0})</h3>
      <button onClick={handleCreateClient}>
        Create New Client
      </button>
      {clients?.map(client => (
        <div key={client.id}>
          {client.name} - {client.email}
        </div>
      ))}
    </div>
  );
};
