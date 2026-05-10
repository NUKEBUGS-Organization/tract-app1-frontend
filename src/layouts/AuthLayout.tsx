import React from "react";
import { Building2 } from "lucide-react";
import AuthLeftSide from "../components/common/AuthLeftSide";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[var(--color-bg-main)] text-[var(--color-text-main)]">
      <AuthLeftSide />

      <div className="flex w-full flex-col overflow-y-auto lg:w-1/2">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <div className="flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
            <Building2 className="h-6 w-6 text-[var(--color-secondary)]" />
            TRACT
          </div>
        </div>

        <div className="flex flex-grow items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-[520px] rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)] sm:p-12">
            {children}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 p-6 text-xs text-[var(--color-text-muted)] lg:bg-[var(--color-bg-main)]">
          <a href="#" className="hover:text-[var(--color-primary)]">
            Terms of Service
          </a>
          <a href="#" className="hover:text-[var(--color-primary)]">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-[var(--color-primary)]">
            Security Compliance
          </a>
          <a href="#" className="hover:text-[var(--color-primary)]">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}