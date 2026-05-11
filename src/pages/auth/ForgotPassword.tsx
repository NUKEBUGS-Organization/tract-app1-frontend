import { Mail, ArrowRight, RotateCcw, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import { useSendOtpMutation } from "../../services/authService";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [sendOtp, { isLoading }] = useSendOtpMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await sendOtp({
        email: data.email,
        purpose: "forgot_password",
      }).unwrap();

      navigate("/auth/verify", {
        state: {
          email: data.email,
          purpose: "forgot_password",
        },
      });
    } catch (error) {
     
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6 text-center sm:mb-8 2xl:mb-10">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-secondary)]/15 sm:mb-6 2xl:h-14 2xl:w-14">
          <RotateCcw className="h-6 w-6 text-[var(--color-secondary)] 2xl:h-7 2xl:w-7" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] sm:text-3xl 2xl:text-4xl">
          Reset your password
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-[var(--color-text-muted)] sm:text-sm 2xl:max-w-lg 2xl:text-base">
          Enter your email and we&apos;ll send you instructions to reset your
          password.
        </p>
      </div>

      <form
        className="space-y-5 sm:space-y-6 2xl:space-y-7"
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

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          loadingText="Sending OTP..."
          className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-xs uppercase tracking-wide sm:py-3.5 sm:text-sm 2xl:py-4 2xl:text-base"
        >
          Send Reset Link
          <ArrowRight className="h-4 w-4 2xl:h-5 2xl:w-5" />
        </Button>
      </form>

      <div className="mt-6 flex gap-3 rounded-[var(--radius-input)] border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4 sm:mt-8 sm:gap-4 sm:p-5 2xl:p-6">
        <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[var(--color-secondary)] 2xl:h-6 2xl:w-6" />

        <div>
          <h4 className="mb-1 text-[11px] font-bold text-[var(--color-text-main)] sm:text-xs 2xl:text-sm">
            Your security is our priority
          </h4>

          <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)] sm:text-xs 2xl:text-sm 2xl:leading-6">
            Resetting your password triggers an encrypted authentication flow. If
            you do not receive an email within 5 minutes, please check your spam
            folder or contact institutional support.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}