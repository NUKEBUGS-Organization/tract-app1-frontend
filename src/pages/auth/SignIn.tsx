import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

import { Link, useNavigate, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, "");
const GOOGLE_REDIRECT_URI = `${API_ORIGIN}/api/v1/auth/google/callback`;

const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  redirect_uri: GOOGLE_REDIRECT_URI,
  response_type: "code",
  scope: "email profile",
  prompt: "select_account",
}).toString()}`;

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import { useLoginMutation } from "../../services/authService";
import tractLogo from "../../assets/tract-logo.png";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const [login, { isLoading }] = useLoginMutation();

  // Read ?error= injected by backend when Google OAuth fails (banned account, etc.)
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      setGoogleError(decodeURIComponent(err));
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoginStatus(null);

      await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      navigate("/auth/verify", {
        state: {
          email: data.email,
          purpose: "login",
        },
      });
    } catch (error: any) {
      setLoginStatus("Invalid credentials");
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6 text-center sm:mb-8 2xl:mb-10">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-secondary)]/30 bg-white shadow-[var(--shadow-card)]">
                    <img
                      src={tractLogo}
                      alt="TRACT logo"
                      className="h-9 w-9 object-contain"
                    />
                  </div>
        
                  <div className="text-left">
                    <div className="text-xl font-extrabold tracking-tight text-[var(--color-primary)]">
                      TRACT
                    </div>
        
                   <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-[var(--color-secondary)]">
  Buy the best
  <br />
  skip the Rest
</p>
                  </div>
                </div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] sm:text-3xl xl:text-[32px] 2xl:text-4xl">
          Welcome back
        </h2>

        <p className="mt-2 text-xs leading-6 text-[var(--color-text-muted)] sm:text-sm 2xl:text-base">
          Sign in to continue to TRACT
        </p>

        <div className="my-5 flex items-center justify-center sm:my-6 2xl:my-8">
          <div className="h-px w-12 bg-[var(--color-border-light)] sm:w-16 2xl:w-20" />
          <div className="mx-3 h-2 w-2 rotate-45 bg-[var(--color-secondary)] sm:mx-4" />
          <div className="h-px w-12 bg-[var(--color-border-light)] sm:w-16 2xl:w-20" />
        </div>
      </div>

      {/* Google OAuth error banner (from ?error= redirect) */}
      {googleError && (
        <div className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-xs font-medium text-[var(--color-danger)] sm:text-sm">
          {googleError}
        </div>
      )}

      <form
        className="space-y-4 sm:space-y-5 2xl:space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {loginStatus && (
          <div className="flex justify-center">
            <StatusBadge label={loginStatus} variant="danger" />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            Email address
          </label>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />

            <input
              {...register("email", {
                onChange: () => setLoginStatus(null),
              })}
              type="email"
              placeholder="you@company.com"
              className={`block w-full rounded-[var(--radius-input)] border bg-[var(--color-bg-soft)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text-main)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)] sm:py-3 sm:pl-10 2xl:py-4 2xl:pl-12 2xl:text-base ${
                errors.email
                  ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
                  : "border-transparent"
              }`}
            />
          </div>

          {errors.email && (
            <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            Password
          </label>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />

            <input
              {...register("password", {
                onChange: () => setLoginStatus(null),
              })}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              className={`block w-full rounded-[var(--radius-input)] border bg-[var(--color-bg-soft)] py-2.5 pl-9 pr-10 text-sm text-[var(--color-text-main)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)] sm:py-3 sm:pl-10 2xl:py-4 2xl:pl-12 2xl:pr-12 2xl:text-base ${
                errors.password
                  ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
                  : "border-transparent"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-main)] 2xl:pr-4"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
              {errors.password.message}
            </p>
          )}

          <div className="mt-1 flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-xs font-semibold text-[var(--color-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline 2xl:text-sm"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          loadingText="Sending OTP..."
          className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-xs uppercase tracking-wide sm:py-3.5 sm:text-sm 2xl:py-4 2xl:text-base"
        >
          Sign In
          <ArrowRight className="h-4 w-4 2xl:h-5 2xl:w-5" />
        </Button>

        {/* ── OR divider ─────────────────────────────────────────────── */}
        <div className="relative my-5 flex items-center sm:my-6">
          <div className="flex-grow border-t border-[var(--color-border-light)]" />
          <span className="mx-4 flex-shrink-0 text-xs text-[var(--color-text-muted)]">OR</span>
          <div className="flex-grow border-t border-[var(--color-border-light)]" />
        </div>

        {/* ── Continue with Google ────────────────────────────────────── */}
        <a
          id="google-signin-btn"
          href={GOOGLE_AUTH_URL}
          className="flex w-full items-center justify-center gap-2.5 rounded-[var(--radius-button)] border border-[var(--color-border-light)] bg-white py-3 text-xs font-semibold text-[var(--color-text-main)] shadow-sm transition-all hover:border-[var(--color-secondary)]/60 hover:bg-[var(--color-bg-soft)] hover:shadow-[var(--shadow-card)] sm:py-3.5 sm:text-sm 2xl:py-4 2xl:text-base"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </a>

        <div className="relative my-4 flex items-center sm:my-5">
          <div className="flex-grow border-t border-[var(--color-border-light)]" />
        </div>

        <div className="text-center text-xs text-[var(--color-text-muted)] sm:text-sm 2xl:text-base">
          Don&apos;t have an account?{" "}
          <Link
            to="/auth/signup"
            className="inline-flex items-center gap-1 font-semibold text-[var(--color-text-main)] transition-colors hover:text-[var(--color-secondary)]"
          >
            Create account <ArrowUpRight className="h-3 w-3 2xl:h-4 2xl:w-4" />
          </Link>
        </div>

        <div className="mt-6 flex gap-3 rounded-[var(--radius-input)] border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4 sm:mt-8 sm:gap-4 sm:p-5 2xl:p-6">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[var(--color-secondary)] 2xl:h-6 2xl:w-6" />

          <div>
            <h4 className="mb-1 text-[11px] font-bold text-[var(--color-text-main)] sm:text-xs 2xl:text-sm">
              Institutional Security
            </h4>

            <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)] sm:text-xs 2xl:text-sm 2xl:leading-6">
              Your data is protected with industry-leading security and
              compliance standards.{" "}
              <a
                href="#"
                className="font-semibold text-[var(--color-secondary)]"
              >
                Learn more
              </a>
            </p>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}