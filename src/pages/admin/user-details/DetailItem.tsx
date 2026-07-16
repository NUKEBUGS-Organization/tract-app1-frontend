import type { ReactNode } from "react";
import { displayValue } from "../../../utils/adminUtils";

function DetailItem({
  label,
  value,
  icon,
  children,
  featured = false,
}: {
  label: string;
  value?: any;
  icon?: ReactNode;
  children?: ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={`group min-w-0 rounded-2xl border px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-secondary)]/40 hover:shadow-sm ${
        featured
          ? "border-[var(--color-primary)]/15 bg-[var(--color-primary)]/5"
          : "border-[var(--color-border-light)] bg-white hover:bg-[var(--color-bg-soft)]/60"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-[var(--color-primary)]/60">{icon}</span>
        )}

        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {label}
        </p>
      </div>

      <div
        className={`mt-1.5 break-words text-sm font-bold leading-6 ${
          featured
            ? "text-[var(--color-primary)]"
            : "text-[var(--color-text-main)]"
        }`}
      >
        {children ?? displayValue(value)}
      </div>
    </div>
  );
}

export default DetailItem;