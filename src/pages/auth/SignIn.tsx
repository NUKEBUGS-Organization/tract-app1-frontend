import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import { useLoginMutation } from "../../services/authService";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function SignInPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
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
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6 text-center sm:mb-8 2xl:mb-10">
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

      <form
        className="space-y-4 sm:space-y-5 2xl:space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            Email address
          </label>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />

            <input
              {...register("email")}
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
              {...register("password")}
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

          <div className="mt-2 flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-xs font-semibold text-[var(--color-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline 2xl:text-sm"
            >
              Forgot password?
            </Link>
          </div>

          {errors.password && (
            <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
              {errors.password.message}
            </p>
          )}
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

        <div className="relative my-6 flex items-center sm:my-8">
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