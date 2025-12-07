import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { getAuth } from "@/utils/authStorage";

// Получаем данные пользователя из localStorage (приоритет) или cookie
const getUserFromStorage = () => {
  try {
    // Сначала пробуем localStorage
    const localStorageData = getAuth();
    if (localStorageData && localStorageData.accessToken) {
      console.log('🔄 AuthSlice: Loading from localStorage:', localStorageData);
      return {
        accessToken: localStorageData.accessToken,
        user: localStorageData.user || null,
        isGuest: localStorageData.isGuest || false,
        guestId: localStorageData.guestId || null
      };
    }
    
    // Fallback на cookies
    const userInfo = Cookies.get('userInfo');
    if (userInfo) {
      const parsedInfo = JSON.parse(userInfo);
      console.log('🔄 AuthSlice: Loading from cookies:', parsedInfo);
      return {
        accessToken: parsedInfo.accessToken,
        user: parsedInfo.user || null,
        isGuest: parsedInfo.isGuest || false,
        guestId: parsedInfo.guestId || null
      };
    }
  } catch (error) {
    console.error('Error parsing user info from storage:', error);
  }
  
  console.log('🔄 AuthSlice: No auth data found, using empty state');
  return {
    accessToken: null,
    user: null,
    isGuest: false,
    guestId: null
  };
};

const initialState = getUserFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, { payload }) => {
      console.log('✅ AuthSlice: userLoggedIn called with payload:', payload);
      
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
      
      console.log('✅ AuthSlice: New state after userLoggedIn:', {
        accessToken: !!state.accessToken,
        user: state.user,
        isGuest: state.isGuest,
        guestId: state.guestId
      });
    },
    userLoggedOut: (state) => {
      console.log('🚪 AuthSlice: userLoggedOut called');
      state.accessToken = null;
      state.user = null;
      state.isGuest = false;
      state.guestId = null;
      Cookies.remove('userInfo');
      // Также очищаем localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo');
      }
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
