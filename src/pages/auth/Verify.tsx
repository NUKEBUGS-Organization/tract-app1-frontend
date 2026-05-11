// src/pages/auth/Verify.tsx

import { ShieldCheck, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "../../services/authService";
import { normalizeAuthResponse } from "../../features/auth/authResponse";
import { getRoleFromToken } from "../../features/auth/jwtUtils";

type VerifyPurpose = "login" | "forgot_password";

const OTP_EXPIRY_SECONDS = 10 * 60;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function getDashboardPath(role?: string | null) {
  const normalizedRole = role?.toLowerCase().trim();

  if (!normalizedRole) {
    return "/auth/signin";
  }

  if (normalizedRole === "seller") {
    return "/seller/dashboard";
  }

  if (["wholesaler", "partner", "private_partner"].includes(normalizedRole)) {
    return "/partner/dashboard";
  }

  if (["realtor", "licensed", "licensed_partner"].includes(normalizedRole)) {
    return "/realtor/dashboard";
  }

  if (normalizedRole === "admin") {
    return "/admin/dashboard";
  }

  return "/unauthorized";
}

export default function VerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email ?? "";
  const purpose = (location.state?.purpose ?? "login") as VerifyPurpose;

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [sendOtp, { isLoading: isResending }] = useSendOtpMutation();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const isExpired = timeLeft <= 0;

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = window.setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          window.clearInterval(timerId);
          return 0;
        }

        return previousTime - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (isExpired) {
      setApiError("OTP has expired. Please resend code.");
      return;
    }

    const onlyNumber = value.replace(/\D/g, "");

    if (onlyNumber.length > 1) return;

    const newCode = [...code];
    newCode[index] = onlyNumber;
    setCode(newCode);

    if (onlyNumber && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setApiError("Email is missing. Please go back and try again.");
      return;
    }

    try {
      setApiError(null);

      await sendOtp({
        email,
        purpose,
      }).unwrap();

      setCode(["", "", "", "", "", ""]);
      setTimeLeft(OTP_EXPIRY_SECONDS);
      inputRefs[0].current?.focus();
    } catch (error: any) {
      console.error("Resend OTP failed:", error);

      const message =
        error?.data?.message ||
        error?.data?.error ||
        error?.error ||
        "Unable to resend OTP. Please try again.";

      setApiError(message);
    }
  };

  const handleVerify = async () => {
    const otp = code.join("");

    console.log("Verify button clicked");
    console.log("Verify payload:", {
      email,
      otp,
      purpose,
    });

    if (!email) {
      setApiError("Email is missing. Please go back and try again.");
      return;
    }

    if (isExpired) {
      setApiError("OTP has expired. Please resend code.");
      return;
    }

    if (otp.length !== 6) {
      setApiError("Please enter complete 6-digit OTP.");
      return;
    }

    try {
      setApiError(null);

      const response = await verifyOtp({
        email,
        otp,
        purpose,
      }).unwrap();

      console.log("Verify OTP response:", response);

      const authData = normalizeAuthResponse(response);

      console.log("Normalized auth data:", authData);

      if (purpose === "forgot_password") {
        if (!authData.resetToken) {
          setApiError("Reset token was not returned by backend.");
          return;
        }

        navigate("/auth/reset-password", {
          state: {
            resetToken: authData.resetToken,
          },
        });
        return;
      }

      const role = authData.user?.role ?? getRoleFromToken(authData.accessToken);

      const dashboardPath = getDashboardPath(role);

      navigate(dashboardPath, { replace: true });
    } catch (error: any) {
      console.error("OTP verification failed:", error);

      const message =
        error?.data?.message ||
        error?.data?.error ||
        error?.error ||
        "OTP verification failed. Please try again.";

      setApiError(message);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6 text-center sm:mb-8 2xl:mb-10">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] sm:text-3xl xl:text-[32px] 2xl:text-4xl">
          Verify your account
        </h2>

        <p className="mt-2 flex items-center justify-center gap-2 text-xs leading-6 text-[var(--color-text-muted)] sm:text-sm 2xl:text-base">
          We&apos;ve sent a 6-digit code to
        </p>

        <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--color-bg-soft)] px-3 py-2 text-xs font-medium text-[var(--color-text-main)] sm:px-4 sm:text-sm 2xl:px-5 2xl:py-3 2xl:text-base">
          <Mail className="h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)] 2xl:h-5 2xl:w-5" />
          <span className="truncate">{email || "Email missing"}</span>
        </div>

        <div className="my-5 flex items-center justify-center sm:my-6 2xl:my-8">
          <div className="h-px w-12 bg-[var(--color-border-light)] sm:w-16 2xl:w-20" />
          <div className="mx-3 h-2 w-2 rounded-full bg-[var(--color-secondary)] sm:mx-4" />
          <div className="h-px w-12 bg-[var(--color-border-light)] sm:w-16 2xl:w-20" />
        </div>
      </div>

      {apiError && (
        <div className="mb-5 rounded-[var(--radius-input)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-xs font-medium text-[var(--color-danger)] sm:text-sm">
          {apiError}
        </div>
      )}

      <form
        className="space-y-5 sm:space-y-6 2xl:space-y-7"
        onSubmit={(event) => {
          event.preventDefault();
          handleVerify();
        }}
      >
        <div>
          <label className="mb-3 block text-center text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-main)] sm:mb-4 sm:text-xs 2xl:text-sm">
            Enter the 6-digit code
          </label>

          <div className="flex justify-center gap-1.5 sm:gap-2 2xl:gap-3">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={isExpired}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className={`h-11 w-9 rounded-[var(--radius-input)] border border-transparent bg-[var(--color-bg-soft)] text-center text-base font-semibold text-[var(--color-primary)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)] sm:h-14 sm:w-12 sm:text-xl 2xl:h-16 2xl:w-14 2xl:text-2xl ${
                  isExpired ? "cursor-not-allowed opacity-60" : ""
                }`}
                placeholder="-"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 px-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-2 sm:text-sm 2xl:text-base">
          <div className="flex items-center justify-center gap-1.5 text-[var(--color-text-muted)] sm:justify-start">
            <span>
              Code expires in{" "}
              <span
                className={`font-semibold ${
                  isExpired
                    ? "text-[var(--color-danger)]"
                    : "text-[var(--color-primary)]"
                }`}
              >
                {formatTime(timeLeft)}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending}
            className="text-center font-semibold text-[var(--color-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending ? "Sending..." : "Resend code"}
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          loadingText="Verifying..."
          disabled={isExpired}
          className="mt-4 flex w-full items-center justify-center gap-2 py-3 text-xs uppercase tracking-wide sm:mt-6 sm:py-3.5 sm:text-sm 2xl:py-4 2xl:text-base"
        >
          Verify & Continue
          <ArrowRight className="h-4 w-4 2xl:h-5 2xl:w-5" />
        </Button>

        <div className="relative my-5 flex items-center sm:my-6 2xl:my-8">
          <div className="flex-grow border-t border-[var(--color-border-light)]" />
          <span className="mx-4 flex-shrink-0 text-xs text-[var(--color-text-muted)] 2xl:text-sm">
            OR
          </span>
          <div className="flex-grow border-t border-[var(--color-border-light)]" />
        </div>

        <div className="text-center">
          <Link
            to="/auth/signup"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline sm:text-sm 2xl:text-base"
          >
            <ArrowLeft className="h-4 w-4 2xl:h-5 2xl:w-5" />
            Change email or go back
          </Link>
        </div>

        <div className="mt-6 flex gap-3 rounded-[var(--radius-input)] border border-[var(--color-secondary)]/25 bg-[var(--color-secondary)]/10 p-4 sm:gap-4 2xl:p-6">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[var(--color-secondary)] 2xl:h-6 2xl:w-6" />

          <div>
            <h4 className="mb-1 text-[11px] font-bold text-[var(--color-text-main)] sm:text-xs 2xl:text-sm">
              Institutional Security
            </h4>

            <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)] sm:text-xs 2xl:text-sm 2xl:leading-6">
              Your data is protected with industry-leading security and
              compliance standards.{" "}
              <a href="#" className="font-semibold text-[var(--color-secondary)]">
                Learn more
              </a>
            </p>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}