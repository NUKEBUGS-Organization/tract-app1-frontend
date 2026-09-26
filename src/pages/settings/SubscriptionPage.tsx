import { useState } from "react";
import { Link } from "react-router";
import { usePartnerTheme } from "../../hooks/usePartnerTheme";
import {
  BETA_TERMS_VERSION,
  MOCK_SUBSCRIPTIONS,
  useCancelSubscriptionMutation,
  useGetSubscriptionQuery,
  useMockCheckoutMutation,
  usePreviewCouponMutation,
  useRedeemCouponMutation,
  useRefreshSubscriptionMutation,
  useSubscribePaypalMutation,
} from "../../services/subscriptionService";
import PayPalCardSubscriptionButton from "../../components/payments/PayPalCardSubscriptionButton";

function errorTextOf(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "object" && "data" in error) {
    const message = (error as { data?: { message?: string | string[] } }).data
      ?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (message) return message;
  }
  return error instanceof Error ? error.message : "Request failed";
}

function CouponForm({ amount }: { amount: number | null }) {
  const [code, setCode] = useState("");
  const [previewCoupon, previewState] = usePreviewCouponMutation();
  const [redeemCoupon, redeemState] = useRedeemCouponMutation();
  const quoted = previewState.data;
  const matchesTyped = quoted && quoted.code === code.trim().toUpperCase();
  const errorText = errorTextOf(previewState.error || redeemState.error);

  return (
    <div className="space-y-3 rounded-xl border border-[var(--color-border-light)] p-4">
      <label htmlFor="coupon-code" className="block text-sm font-bold">
        Have a coupon code?
      </label>
      <p className="text-sm text-[var(--color-text-muted)]">
        Beta testers can waive the subscription fee entirely.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          id="coupon-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            previewState.reset();
            redeemState.reset();
          }}
          placeholder="COUPON123"
          autoComplete="off"
          spellCheck={false}
          maxLength={32}
          className="min-w-0 flex-1 rounded-lg border border-[var(--color-border-light)] px-3 py-2 font-mono uppercase tracking-wider"
        />
        <button
          type="button"
          disabled={!code.trim() || previewState.isLoading || redeemState.isLoading}
          onClick={() => previewCoupon(code.trim())}
          className="rounded-lg border border-[var(--color-border-light)] px-4 py-2 disabled:opacity-50"
        >
          {previewState.isLoading ? "Checking…" : "Apply"}
        </button>
      </div>

      {matchesTyped ? (
        <div role="status" className="space-y-2">
          <p className="text-sm">
            <span className="font-bold">{quoted.code}</span> applied —{" "}
            <span className="text-[var(--color-text-muted)] line-through">
              ${quoted.amountBefore}
            </span>{" "}
            <span className="font-bold">${quoted.amountDue}</span> / month,
            free through {new Date(quoted.freeUntil).toLocaleDateString()}.
          </p>
          <button
            type="button"
            disabled={redeemState.isLoading}
            onClick={() => redeemCoupon(quoted.code)}
            className="rounded-lg bg-[var(--color-secondary)] px-5 py-3 text-[var(--color-primary-dark)] disabled:opacity-50"
          >
            {redeemState.isLoading
              ? "Redeeming…"
              : `Redeem — pay $${quoted.amountDue} today`}
          </button>
        </div>
      ) : null}

      {amount !== null && !matchesTyped && !errorText ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          Without a coupon you will be billed ${amount}/month.
        </p>
      ) : null}
      {errorText ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}

export default function SubscriptionPage() {
  const theme = usePartnerTheme();
  const { data: status, isLoading, error, refetch } = useGetSubscriptionQuery();
  const [subscribePaypal, paypalState] = useSubscribePaypalMutation();
  const [mockCheckout, mockState] = useMockCheckoutMutation();
  const [refresh, refreshState] = useRefreshSubscriptionMutation();
  const [cancel, cancelState] = useCancelSubscriptionMutation();
  const [accepted, setAccepted] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const pending =
    paypalState.isLoading ||
    mockState.isLoading ||
    refreshState.isLoading ||
    cancelState.isLoading;

  const err =
    error ||
    paypalState.error ||
    mockState.error ||
    refreshState.error ||
    cancelState.error;

  const errorText =
    err && typeof err === "object" && "data" in err
      ? String(
          (err as { data?: { message?: string | string[] } }).data?.message ??
            "Request failed",
        )
      : null;
  const isDark = theme === "dark";
  const eyebrowClass = isDark
    ? "text-white/50"
    : "text-[var(--color-text-muted)]";
  const headingClass = isDark
    ? "text-white"
    : "text-[var(--color-primary)]";
  const mutedClass = isDark
    ? "text-white/60"
    : "text-[var(--color-text-muted)]";

  const onSubscribe = async () => {
    if (MOCK_SUBSCRIPTIONS) {
      await mockCheckout().unwrap();
      return;
    }
    const result = await subscribePaypal().unwrap();
    const url = result.approvalUrl;
    if (url) {
      const parsed = new URL(url);
      if (
        parsed.protocol !== "https:" ||
        ![
          "www.paypal.com",
          "www.sandbox.paypal.com",
          "paypal.com",
          "sandbox.paypal.com",
        ].includes(parsed.hostname)
      ) {
        throw new Error("Invalid PayPal approval URL");
      }
      window.location.assign(url);
    } else {
      await refetch();
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${eyebrowClass}`}>
          Billing
        </p>
        <h1 className={`font-serif text-3xl font-black ${headingClass}`}>
          SaaS subscription
        </h1>
        <p className={`mt-2 text-sm ${mutedClass}`}>
          Shared with Buy TRACT — pay once, status applies in both apps.
          Terms version {BETA_TERMS_VERSION}.
        </p>
      </div>

      <section className="space-y-4 rounded-3xl border border-[var(--color-border-light)] bg-white p-6 text-[var(--color-text-main)] shadow-[var(--shadow-card)]">
        {isLoading ? (
          <p>Checking subscription…</p>
        ) : status?.required === false ? (
          <p>Your role does not require a subscription.</p>
        ) : (
          <>
            {MOCK_SUBSCRIPTIONS && (
              <p className="text-sm text-[var(--color-text-muted)]">
                Test checkout — no PayPal charge. Set{" "}
                <code>VITE_SUBSCRIPTION_MODE=paypal</code> for live billing.
              </p>
            )}
            {status && (
              <p className="text-2xl font-semibold text-[var(--color-primary)]">
                {status.coupon ? (
                  <>
                    <span className="text-[var(--color-text-muted)] line-through">
                      ${status.amount}
                    </span>{" "}
                    $0
                  </>
                ) : (
                  <>${status.amount}</>
                )}
                <span className="text-sm font-normal"> USD / month</span>
              </p>
            )}
            <p className="text-sm text-[var(--color-text-main)]">
              Partners get 10 free lifetime bids, then need an active
              subscription. Contract signing also requires an active
              subscription. Sellers are not charged.
            </p>
            {status?.active ? (
              <p role="status">
                {status.coupon
                  ? `Coupon ${status.coupon.code} applied — free access through `
                  : MOCK_SUBSCRIPTIONS
                    ? "Paid (test). Access through "
                    : "Paid access through "}
                {status.paidUntil
                  ? new Date(status.paidUntil).toLocaleDateString()
                  : "—"}
                {status.status === "CANCELLED" ? ". Renewal cancelled." : "."}
              </p>
            ) : (
              <>
                {!MOCK_SUBSCRIPTIONS && (
                  <label className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      I agree to monthly recurring billing and the
                      non-refundable subscription terms in the{" "}
                      <Link className="underline" to="/auth/terms" target="_blank">
                        Terms of Service
                      </Link>
                      .
                    </span>
                  </label>
                )}
                {MOCK_SUBSCRIPTIONS ? (
                  <button
                    type="button"
                    disabled={pending || !status}
                    onClick={onSubscribe}
                    className="rounded-xl bg-[var(--color-secondary)] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary-dark)] disabled:opacity-50"
                  >
                    {pending ? "Updating…" : "Activate test subscription"}
                  </button>
                ) : (
                  <>
                    <PayPalCardSubscriptionButton disabled={!accepted || pending || !status} />
                    <button
                      type="button"
                      disabled={!accepted || pending || !status}
                      onClick={onSubscribe}
                      className="text-sm underline disabled:opacity-50"
                    >
                      {pending ? "Opening PayPal…" : "Use PayPal account instead"}
                    </button>
                  </>
                )}
                <CouponForm amount={status?.amount ?? null} />
              </>
            )}
            <button
              type="button"
              onClick={() => refresh()}
              disabled={pending}
              className="ml-0 text-sm underline"
            >
              Check payment status
            </button>
            {status?.canCancel && (
              <div className="pt-2">
                {confirmCancel ? (
                  <>
                    <p className="text-sm">
                      Cancel future renewals? Paid access remains until its end
                      date.
                    </p>
                    <button
                      type="button"
                      className="mr-4 underline"
                      disabled={pending}
                      onClick={() => cancel()}
                    >
                      Confirm cancellation
                    </button>
                    <button type="button" onClick={() => setConfirmCancel(false)}>
                      Keep subscription
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="text-sm underline"
                    onClick={() => setConfirmCancel(true)}
                  >
                    {MOCK_SUBSCRIPTIONS
                      ? "Reset test payment"
                      : "Cancel renewal"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
        {errorText && (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {errorText}
          </p>
        )}
      </section>
    </div>
  );
}
