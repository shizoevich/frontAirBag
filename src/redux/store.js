import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authSlice from "./features/auth/authSlice";
import cartSlice from "./features/cartSlice";
import compareSlice from "./features/compareSlice";
import productModalSlice from "./features/productModalSlice";
import shopFilterSlice from "./features/shop-filter-slice";
import couponSlice from "./features/coupon/couponSlice";
import orderSlice from "./features/order/orderSlice";
import { authMiddleware } from "./middleware/authMiddleware";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth:authSlice,
    productModal:productModalSlice,
    shopFilter:shopFilterSlice,
    cart:cartSlice,
    compare:compareSlice,
    coupon:couponSlice,
    order:orderSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .prepend(authMiddleware.middleware),
});

export default store;
export { store };
