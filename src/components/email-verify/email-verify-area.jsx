"use client";
import { useEffect } from "react";
import Wrapper from "@/layout/wrapper";
import ErrorMsg from "../common/error-msg";
import { useRouter } from "next/navigation";
import { useConfirmEmailQuery } from "@/redux/features/auth/authApi";
import { notifySuccess } from "@/utils/toast";

export default function EmailVerifyArea({ token }) {
  const router = useRouter();
  const { data, isLoading, isError, error, isSuccess } = useConfirmEmailQuery(token);

  useEffect(() => {
    if (isSuccess) {
      router.push("/");
      notifySuccess("Register Success!");
    }
  }, [router, isSuccess]);

  return (
    <Wrapper>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        {isLoading ? (
          <h3>Loading ....</h3>
        ) : isSuccess ? (
          <h2>{data?.message}</h2>
        ) : (
          <ErrorMsg msg={error?.data?.error} />
        )}
      </div>
    </Wrapper>
  );
}
