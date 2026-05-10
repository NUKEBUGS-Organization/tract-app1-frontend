import {
  ShieldCheck,
  KeyRound,
  Building,
  Mail,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router";
import { useState, useRef, type KeyboardEvent } from "react";

import AuthLayout from "../../layouts/AuthLayout";
import AppButton from "../../components/common/AppButton";

export default function VerifyPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const features = [
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Secure by design",
      description: "Enterprise-grade security and data protection",
    },
    {
      icon: <KeyRound className="h-5 w-5" />,
      title: "Role-based access",
      description: "Granular permissions for every user",
    },
    {
      icon: <Building className="h-5 w-5" />,
      title: "Built for scale",
      description: "Reliable, performant, and future-ready",
    },
  ];

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <AuthLayout
      title={
        <>
          Intelligent.
          <br />
          Secure.
          <br />
          <span className="text-[var(--color-secondary)]">
            Built for Real Estate.
          </span>
        </>
      }
      subtitle="TRACT streamlines property operations with secure access, smart automation, and real-time insights."
      features={features}
      featuresInCard
      bgImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-[var(--color-text-main)]">
          Verify your account
        </h2>

        <p className="mt-2 flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
          We&apos;ve sent a 6-digit code to
        </p>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-bg-soft)] px-4 py-2 text-sm font-medium text-[var(--color-text-main)]">
          <Mail className="h-4 w-4 text-[var(--color-text-muted)]" />
          you@company.com
        </div>

        <div className="my-8 flex items-center justify-center">
          <div className="h-px w-16 bg-[var(--color-border-light)]" />
          <div className="mx-4 h-2 w-2 rotate-45 rounded-sm bg-[var(--color-secondary)]" />
          <div className="h-px w-16 bg-[var(--color-border-light)]" />
        </div>
      </div>

      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label className="mb-4 block text-center text-xs font-bold uppercase tracking-wider text-[var(--color-text-main)]">
            Enter the 6-digit code
          </label>

          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="h-14 w-12 rounded-[var(--radius-input)] border border-[var(--color-border-light)] text-center text-xl font-semibold text-[var(--color-primary)] outline-none transition-colors placeholder:text-[var(--color-primary)] focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
                placeholder="-"
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-2 text-sm">
          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Code expires in{" "}
            <span className="font-semibold text-[var(--color-primary)]">
              02:45
            </span>
          </div>

          <button
            type="button"
            className="font-semibold text-[var(--color-secondary)] hover:underline"
          >
            Resend code
          </button>
        </div>

        <AppButton
          type="submit"
          variant="primary"
          className="mt-6 flex w-full items-center justify-center gap-2 py-3.5 uppercase"
        >
          Verify & Continue
          <ArrowRight className="h-4 w-4" />
        </AppButton>

        <div className="relative my-8 flex items-center">
          <div className="flex-grow border-t border-[var(--color-border-light)]" />
          <span className="mx-4 flex-shrink-0 text-xs text-[var(--color-text-muted)]">
            OR
          </span>
          <div className="flex-grow border-t border-[var(--color-border-light)]" />
        </div>

        <div className="text-center">
          <Link
            to="/auth/entry"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Change email or go back
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