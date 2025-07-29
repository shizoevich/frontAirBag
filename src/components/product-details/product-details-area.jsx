'use client';
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import PrdDetailsLoader from "../loader/prd-details-loader";
import ErrorMsg from "../common/error-msg";
import ProductDetailsBreadcrumb from "../breadcrumb/product-details-breadcrumb";
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
      price: product.price ?? 0,
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
    const errorMsg = error?.data?.message || 
                   error?.error || 
                   "Failed to load product details";
    return <ErrorMsg msg={errorMsg} />;
  }

  // Продукт не найден
  if (!safeProduct) {
    return <ErrorMsg msg="Product not found" />;
  }

  // Успешная загрузка
  return (
    <>
      <ProductDetailsBreadcrumb 
        category={safeProduct.category.name} 
        title={safeProduct.title} 
      />
      <ProductDetailsContent productItem={safeProduct} />
    </>
  );
};

export default ProductDetailsArea;