import "@jumio/websdk";
import { useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  FileCheck2,
  Loader2,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import Button from "../../components/common/Button";
import { useInitiateKycMutation } from "../../services/authService";

type JumioDataCenter = "us" | "eu" | "sgp";

function getKycToken(response: any) {
  if (typeof response === "string") {
    return response;
  }

  return (
    response?.data?.kyc_access_token ||
    null
  );
}

function getKycDataCenter(): JumioDataCenter {
  return "us";
}

export default function KycPage() {
  const [initiateKyc, { isLoading }] = useInitiateKycMutation();

  const [sdkToken, setSdkToken] = useState<string | null>(null);
  const [dataCenter, setDataCenter] = useState<JumioDataCenter>("us");
  const [apiError, setApiError] = useState<string | null>(null);

  const handleStartKyc = async () => {
    try {
      setApiError(null);

      const response = await initiateKyc().unwrap();

      const token = getKycToken(response);
      const dc = getKycDataCenter();

      if (!token) {
        setApiError("KYC token was not returned by backend.");
        return;
      }

      setSdkToken(token);
      setDataCenter(dc);
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.data?.error ||
        error?.error ||
        "Unable to start KYC. Please try again.";

      setApiError(message);
    }
  };

  const handleRestartSession = () => {
    setSdkToken(null);
    setApiError(null);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8a6a00]">
              <ShieldCheck className="h-4 w-4" />
              Identity Verification
            </div>

            <h1 className="font-serif text-3xl font-black text-[var(--color-primary)] lg:text-4xl">
              Complete your KYC verification
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
              Start the secure Jumio verification session. You may be asked to
              scan your ID document and complete face verification.
            </p>
          </div>

          {!sdkToken && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleStartKyc}
              isLoading={isLoading}
              loadingText="Starting KYC..."
              className="px-7 py-4 text-xs uppercase tracking-[0.2em]"
            >
              Start KYC
            </Button>
          )}

          {sdkToken && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRestartSession}
              className="px-7 py-4 text-xs uppercase tracking-[0.2em]"
            >
              <RefreshCcw className="h-4 w-4" />
              Restart
            </Button>
          )}
        </div>

        {apiError && (
          <div className="mt-6 rounded-[var(--radius-input)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-medium text-[var(--color-danger)]">
            {apiError}
          </div>
        )}
      </section>

      {!sdkToken && (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <FileCheck2 className="mb-4 h-7 w-7 text-[var(--color-secondary)]" />
            <h3 className="font-bold text-[var(--color-text-main)]">
              Prepare your ID
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Use a valid government-issued document for verification.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <BadgeCheck className="mb-4 h-7 w-7 text-[var(--color-secondary)]" />
            <h3 className="font-bold text-[var(--color-text-main)]">
              Complete face check
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Jumio may ask for a selfie or face verification step.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <CheckCircle2 className="mb-4 h-7 w-7 text-[var(--color-secondary)]" />
            <h3 className="font-bold text-[var(--color-text-main)]">
              Wait for status
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Jumio sends the result to backend through webhook/callback.
            </p>
          </div>
        </section>
      )}

      {sdkToken && (
        <section className="overflow-hidden rounded-[28px] border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-[var(--color-text-main)]">
                  Jumio Verification Session
                </h2>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Data center: {dataCenter.toUpperCase()}
                </p>
              </div>

              {isLoading && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading
                </div>
              )}
            </div>
          </div>

          <div className="min-h-[650px] bg-white p-3 sm:p-5">
            <jumio-sdk dc={dataCenter} token={sdkToken}></jumio-sdk>
          </div>
        </section>
      )}
    </div>
  );
}