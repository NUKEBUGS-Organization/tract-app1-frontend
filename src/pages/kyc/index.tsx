import "@jumio/websdk";
import { useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  FileCheck2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react";

import Button from "../../components/common/Button";
import { useInitiateKycMutation } from "../../services/authService";

type JumioDataCenter = "us" | "eu" | "sgp";

function getKycAccessToken(response: any) {
  return response?.data?.kyc_access_token ?? null;
}

function getJumioDataCenter(): JumioDataCenter {
  const dataCenter = import.meta.env.VITE_JUMIO_DATA_CENTER || "us";
  const normalizedDataCenter = String(dataCenter).toLowerCase();

  if (normalizedDataCenter === "eu") return "eu";
  if (normalizedDataCenter === "sgp") return "sgp";

  return "us";
}

const steps = [
  {
    icon: FileCheck2,
    step: "01",
    title: "Prepare Your ID",
    description:
      "Have a valid government-issued document ready — passport, driver's licence, or national ID.",
  },
  {
    icon: BadgeCheck,
    step: "02",
    title: "Complete Face Check",
    description:
      "Jumio will guide you through a quick selfie or liveness step to confirm your identity.",
  },
  {
    icon: CheckCircle2,
    step: "03",
    title: "Await Confirmation",
    description:
      "Results are delivered securely via webhook. You'll be notified once verification is complete.",
  },
];

export default function KycPage() {
  const [initiateKyc, { isLoading }] = useInitiateKycMutation();

  const [sdkToken, setSdkToken] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const dataCenter = getJumioDataCenter();

  const handleStartKyc = async () => {
    try {
      setApiError(null);

      const response = await initiateKyc().unwrap();

      const token = getKycAccessToken(response);

      if (!token) {
        setApiError("KYC token was not returned by backend.");
        return;
      }

      setSdkToken(token);
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
    <div className="min-h-[calc(100vh-150px)] px-0">
      {!sdkToken && (
        <div className="space-y-8">
          {/* Hero Card */}
          <section
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 60%, #0a2518 100%)",
              borderRadius: 28,
              position: "relative",
              overflow: "hidden",
              padding: "0",
              boxShadow: "0 32px 80px rgba(23, 77, 52, 0.28)",
            }}
          >
            {/* Decorative gold ring */}
            <div
              style={{
                position: "absolute",
                top: -80,
                right: -80,
                width: 340,
                height: 340,
                borderRadius: "50%",
                border: "1.5px solid rgba(212,175,55,0.18)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 220,
                height: 220,
                borderRadius: "50%",
                border: "1px solid rgba(212,175,55,0.12)",
                pointerEvents: "none",
              }}
            />

            {/* Gold dot accent */}
            <div
              style={{
                position: "absolute",
                bottom: 32,
                left: "50%",
                transform: "translateX(-50%)",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--color-secondary)",
                opacity: 0.4,
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                padding: "44px 48px",
                display: "flex",
                flexDirection: "column",
                gap: 28,
              }}
              className="lg:flex-row lg:items-center lg:justify-between"
            >
              {/* Left content */}
              <div style={{ flex: 1, maxWidth: 580 }}>
                {/* Badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(212,175,55,0.15)",
                    border: "1px solid rgba(212,175,55,0.35)",
                    borderRadius: 100,
                    padding: "6px 16px",
                    marginBottom: 20,
                  }}
                >
                  <ShieldCheck
                    size={13}
                    style={{ color: "var(--color-secondary)" }}
                  />

                  <span
                    style={{
                      color: "var(--color-secondary)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                    }}
                  >
                    Identity Verification
                  </span>
                </div>

                <h1
                  className="font-serif"
                  style={{
                    color: "#fff",
                    fontSize: "clamp(26px, 4vw, 38px)",
                    fontWeight: 900,
                    lineHeight: 1.18,
                    marginBottom: 14,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Verify your identity
                  <br />
                  <span style={{ color: "var(--color-secondary)" }}>
                    to unlock full access.
                  </span>
                </h1>

                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 13.5,
                    lineHeight: 1.75,
                    maxWidth: 440,
                  }}
                >
                  TRACT requires KYC verification to ensure a secure and trusted
                  marketplace for luxury real estate transactions. The process
                  takes under 3 minutes.
                </p>

                {/* Trust indicators */}
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    marginTop: 24,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { icon: Lock, label: "256-bit encrypted" },
                    { icon: Sparkles, label: "Jumio certified" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11.5,
                        fontWeight: 500,
                      }}
                    >
                      <Icon size={13} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA block */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  minWidth: 240,
                }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleStartKyc}
                  isLoading={isLoading}
                  loadingText="Starting..."
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-secondary) 0%, #b8942a 100%)",
                    color: "#0f3323",
                    border: "none",
                    borderRadius: 14,
                    padding: "15px 32px",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    boxShadow: "0 8px 28px rgba(212,175,55,0.35)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Begin Verification
                  <ArrowRight size={15} />
                </Button>

                <p
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: 10.5,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  Usually completes in &lt; 3 min
                </p>
              </div>
            </div>

            {/* Error bar */}
            {apiError && (
              <div
                style={{
                  margin: "0 48px 28px",
                  borderRadius: 12,
                  background: "rgba(220,38,38,0.12)",
                  border: "1px solid rgba(220,38,38,0.3)",
                  padding: "12px 18px",
                  color: "#fca5a5",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {apiError}
              </div>
            )}
          </section>

          {/* Steps */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {steps.map(({ icon: Icon, step, title, description }) => (
              <div
                key={step}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: "1px solid var(--color-border-light)",
                  padding: "28px 26px",
                  boxShadow: "var(--shadow-card)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Step number watermark */}
                <span
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 18,
                    fontSize: 40,
                    fontWeight: 900,
                    color: "var(--color-primary)",
                    opacity: 0.05,
                    lineHeight: 1,
                    fontFamily: "serif",
                    userSelect: "none",
                  }}
                >
                  {step}
                </span>

                {/* Icon circle */}
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background:
                      "linear-gradient(135deg, rgba(23,77,52,0.08), rgba(212,175,55,0.1))",
                    border: "1px solid rgba(212,175,55,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <Icon size={20} style={{ color: "var(--color-primary)" }} />
                </div>

                <h3
                  style={{
                    color: "var(--color-text-main)",
                    fontWeight: 700,
                    fontSize: 14.5,
                    marginBottom: 8,
                  }}
                >
                  {title}
                </h3>

                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: 12.5,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {description}
                </p>

                {/* Gold bottom accent line */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background:
                      "linear-gradient(90deg, var(--color-secondary), transparent)",
                    opacity: 0.35,
                    borderRadius: "0 0 20px 20px",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Security notice */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "14px 20px",
              background: "rgba(23,77,52,0.05)",
              borderRadius: 12,
              border: "1px solid rgba(23,77,52,0.1)",
            }}
          >
            <Lock
              size={13}
              style={{ color: "var(--color-primary)", opacity: 0.6 }}
            />

            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: 11.5,
                margin: 0,
                textAlign: "center",
              }}
            >
              Your verification is processed securely through Jumio. TRACT
              stores only the verification status needed for account access.
            </p>
          </div>
        </div>
      )}

      {/* SDK Panel */}
      {sdkToken && (
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "calc(100vh - 150px)",
            overflow: "hidden",
            borderRadius: 28,
            border: "1px solid var(--color-border-light)",
            background: "#fff",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Header bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 28px",
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(212,175,55,0.15)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck
                  size={16}
                  style={{ color: "var(--color-secondary)" }}
                />
              </div>

              <div>
                <h2
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  Jumio Verification Session
                </h2>

                <p
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 10.5,
                    margin: "4px 0 0",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Data center: {dataCenter.toUpperCase()}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={handleRestartSession}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 10,
                padding: "9px 18px",
                color: "rgba(255,255,255,0.75)",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              <RefreshCcw size={13} />
              Restart
            </Button>
          </div>

          {/* SDK embed */}
          <div style={{ flex: 1, background: "#fff", padding: 0 }}>
            <jumio-sdk
              dc={dataCenter}
              token={sdkToken}
              style={{
                display: "block",
                width: "100%",
                minHeight: "calc(100vh - 235px)",
                height: "calc(100vh - 235px)",
              }}
            />
          </div>
        </section>
      )}
    </div>
  );
}