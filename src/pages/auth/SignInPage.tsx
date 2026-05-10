import {
  ShieldCheck,
  KeyRound,
  Building,
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
import AppButton from "../../components/common/AppButton";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SignInPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      remember: false,
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Sign In submitted:", data);
    navigate("/seller/dashboard");
  };

  const features = [
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Secure by design",
      description: "Enterprise-grade security and data protection.",
    },
    {
      icon: <KeyRound className="h-5 w-5" />,
      title: "Role-based access",
      description: "Granular permissions for every single user.",
    },
    {
      icon: <Building className="h-5 w-5" />,
      title: "Built for scale",
      description: "Reliable, performant, and institutional-ready.",
    },
  ];

  return (
    <AuthLayout
      title={
        <>
          Intelligent.
          <br />
          Secure.{" "}
          <span className="text-[var(--color-secondary)]">
            Built for
            <br />
            Real Estate.
          </span>
        </>
      }
      subtitle="TRACT streamlines property operations with secure access, smart automation, and real-time insights for the modern investor."
      features={features}
      featuresInCard={false}
      bgImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-[var(--color-text-main)]">
          Welcome back
        </h2>

        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Sign in to continue to TRACT
        </p>

        <div className="my-6 flex items-center justify-center">
          <div className="h-px w-16 bg-[var(--color-border-light)]" />
          <div className="mx-4 h-2 w-2 rotate-45 bg-[var(--color-secondary)]" />
          <div className="h-px w-16 bg-[var(--color-border-light)]" />
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
              className={`block w-full rounded-[var(--radius-input)] border bg-[var(--color-bg-soft)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-text-main)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)] ${
                errors.email
                  ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
                  : "border-transparent"
              }`}
            />
          </div>

          {errors.email && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-[var(--color-text-main)]">
              Password
            </label>

            <Link
              to="/auth/forgot-password"
              className="text-xs font-semibold text-[var(--color-secondary)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
              <Lock className="h-5 w-5" />
            </div>

            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              className={`block w-full rounded-[var(--radius-input)] border bg-[var(--color-bg-soft)] py-2.5 pl-10 pr-10 text-sm text-[var(--color-text-main)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)] ${
                errors.password
                  ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
                  : "border-transparent"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pb-2 pt-1">
          <input
            {...register("remember")}
            type="checkbox"
            id="remember"
            className="h-4 w-4 rounded border-[var(--color-border-light)] text-[var(--color-secondary)] focus:ring-[var(--color-secondary)]"
          />

          <label htmlFor="remember" className="text-sm text-[var(--color-text-muted)]">
            Remember me
          </label>
        </div>

        <AppButton
          type="submit"
          variant="primary"
          className="mt-4 flex w-full items-center justify-center gap-2 py-3.5 uppercase"
        >
          Sign In
          <ArrowRight className="h-4 w-4" />
        </AppButton>

        <div className="relative my-8 flex items-center">
          <div className="flex-grow border-t border-[var(--color-border-light)]" />
        </div>

        <div className="text-center text-sm text-[var(--color-text-muted)]">
          Don&apos;t have an account?{" "}
          <Link
            to="/auth/entry"
            className="inline-flex items-center gap-1 font-semibold text-[var(--color-text-main)] transition-colors hover:text-[var(--color-secondary)]"
          >
            Create account <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-8 flex gap-4 rounded-[var(--radius-input)] border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-5">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[var(--color-secondary)]" />

          <div>
            <h4 className="mb-1 text-xs font-bold text-[var(--color-text-main)]">
              Institutional Security
            </h4>

            <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
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