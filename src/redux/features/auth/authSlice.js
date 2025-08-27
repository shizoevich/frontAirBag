import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// Получаем данные пользователя из cookie при инициализации
const getUserFromCookies = () => {
  try {
    const userInfo = Cookies.get('userInfo');
    if (userInfo) {
      const parsedInfo = JSON.parse(userInfo);
      return {
        accessToken: parsedInfo.accessToken,
        user: parsedInfo.user || null,
        isGuest: parsedInfo.isGuest || false,
        guestId: parsedInfo.guestId || null
      };
    }
  } catch (error) {
    console.error('Error parsing user info from cookies:', error);
  }
  return {
    accessToken: null,
    user: null,
    isGuest: false,
    guestId: null
  };
};

const initialState = getUserFromCookies();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, { payload }) => {
      // Обновляем только те поля, которые присутствуют в payload
      if (payload.accessToken !== undefined) {
        state.accessToken = payload.accessToken;
      }
      if (payload.user !== undefined) {
        state.user = payload.user;
        // Если пользователь получен из API, проверяем is_guest флаг
        if (payload.user && payload.user.is_guest !== undefined) {
          state.isGuest = payload.user.is_guest;
        }
      }
      if (payload.isGuest !== undefined) {
        state.isGuest = payload.isGuest;
      }
      if (payload.guestId !== undefined) {
        state.guestId = payload.guestId;
      }
    },
    userLoggedOut: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isGuest = false;
      state.guestId = null;
      Cookies.remove('userInfo');
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
