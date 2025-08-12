'use client';
import React from "react";
import Image from "next/image";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
// internal
import google_icon from "@assets/img/icon/login/google.svg";
// Удаляем неиспользуемый импорт, который вызывает ошибку
import { notifyError, notifySuccess } from "@/utils/toast";

const GoogleSignUp = () => {
  const router = useRouter();
  
  // handleGoogleSignIn
  const handleGoogleSignIn = (user) => {
    if (user) {
      // Временно отключаем функциональность Google Sign-In
      // пока не будет реализован соответствующий API endpoint
      console.log("Google Sign-In credential:", user?.credential);
      notifySuccess("Google Sign-In functionality will be implemented soon");
      // router.push('/checkout');
    }
  };
  return (
    <GoogleLogin
      render={(renderProps) => (
        <a
          className="cursor-pointer"
          onClick={renderProps.onClick}
          disabled={renderProps.disabled}
        >
          <Image src={google_icon} alt="google_icon" />
          Sign in with google
        </a>
      )}
      onSuccess={handleGoogleSignIn}
      onFailure={(err) =>
        notifyError(err?.message || "Something wrong on your auth setup!")
      }
      cookiePolicy={"single_host_origin"}
    />
  );
};

export default GoogleSignUp;
