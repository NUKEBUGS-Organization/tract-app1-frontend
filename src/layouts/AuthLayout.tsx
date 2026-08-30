import React from "react";
import AuthLeftSide from "../components/common/Banner";
import tractLogo from "../assets/tract-logo.png";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full text-[var(--color-text-main)]">
      {/* Full-bleed, unfaded background image — sits behind everything */}
      <AuthLeftSide />

      {/* Foreground: the form panel is a full-height solid column pinned
          to the right on large screens, so the photo stays fully visible
          beside it. On mobile it's a full-width column stacked on top. */}
      <div className="relative z-10 flex min-h-screen w-full flex-col lg:flex-row lg:justify-end">
        <div className="flex min-h-screen w-full flex-col overflow-y-auto bg-white lg:w-[46%] lg:shadow-[-12px_0_50px_rgba(0,0,0,0.18)] xl:w-[40%] 2xl:w-[34%]">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-5 py-5 sm:px-6 lg:hidden">
            <div className="flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
              <img
                src={tractLogo}
                alt="TRACT logo"
                className="h-7 w-7 object-contain"
              />
              TRACT
            </div>
          </div>

          {/* Auth Card Area */}
          <div className="flex flex-grow items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 xl:px-12 2xl:px-16">
            <div className="w-full max-w-[430px] sm:max-w-[480px]">
              {children}
            </div>
          </div>

          {/* Footer Links */}
          {/* <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-4 pb-5 text-center text-[11px] text-[var(--color-text-muted)] sm:px-6 sm:text-xs 2xl:text-sm">
            <a
              href="#"
              className="transition-colors hover:text-[var(--color-primary)]"
            >
              Terms of Service
            </a>

            <a
              href="#"
              className="transition-colors hover:text-[var(--color-primary)]"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="transition-colors hover:text-[var(--color-primary)]"
            >
              Security Compliance
            </a>

            <a
              href="#"
              className="transition-colors hover:text-[var(--color-primary)]"
            >
              Contact Support
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
}