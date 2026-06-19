import type { ElementType, ReactNode } from "react";

import { displayAdminValue } from "./listingDetailHelpers";

export function DetailItem({
  label,
  value,
  children,
  icon: Icon,
  featured = false,
}: {
  label: string;
  value?: any;
  children?: ReactNode;
  icon?: ElementType;
  featured?: boolean;
}) {
  return (
    <div
      className={`group min-w-0 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
        featured
          ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5"
          : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-primary)]/20 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]/60"
            aria-hidden="true"
          />
        )}

        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {label}
        </p>
      </div>

      <div className="mt-1.5 break-words text-sm font-bold leading-snug text-[var(--color-text-main)]">
        {children ?? displayAdminValue(value)}
      </div>
    </div>
  );
}

export function SectionBlock({
  title,
  description,
  icon,
  children,
  columns = "default",
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
  columns?: "default" | "compact";
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="font-serif text-xl font-black leading-tight text-[var(--color-primary)]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div
        className={
          columns === "compact"
            ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3"
        }
      >
        {children}
      </div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  icon,
  helper,
  featured = false,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  helper?: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-3xl border p-4 shadow-[var(--shadow-card)] transition-all duration-200 ${
        featured
          ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)] text-white"
          : "border-[var(--color-border-light)] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-[9px] font-black uppercase tracking-[0.2em] ${
              featured ? "text-white/65" : "text-[var(--color-text-muted)]"
            }`}
          >
            {label}
          </p>

          <div
            className={`mt-2 break-words text-lg font-black leading-tight ${
              featured ? "text-white" : "text-[var(--color-primary)]"
            }`}
          >
            {value}
          </div>

          {helper && (
            <p
              className={`mt-1 text-xs font-semibold ${
                featured ? "text-white/65" : "text-[var(--color-text-muted)]"
              }`}
            >
              {helper}
            </p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            featured
              ? "bg-white/10 text-white"
              : "bg-[var(--color-bg-soft)] text-[var(--color-primary)]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}