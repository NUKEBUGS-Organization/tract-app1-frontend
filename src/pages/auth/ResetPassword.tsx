// src/pages/auth/ResetPasswordPage.tsx

import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import AuthLayout from "../../layouts/AuthLayout";
import AppButton from "../../components/common/Button";
import { useResetPasswordMutation } from "../../services/authService";
import tractLogo from "../../assets/tract-logo.png";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const resetToken = location.state?.resetToken;

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (!resetToken) {
        return;
      }

      await resetPassword({
        reset_token: resetToken,
        new_password: data.newPassword,
      }).unwrap();

      navigate("/auth/signin");
    } catch (error) {
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

            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--color-secondary)]">
              Buy the best skip the Rest
            </p>
          </div>
        </div>
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-secondary)]/15 sm:mb-6 2xl:h-14 2xl:w-14">
          <RotateCcw className="h-6 w-6 text-[var(--color-secondary)] 2xl:h-7 2xl:w-7" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] sm:text-3xl 2xl:text-4xl">
          Create new password
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-[var(--color-text-muted)] sm:text-sm 2xl:max-w-lg 2xl:text-base">
          Enter your new password to secure your TRACT account.
        </p>

        <div className="my-5 flex items-center justify-center sm:my-6 2xl:my-8">
          <div className="h-px w-12 bg-[var(--color-border-light)] sm:w-16 2xl:w-20" />
          <div className="mx-3 h-2 w-2 rotate-45 bg-[var(--color-secondary)] sm:mx-4" />
          <div className="h-px w-12 bg-[var(--color-border-light)] sm:w-16 2xl:w-20" />
        </div>
      </div>

      {!resetToken && (
        <div className="mb-5 rounded-[var(--radius-input)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 p-4 text-xs leading-6 text-[var(--color-danger)] sm:text-sm">
          Reset token is missing. Please restart the forgot password flow.
        </div>
      )}

      <form
        className="space-y-5 sm:space-y-6 2xl:space-y-7"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            New password
          </label>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />

            <input
              {...register("newPassword")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className={`block w-full rounded-[var(--radius-input)] border bg-[var(--color-bg-soft)] py-2.5 pl-9 pr-10 text-sm text-[var(--color-text-main)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)] sm:py-3 sm:pl-10 2xl:py-4 2xl:pl-12 2xl:pr-12 2xl:text-base ${errors.newPassword
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

          {errors.newPassword && (
            <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            Confirm password
          </label>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />

            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              className={`block w-full rounded-[var(--radius-input)] border bg-[var(--color-bg-soft)] py-2.5 pl-9 pr-10 text-sm text-[var(--color-text-main)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)] sm:py-3 sm:pl-10 2xl:py-4 2xl:pl-12 2xl:pr-12 2xl:text-base ${errors.confirmPassword
                  ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
                  : "border-transparent"
                }`}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-main)] 2xl:pr-4"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6" />
              )}
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <AppButton
          type="submit"
          variant="primary"
          isLoading={isLoading}
          loadingText="Resetting..."
          disabled={!resetToken}
          className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-xs uppercase tracking-wide sm:py-3.5 sm:text-sm 2xl:py-4 2xl:text-base"
        >
          Reset Password
          <ArrowRight className="h-4 w-4 2xl:h-5 2xl:w-5" />
        </AppButton>
      </form>

      <div className="mt-6 flex gap-3 rounded-[var(--radius-input)] border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4 sm:mt-8 sm:gap-4 sm:p-5 2xl:p-6">
        <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[var(--color-secondary)] 2xl:h-6 2xl:w-6" />

        <div>
          <h4 className="mb-1 text-[11px] font-bold text-[var(--color-text-main)] sm:text-xs 2xl:text-sm">
            Password security
          </h4>

          <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)] sm:text-xs 2xl:text-sm 2xl:leading-6">
            Use a strong password that is unique to your TRACT account. Avoid
            reusing passwords from other platforms.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}