import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ContactBreadcrumb = () => {
  const pathname = usePathname();
  
  // Преобразуем путь в массив сегментов и удаляем пустые сегменты
  const pathSegments = pathname.split('/').filter(segment => segment);
  
  // Формируем хлебные крошки на основе сегментов пути
  const breadcrumbs = pathSegments.map((segment, index) => {
    // Формируем путь для текущего сегмента
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    
    // Преобразуем сегмент в читаемый формат (первая буква заглавная, подчеркивания заменяем на пробелы)
    const title = segment
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
    
    return { path, title };
  });
  
  return (
    <section className="breadcrumb__area include-bg text-center pt-95 pb-50">
      <div className="container">
        <div className="row">
          <div className="col-xxl-12">
            <div className="breadcrumb__content p-relative z-index-1">
              <h3 className="breadcrumb__title">
                {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].title : "Главная"}
              </h3>
              <div className="breadcrumb__list">
                <span>
                  <Link href="/">Главная</Link>
                </span>
                {breadcrumbs.map((breadcrumb, index) => (
                  <span key={index}>
                    {index < breadcrumbs.length - 1 ? (
                      <Link href={breadcrumb.path}>{breadcrumb.title}</Link>
                    ) : (
                      breadcrumb.title
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactBreadcrumb;
