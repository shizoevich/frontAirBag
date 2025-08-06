import { NextResponse } from 'next/server';

const defaultLocale = 'uk'; // Украинский как язык по умолчанию
const locales = ['uk', 'ru', 'en']; // Поддерживаемые языки

// Функция для проверки, является ли путь публичным (не требующим локализации)
function isPublicPath(path) {
  // Публичные пути, которые не требуют перенаправления
  const publicPaths = [
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/api/',
    '/_next/',
    '/assets/',
    '/public/'
  ];
  
  return publicPaths.some(publicPath => path.startsWith(publicPath));
}

export function middleware(request) {
  // Получаем текущий путь
  const pathname = request.nextUrl.pathname;
  
  // Если путь публичный, пропускаем его без изменений
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Проверяем, содержит ли URL уже локаль
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // Если локаль уже указана в URL, пропускаем запрос
  if (pathnameHasLocale) {
    return NextResponse.next();
  }
  
  // Если локаль не указана, перенаправляем на URL с локалью по умолчанию
  const newUrl = new URL(`/${defaultLocale}${pathname}`, request.url);
  
  // Копируем все параметры запроса в новый URL
  request.nextUrl.searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });
  
  return NextResponse.redirect(newUrl);
}

// Указываем, для каких путей должен срабатывать middleware
export const config = {
  matcher: [
    // Исключаем все статические ресурсы
    '/((?!api|_next/static|_next/image|favicon.ico|assets|public).*)',
  ],
};
