import {
  Mail,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

import AuthLayout from "../../layouts/AuthLayout";
import AppButton from "../../components/common/AppButton";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log("Reset Password requested for:", data);
    setIsSubmitted(true);
  };

  return (
    <AuthLayout
      title={
        <>
          Architectural
          <br />
          precision for
          <br />
          investment
          <br />
          mastery.
        </>
      }
      subtitle="Secure, reliable, and built for the next generation of real estate operations."
      bgImage="https://images.unsplash.com/photo-1541884053360-6bd67fb72a8c?q=80&w=2070&auto=format&fit=crop"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-secondary)]/15">
          <RotateCcw className="h-6 w-6 text-[var(--color-secondary)]" />
        </div>

        <h2 className="text-3xl font-bold text-[var(--color-text-main)]">
          Reset your password
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)]">
          {isSubmitted
            ? "If an account exists for that email, we have sent password reset instructions."
            : "Enter your email and we'll send you instructions to reset your password."}
        </p>

        <div className="my-8 flex items-center justify-center">
          <div className="h-px w-16 bg-[var(--color-border-light)]" />
          <div className="mx-4 h-2 w-2 rotate-45 bg-[var(--color-secondary)]" />
          <div className="h-px w-16 bg-[var(--color-border-light)]" />
        </div>
      </div>

      {!isSubmitted ? (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-main)]">
              Email address
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
                <Mail className="h-5 w-5" />
              </div>

              <input
                {...register("email")}
                type="email"
                placeholder="you@company.com"
                className={`block w-full rounded-[var(--radius-input)] border bg-[var(--color-bg-soft)] py-3 pl-10 pr-3 text-sm text-[var(--color-text-main)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)] ${
                  errors.email
                    ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
                    : "border-[var(--color-border-light)]"
                }`}
              />
            </div>

            {errors.email && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">
                {errors.email.message}
              </p>
            )}
          </div>

          <AppButton
            type="submit"
            variant="primary"
            className="mt-2 flex w-full items-center justify-center gap-2 py-3.5 uppercase"
          >
            Send Reset Link
            <ArrowRight className="h-4 w-4" />
          </AppButton>
        </form>
      ) : (
        <div className="text-center">
          <AppButton
            type="button"
            variant="outline"
            onClick={() => setIsSubmitted(false)}
            className="mt-2 w-full py-3.5 uppercase"
          >
            Try Another Email
          </AppButton>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          to="/auth/signin"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>

      <div className="mt-10 flex gap-4 rounded-[var(--radius-input)] border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-5">
        <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[var(--color-secondary)]" />

        <div>
          <h4 className="mb-1 text-xs font-bold text-[var(--color-text-main)]">
            Your security is our priority
          </h4>

          <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
            Resetting your password triggers an encrypted authentication flow. If
            you do not receive an email within 5 minutes, please check your spam
            folder or contact institutional support.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}