'use client';
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PrdDetailsLoader from "../loader/prd-details-loader";
import ErrorMsg from "../common/error-msg";
import { useGetProductByIdQuery } from "@/redux/features/productsApi";
import ProductDetailsContent from "./product-details-content";

const ProductDetailsArea = ({ id }) => {
  const router = useRouter();

  const { 
    data: product, 
    isLoading, 
    isError, 
    error,
    isFetching 
  } = useGetProductByIdQuery(id, {
    skip: !id, // Пропускаем запрос если нет ID
  });

  // Перенаправляем если нет ID
  useEffect(() => {
    if (!id) {
      router.push('/not-found');
    }
  }, [id, router]);

  // Проверка и нормализация данных
  const safeProduct = React.useMemo(() => {
    if (!product) return null;
    
    return {
      ...product,
      id: product.id || id, // Сохраняем оригинальный ID если нет в ответе
      category: product.category || { id: '0', name: 'Uncategorized' },
      title: product.title || 'No title',
      // Добавляем дефолтные значения для обязательных полей
      price_minor: product.price_minor ?? 0,
      images: product.images || [],
      description: product.description || '',
    };
  }, [product, id]);

  // Состояния загрузки
  if (!id || isLoading || isFetching) {
    return <PrdDetailsLoader loading />;
  }

  // Обработка ошибок
  if (isError) {
    // Проверяем тип ошибки для более понятного сообщения
    if (error?.status === 404) {
      return (
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-product-details-area pt-80 pb-80">
                <div className="text-center">
                  <h3>Товар не найден</h3>
                  <p>К сожалению, запрашиваемый товар не найден в нашем каталоге.</p>
                  <Link href="/shop" className="tp-btn mt-20">Перейти в каталог</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    const errorMsg = error?.data?.message || 
                   error?.error || 
                   "Произошла ошибка при загрузке товара";
    return <ErrorMsg msg={errorMsg} />;
  }

  // Продукт не найден
  if (!safeProduct) {
    return <ErrorMsg msg="Товар не найден" />;
  }

  // Успешная загрузка
  return (
    <>
      <ProductDetailsContent productItem={safeProduct} />
    </>
  );
};

export default ProductDetailsArea;