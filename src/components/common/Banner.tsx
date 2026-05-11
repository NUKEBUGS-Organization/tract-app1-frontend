import { ShieldCheck, KeyRound, Building } from "lucide-react";
import tractLogo from "../../assets/tract-logo.png";

export default function AuthLeftSide() {
  const bgImage =
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

  const features = [
    {
      icon: <ShieldCheck className="h-5 w-5 2xl:h-6 2xl:w-6" />,
      title: "Secure by design",
      description: "Enterprise-grade security and data protection.",
    },
    {
      icon: <KeyRound className="h-5 w-5 2xl:h-6 2xl:w-6" />,
      title: "Role-based access",
      description: "Granular permissions for every single user.",
    },
    {
      icon: <Building className="h-5 w-5 2xl:h-6 2xl:w-6" />,
      title: "Built for scale",
      description: "Reliable, performant, and institutional-ready.",
    },
  ];

  return (
    <div className="relative hidden flex-col justify-between overflow-hidden lg:flex lg:w-[48%] xl:w-1/2">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/90 via-white/75 to-white/95" />

      {/* Decorative Brand Circles */}
      <div className="pointer-events-none absolute -right-28 top-24 z-0 h-96 w-96 rounded-full border border-[var(--color-secondary)]/20 2xl:h-[520px] 2xl:w-[520px]" />
      <div className="pointer-events-none absolute -right-10 top-52 z-0 h-64 w-64 rounded-full border border-[var(--color-secondary)]/20 2xl:h-[360px] 2xl:w-[360px]" />
      <div className="pointer-events-none absolute right-24 top-48 z-0 h-2.5 w-2.5 rounded-full bg-[var(--color-secondary)]/80 2xl:h-3 2xl:w-3" />
      <div className="pointer-events-none absolute right-40 top-80 z-0 h-2.5 w-2.5 rounded-full bg-[var(--color-secondary)]/80 2xl:h-3 2xl:w-3" />

      <div className="relative z-10 flex h-full flex-col px-8 py-8 xl:px-12 xl:py-10 2xl:px-20 2xl:py-20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-secondary)]/30 bg-white/80 shadow-[var(--shadow-card)] xl:h-14 xl:w-14 2xl:h-16 2xl:w-16">
            <img
              src={tractLogo}
              alt="TRACT logo"
              className="h-9 w-9 object-contain xl:h-10 xl:w-10 2xl:h-12 2xl:w-12"
            />
          </div>

          <div>
            <div className="text-2xl font-extrabold tracking-tight text-[var(--color-primary)] xl:text-3xl 2xl:text-4xl">
              TRACT
            </div>

            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-[var(--color-secondary)] xl:text-[10px] 2xl:text-xs">
              Luxury Real Estate
            </p>
          </div>
        </div>

        {/* Main Text */}
        <div className="mt-14 max-w-lg xl:mt-20 2xl:mt-32 2xl:max-w-3xl">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-[var(--color-primary)] xl:text-5xl 2xl:text-7xl">
            Intelligent.
            <br />
            Secure.{" "}
            <span className="text-[var(--color-secondary)]">
              Built for
              <br />
              Real Estate.
            </span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-[var(--color-text-muted)] xl:text-base xl:leading-8 2xl:mt-8 2xl:max-w-2xl 2xl:text-xl 2xl:leading-10">
            TRACT streamlines property operations with secure access, smart
            automation, and real-time insights for the modern investor.
          </p>
        </div>

        <div className="flex-grow" />

        {/* Features */}
        <div className="mt-10 grid grid-cols-3 gap-4 xl:gap-6 2xl:gap-10">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col gap-2 2xl:gap-3">
              <div className="text-[var(--color-secondary)]">
                {feature.icon}
              </div>

              <h3 className="text-xs font-semibold text-[var(--color-text-main)] xl:text-sm 2xl:text-base">
                {feature.title}
              </h3>

              <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)] xl:text-xs 2xl:text-sm 2xl:leading-6">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-8 text-[11px] text-[var(--color-text-muted)] xl:text-xs 2xl:text-sm">
          © 2024 TRACT Real Estate. All rights reserved.
        </div>
      </div>
    </div>
  );
}