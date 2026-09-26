import { useState } from "react";
import { Link } from "react-router";
import {
  BETA_TERMS_VERSION,
  MOCK_SUBSCRIPTIONS,
  useCancelSubscriptionMutation,
  useGetSubscriptionQuery,
  useMockCheckoutMutation,
  useRefreshSubscriptionMutation,
  useSubscribePaypalMutation,
} from "../../services/subscriptionService";
import PayPalCardSubscriptionButton from "../../components/payments/PayPalCardSubscriptionButton";

export default function SubscriptionPage() {
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
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
          Billing
        </p>
        <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
          SaaS subscription
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Shared with Buy TRACT — pay once, status applies in both apps.
          Terms version {BETA_TERMS_VERSION}.
        </p>
      </div>

      <section className="space-y-4 rounded-3xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
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
                ${status.amount}
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
                {MOCK_SUBSCRIPTIONS
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
