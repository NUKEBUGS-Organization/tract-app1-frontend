import React from "react";
import { Building2 } from "lucide-react";
import AuthLeftSide from "../components/common/Banner";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[var(--color-bg-main)] text-[var(--color-text-main)]">
      <AuthLeftSide />

      <div className="flex min-h-screen w-full flex-col overflow-y-auto lg:w-[52%] xl:w-1/2">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-5 py-5 sm:px-6 lg:hidden">
          <div className="flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
            <Building2 className="h-6 w-6 text-[var(--color-secondary)]" />
            TRACT
          </div>
        </div>

        {/* Auth Card Area */}
        <div className="flex flex-grow items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-12 2xl:px-20">
          <div className="w-full max-w-[430px] rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:max-w-[480px] sm:p-8 xl:max-w-[560px] xl:p-10 2xl:max-w-[700px] 2xl:p-14">
            {children}
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-4 pb-5 text-center text-[11px] text-[var(--color-text-muted)] sm:px-6 sm:text-xs 2xl:text-sm lg:bg-[var(--color-bg-main)]">
          <a href="#" className="transition-colors hover:text-[var(--color-primary)]">
            Terms of Service
          </a>

          <a href="#" className="transition-colors hover:text-[var(--color-primary)]">
            Privacy Policy
          </a>

          <a href="#" className="transition-colors hover:text-[var(--color-primary)]">
            Security Compliance
          </a>

          <a href="#" className="transition-colors hover:text-[var(--color-primary)]">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}