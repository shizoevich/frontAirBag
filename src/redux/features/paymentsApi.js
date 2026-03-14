import { apiSlice } from "@/redux/api/apiSlice";

export const paymentsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createPayment: builder.mutation({
      query: ({ order_id, redirect_url, success_url, fail_url }) => ({
        url: "/payments/create/",
        method: "POST",
        body: {
          order_id,
          redirect_url,
          success_url,
          fail_url,
        },
      }),
    }),

    googlePay: builder.mutation({
      // Backend accepts Google Pay token as gToken.
      query: ({ gToken }) => ({
        url: "/payments/googlepay/",
        method: "POST",
        body: { gToken },
      }),
    }),
  }),
});

export const { useCreatePaymentMutation, useGooglePayMutation } = paymentsApi;
