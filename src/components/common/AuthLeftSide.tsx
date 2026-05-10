
import { Building2, ShieldCheck, KeyRound, Building } from "lucide-react";

export default function AuthLeftSide() {
  const bgImage =
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

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
    <div className="relative hidden flex-col justify-between overflow-hidden lg:flex lg:w-1/2">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90" />

      <div className="relative z-10 flex h-full flex-col p-12">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--color-primary)]">
          <Building2 className="h-8 w-8 text-[var(--color-secondary)]" />
          TRACT
        </div>

        <div className="mt-24 max-w-lg">
          <h1 className="text-5xl font-bold leading-tight text-[var(--color-primary)]">
            Intelligent.
            <br />
            Secure.{" "}
            <span className="text-[var(--color-secondary)]">
              Built for
              <br />
              Real Estate.
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
            TRACT streamlines property operations with secure access, smart automation, and real-time insights for the modern investor.
          </p>
        </div>

        <div className="flex-grow" />

        <div className="mt-12 grid grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="text-[var(--color-secondary)]">
                {feature.icon}
              </div>

              <h3 className="text-sm font-semibold text-[var(--color-text-main)]">
                {feature.title}
              </h3>

              <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-xs text-[var(--color-text-muted)]">
          © 2024 TRACT Real Estate. All rights reserved.
        </div>
      </div>
    </div>
  );
}
