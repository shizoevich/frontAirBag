// Утилита для подавления предупреждений о гидратации, вызванных браузерными расширениями и Windsurf
export const suppressHydrationWarning = () => {
  if (typeof window !== 'undefined') {
    // Подавляем предупреждения о гидратации, связанные с браузерными расширениями и Windsurf
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (
          args[0].includes('Extra attributes from the server') ||
          args[0].includes('cz-shortcut-listen') ||
          args[0].includes('data-windsurf-page-id') ||
          args[0].includes('data-windsurf-extension-id') ||
          args[0].includes('A tree hydrated but some attributes of the server rendered HTML didn\'t match')
        )
      ) {
        return;
      }
      originalError(...args);
    };

    // Подавление предупреждений о несоответствии атрибутов
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (
          args[0].includes('Prop `') && args[0].includes('` did not match') ||
          args[0].includes('cz-shortcut-listen') ||
          args[0].includes('data-windsurf-page-id') ||
          args[0].includes('data-windsurf-extension-id')
        )
      ) {
        return;
      }
      originalWarn(...args);
    };
  }
};

// Функция для безопасной проверки клиентской среды
export const isClient = () => typeof window !== 'undefined';
