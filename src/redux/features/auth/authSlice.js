import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { getAuth } from "@/utils/authStorage";

// Источник правды — localStorage; cookie лишь зеркало для тех окружений, где
// localStorage недоступен. Гостей больше нет (ADR-0021): состояние — либо
// сессия аккаунта, либо аноним.
const getUserFromStorage = () => {
  try {
    const localStorageData = getAuth();
    if (localStorageData && localStorageData.accessToken) {
      return {
        accessToken: localStorageData.accessToken,
        user: localStorageData.user || null,
      };
    }

    const userInfo = Cookies.get('userInfo');
    if (userInfo) {
      const parsedInfo = JSON.parse(userInfo);
      if (parsedInfo?.accessToken) {
        return {
          accessToken: parsedInfo.accessToken,
          user: parsedInfo.user || null,
        };
      }
    }
  } catch (error) {
    console.error('Error parsing user info from storage:', error);
  }

  return {
    accessToken: null,
    user: null,
  };
};

const initialState = getUserFromStorage();

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
      state.accessToken = null;
      state.user = null;
      Cookies.remove('userInfo');
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('userInfo');
        } catch {
          // хранилище недоступно — нечего чистить
        }
      }
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
