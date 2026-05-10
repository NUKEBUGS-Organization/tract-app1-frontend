import React from "react";
import { Building2 } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string;
  features?: Feature[];
  featuresInCard?: boolean;
  bgImage?: string;
  darkOverlay?: boolean;
}

const defaultBg =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

export default function AuthLayout({
  children,
  title,
  subtitle,
  features,
  featuresInCard,
  bgImage = defaultBg,
  darkOverlay = false,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[var(--color-bg-main)] text-[var(--color-text-main)]">
      <div className="relative hidden flex-col justify-between overflow-hidden lg:flex lg:w-1/2">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />

        <div
          className={`absolute inset-0 z-0 ${
            darkOverlay
              ? "bg-gradient-to-b from-black/45 via-black/25 to-black/85"
              : "bg-gradient-to-b from-white/90 via-white/70 to-white/90"
          }`}
        />

        <div className="relative z-10 flex h-full flex-col p-12">
          <div
            className={`flex items-center gap-2 text-2xl font-bold tracking-tight ${
              darkOverlay
                ? "text-white"
                : "text-[var(--color-primary)]"
            }`}
          >
            <Building2 className="h-8 w-8 text-[var(--color-secondary)]" />
            TRACT
          </div>

          <div className="mt-24 max-w-lg">
            <h1
              className={`text-5xl font-bold leading-tight ${
                darkOverlay
                  ? "text-white"
                  : "text-[var(--color-primary)]"
              }`}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className={`mt-6 text-lg leading-relaxed ${
                  darkOverlay
                    ? "text-gray-200"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex-grow" />

          {features && features.length > 0 && (
            <div
              className={`mt-12 grid grid-cols-3 gap-6 ${
                featuresInCard
                  ? "rounded-xl border border-[var(--color-border-light)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md"
                  : ""
              }`}
            >
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="text-[var(--color-secondary)]">
                    {feature.icon}
                  </div>

                  <h3
                    className={`text-sm font-semibold ${
                      darkOverlay && !featuresInCard
                        ? "text-white"
                        : "text-[var(--color-text-main)]"
                    }`}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className={`text-xs leading-relaxed ${
                      darkOverlay && !featuresInCard
                        ? "text-gray-300"
                        : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div
            className={`mt-8 text-xs ${
              darkOverlay && !featuresInCard
                ? "text-gray-400"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            © 2024 TRACT Real Estate. All rights reserved.
          </div>
        </div>
      </div>

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