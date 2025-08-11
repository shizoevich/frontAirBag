import { createSlice } from "@reduxjs/toolkit";
import { getLocalStorage, setLocalStorage } from "@/utils/localstorage";
import { notifyError, notifySuccess } from "@/utils/toast";

const initialState = {
  cart_products: [],
  orderQuantity: 1,
  cartMiniOpen:false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    add_cart_product: (state, { payload }) => {
      // Use id or _id for product identification (normalize field)
      const productId = payload.id || payload._id;
      // Получаем доступное количество товара (residue)
      const availableQuantity = payload.residue || 0;
      
      // Если товара нет в наличии, показываем ошибку
      if (availableQuantity <= 0) {
        notifyError("Товар отсутствует на складе!");
        return;
      }
      
      // Find product in cart
      const existingIndex = state.cart_products.findIndex((i) => (i.id || i._id) === productId);
      
      if (existingIndex === -1) {
        // Проверяем, не превышает ли заказываемое количество доступное
        if (state.orderQuantity <= availableQuantity) {
          // Add new product
          const newItem = {
            ...payload,
            id: productId, // ensure id field always present
            orderQuantity: state.orderQuantity,
          };
          state.cart_products.push(newItem);
          notifySuccess(`${state.orderQuantity} ${payload.title} добавлено в корзину`);
        } else {
          notifyError(`Доступно только ${availableQuantity} шт. товара!`);
        }
      } else {
        // Increment quantity for existing product
        const item = state.cart_products[existingIndex];
        
        // Проверяем, не превышает ли итоговое количество доступное
        if ((item.orderQuantity + state.orderQuantity) <= availableQuantity) {
          item.orderQuantity += state.orderQuantity;
          notifySuccess(`${state.orderQuantity} ${item.title} добавлено в корзину`);
        } else {
          notifyError(`В корзине уже ${item.orderQuantity} шт. Доступно всего ${availableQuantity} шт.`);
        }
      }
      setLocalStorage("cart_products", state.cart_products);
    },
    increment: (state, { payload }) => {
      state.orderQuantity = state.orderQuantity + 1;
    },
    decrement: (state, { payload }) => {
      state.orderQuantity =
        state.orderQuantity > 1
          ? state.orderQuantity - 1
          : (state.orderQuantity = 1);
    },
    setQuantity: (state, { payload }) => {
      // Устанавливает конкретное значение количества
      state.orderQuantity = payload > 0 ? payload : 1;
    },
    quantityIncrement: (state, { payload }) => {
      const productId = payload.id || payload._id;
      state.cart_products = state.cart_products.map((item) => {
        const itemId = item.id || item._id;
        if (itemId === productId) {
          // Используем residue вместо quantity для ограничения
          const maxQty = item.residue || 0;
          if (maxQty > item.orderQuantity) {
            item.orderQuantity = item.orderQuantity + 1;
            notifySuccess(`Количество ${item.title} увеличено`);
          } else {
            notifyError(`Доступно только ${maxQty} шт. товара!`);
          }
        }
        return { ...item };
      });
      setLocalStorage("cart_products", state.cart_products);
    },
    quantityDecrement: (state, { payload }) => {
      const productId = payload.id || payload._id;
      state.cart_products = state.cart_products.map((item) => {
        const itemId = item.id || item._id;
        if (itemId === productId) {
          if (item.orderQuantity > 1) {
            item.orderQuantity = item.orderQuantity - 1;
            notifySuccess(`Количество ${item.title} уменьшено`);
          } else {
            notifyError("Минимальное количество: 1");
          }
        }
        return { ...item };
      });
      setLocalStorage("cart_products", state.cart_products);
    },
    remove_product: (state, { payload }) => {
      const productId = payload.id;
      state.cart_products = state.cart_products.filter((item) => {
        const itemId = item.id || item._id;
        return itemId !== productId;
      });
      setLocalStorage("cart_products", state.cart_products);
      notifyError(`${payload.title} Remove from cart`);
    },
    get_cart_products: (state, action) => {
      state.cart_products = getLocalStorage("cart_products");
    },
    initialOrderQuantity: (state, { payload }) => {
      state.orderQuantity = 1;
    },
    clearCart:(state) => {
      const isClearCart = window.confirm('Are you sure you want to remove all items ?');
      if(isClearCart){
        state.cart_products = []
      }
      setLocalStorage("cart_products", state.cart_products);
    },
    openCartMini:(state,{payload}) => {
      state.cartMiniOpen = true
    },
    closeCartMini:(state,{payload}) => {
      state.cartMiniOpen = false
    },
  },
});

export const {
  add_cart_product,
  increment,
  decrement,
  setQuantity,
  get_cart_products,
  remove_product,
  quantityIncrement,
  quantityDecrement,
  initialOrderQuantity,
  clearCart,
  openCartMini,
  closeCartMini,
} = cartSlice.actions;
export default cartSlice.reducer;
