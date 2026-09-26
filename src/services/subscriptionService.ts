import { baseApi } from "./baseApi";

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export type SubscriptionStatus = {
  required: boolean;
  amount: number | null;
  amountDue?: number | null;
  currency: string;
  interval: string;
  active: boolean;
  status: string;
  paidUntil: string | null;
  canCancel: boolean;
  termsVersion: string;
  mock?: boolean;
  approvalUrl?: string | null;
  coupon?: {
    code: string;
    amountWaived: number | null;
    freeUntil: string;
  } | null;
};

export type CouponPreview = {
  code: string;
  description: string;
  amountBefore: number;
  amountDue: number;
  percentOff: number;
  freeUntil: string;
};

export type UsageAllowance = {
  used: number;
  freeLimit: number;
  remaining: number;
  subscriptionRequired: boolean;
};

export type PayPalCardConfig = {
  clientId: string;
  planId: string;
  amount: number;
  currency: string;
  termsVersion: string;
  mode: string;
};

export const BETA_TERMS_VERSION = "2026-09-07";

export const MOCK_SUBSCRIPTIONS =
  import.meta.env.VITE_SUBSCRIPTION_MODE !== "paypal";

function unwrap<T>(response: ApiEnvelope<T>) {
  return response.data;
}

export const subscriptionService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscription: builder.query<SubscriptionStatus, void>({
      query: () => ({ url: "subscriptions/me", method: "GET" }),
      transformResponse: unwrap,
      providesTags: ["Subscription"],
    }),

    getBidAllowance: builder.query<UsageAllowance, void>({
      query: () => ({ url: "subscriptions/allowance/bid", method: "GET" }),
      transformResponse: unwrap,
      providesTags: ["Subscription"],
    }),

    refreshSubscription: builder.mutation<SubscriptionStatus, void>({
      query: () => ({ url: "subscriptions/refresh", method: "POST" }),
      transformResponse: unwrap,
      invalidatesTags: ["Subscription"],
    }),

    subscribePaypal: builder.mutation<
      SubscriptionStatus & { approvalUrl?: string | null },
      void
    >({
      query: () => ({
        url: "subscriptions/paypal",
        method: "POST",
        body: { termsVersion: BETA_TERMS_VERSION },
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Subscription"],
    }),

    getPayPalCardConfig: builder.query<PayPalCardConfig, void>({
      query: () => ({ url: "subscriptions/paypal/card-config", method: "GET" }),
      transformResponse: unwrap,
    }),

    confirmPayPalSubscription: builder.mutation<
      SubscriptionStatus,
      { subscriptionId: string }
    >({
      query: ({ subscriptionId }) => ({
        url: "subscriptions/paypal/confirm",
        method: "POST",
        body: { subscriptionId, termsVersion: BETA_TERMS_VERSION },
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Subscription"],
    }),

    mockCheckout: builder.mutation<SubscriptionStatus, void>({
      query: () => ({ url: "subscriptions/mock-checkout", method: "POST" }),
      transformResponse: unwrap,
      invalidatesTags: ["Subscription"],
    }),

    previewCoupon: builder.mutation<CouponPreview, string>({
      query: (code) => ({
        url: "subscriptions/coupon/preview",
        method: "POST",
        body: { code },
      }),
      transformResponse: unwrap,
    }),

    redeemCoupon: builder.mutation<SubscriptionStatus, string>({
      query: (code) => ({
        url: "subscriptions/coupon/redeem",
        method: "POST",
        body: { code },
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Subscription"],
    }),

    cancelSubscription: builder.mutation<SubscriptionStatus, void>({
      query: () => ({ url: "subscriptions/cancel", method: "POST" }),
      transformResponse: unwrap,
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetSubscriptionQuery,
  useGetBidAllowanceQuery,
  useRefreshSubscriptionMutation,
  useSubscribePaypalMutation,
  useGetPayPalCardConfigQuery,
  useConfirmPayPalSubscriptionMutation,
  useMockCheckoutMutation,
  usePreviewCouponMutation,
  useRedeemCouponMutation,
  useCancelSubscriptionMutation,
} = subscriptionService;
