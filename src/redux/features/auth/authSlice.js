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
        user: parsedInfo.user || undefined
      };
    }
  } catch (error) {
    console.error('Error parsing user info from cookies:', error);
  }
  return {
    accessToken: undefined,
    user: undefined
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
      }
    },
    userLoggedOut: (state) => {
      state.accessToken = undefined;
      state.user = undefined;
      Cookies.remove('userInfo');
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
