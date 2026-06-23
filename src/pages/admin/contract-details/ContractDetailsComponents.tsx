import type { ReactNode } from "react";

import {
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import {
  formatDate,
  getPersonName,
} from "../../../utils/adminUtils";

import {
  getRelationEmail,
  getRelationId,
  getRelationPhone,
} from "./contractDetailsUtils";

function renderValue(value: any) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "-";
  }

  return value;
}

export function DetailItem({
  label,
  value,
  children,
  icon: Icon,
}: {
  label: string;
  value?: any;
  children?: ReactNode;
  icon?: any;
}) {
  return (
    <div className="group flex min-w-0 flex-col gap-1.5 rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3.5 transition hover:border-[var(--color-primary)]/20 hover:shadow-sm">
      <div className="flex items-center gap-1.5">
        {Icon && (
          <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]/50" />
        )}

        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {label}
        </p>
      </div>

      <div className="break-words text-sm font-semibold leading-snug text-[var(--color-text-main)]">
        {children ?? renderValue(value)}
      </div>
    </div>
  );
}

export function SectionBlock({
  title,
  description,
  icon,
  children,
  cols = 3,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const columnsClass =
    cols === 4
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      : cols === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3 border-b border-[var(--color-border-light)] pb-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="font-serif text-lg font-black leading-tight text-[var(--color-primary)]">
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className={`grid items-start gap-3 ${columnsClass}`}>
        {children}
      </div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  icon: any;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 rounded-xl border px-4 py-3.5 ${
        accent
          ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5"
          : "border-[var(--color-border-light)] bg-white"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          accent
            ? "bg-[var(--color-primary)]/12 text-[var(--color-primary)]"
            : "bg-[var(--color-bg-soft)] text-[var(--color-primary)]/60"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          {label}
        </p>

        <div className="mt-1 break-words text-sm font-bold text-[var(--color-text-main)]">
          {value}
        </div>
      </div>
    </div>
  );
}

export function SigningCard({
  role,
  name,
  signed,
  signedAt,
}: {
  role: string;
  name: string;
  signed: boolean;
  signedAt?: string | null;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        signed
          ? "border-green-200 bg-green-50"
          : "border-[var(--color-border-light)] bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          {role}
        </p>

        {signed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            Signed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-soft)] px-2 py-1 text-[10px] font-bold text-[var(--color-text-muted)]">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )}
      </div>

      <p className="mt-3 break-words text-sm font-black text-[var(--color-primary)]">
        {name || "-"}
      </p>

      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        {signedAt
          ? `Signed on ${formatDate(signedAt)}`
          : signed
            ? "Signature completed"
            : "Not yet signed"}
      </p>
    </div>
  );
}

function PartyRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: any;
}) {
  return (
    <div className="flex items-start gap-3 border-t border-[var(--color-border-light)] py-3 first:border-t-0 first:pt-0 last:pb-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]/60" />

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-[var(--color-text-main)]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

export function PartyCard({
  title,
  person,
  relation,
}: {
  title: string;
  person: any;
  relation: any;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-sm">
      <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
        {title}
      </p>

      <PartyRow
        label="Name"
        value={getPersonName(person)}
        icon={UserRound}
      />

      <PartyRow
        label="Email"
        value={getRelationEmail(person)}
        icon={Mail}
      />

      <PartyRow
        label="Phone"
        value={getRelationPhone(person)}
        icon={Phone}
      />

      <PartyRow
        label="User ID"
        value={getRelationId(relation)}
        icon={UserRound}
      />
    </div>
  );
}
