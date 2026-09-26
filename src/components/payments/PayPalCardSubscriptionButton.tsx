import { useEffect, useRef, useState } from "react";
import {
  useConfirmPayPalSubscriptionMutation,
  useGetPayPalCardConfigQuery,
} from "../../services/subscriptionService";
import { useAuthContext } from "../../contexts/AuthContext";

declare global {
  interface Window {
    paypal?: {
      FUNDING?: { CARD?: string };
      Buttons?: (options: Record<string, unknown>) => {
        render: (target: HTMLElement) => Promise<void>;
      };
    };
  }
}

function loadPayPalSdk(clientId: string, currency: string) {
  const id = "paypal-card-subscription-sdk";
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      if (window.paypal?.Buttons) resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load PayPal card checkout.")), { once: true });
    });
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&vault=true&intent=subscription&currency=${encodeURIComponent(currency)}&components=buttons&enable-funding=card&disable-funding=paypal,venmo,paylater`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load PayPal card checkout."));
    document.body.appendChild(script);
  });
}

export default function PayPalCardSubscriptionButton({ disabled }: { disabled?: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const { data: config } = useGetPayPalCardConfigQuery(undefined, { skip: disabled });
  const [confirmSubscription] = useConfirmPayPalSubscriptionMutation();

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (disabled || renderedRef.current || !containerRef.current || !config) return;
      try {
        setLoading(true);
        await loadPayPalSdk(config.clientId, config.currency);
        if (cancelled || !containerRef.current || !window.paypal?.Buttons) return;
        renderedRef.current = true;
        await window.paypal.Buttons({
          fundingSource: window.paypal.FUNDING?.CARD,
          style: { layout: "vertical", label: "pay", tagline: false },
          createSubscription: (_data: unknown, actions: any) =>
            actions.subscription.create({ plan_id: config.planId, custom_id: (user as { _id?: string; id?: string } | null)?._id || (user as { id?: string } | null)?.id }),
          onApprove: async (data: { subscriptionID?: string }) => {
            if (!data.subscriptionID) throw new Error("PayPal did not return a subscription ID.");
            await confirmSubscription({ subscriptionId: data.subscriptionID }).unwrap();
          },
          onError: (err: unknown) => {
            setError(err instanceof Error ? err.message : "Card checkout failed. Please retry.");
          },
        }).render(containerRef.current);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Card checkout is unavailable. Please retry.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void render();
    return () => { cancelled = true; };
  }, [config, confirmSubscription, disabled, user]);

  return (
    <div className="space-y-2">
      {loading && !disabled ? <p className="text-sm text-[var(--color-text-muted)]">Loading secure card checkout…</p> : null}
      <div ref={containerRef} />
      {error ? <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p> : null}
    </div>
  );
}
