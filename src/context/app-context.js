'use client';

import { createContext, useContext, useState } from 'react';

// Создаем контекст приложения
const AppContext = createContext({
  sideMenuOpen: false,
  setSideMenuOpen: () => {},
  quickViewData: null,
  setQuickViewData: () => {},
});

// Провайдер контекста
export function AppProvider({ children }) {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [quickViewData, setQuickViewData] = useState(null);

  // Значения, которые будут доступны через контекст
  const value = {
    sideMenuOpen,
    setSideMenuOpen,
    quickViewData,
    setQuickViewData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Хук для использования контекста
export function useAppContext() {
  return useContext(AppContext);
}
