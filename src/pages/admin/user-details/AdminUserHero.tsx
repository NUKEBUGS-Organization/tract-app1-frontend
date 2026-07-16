import { Mail, MapPin, Phone, UserRound } from "lucide-react";

import StatusBadge from "../../../components/common/StatusBadge";
import {
  getPersonName,
  getStatusVariant,
  normalizeValue,
} from "../../../utils/adminUtils";
import UserAvatar from "./UserAvatar";
import {
  formatLabel,
  getEmail,
  getFullAddress,
  getKycStatus,
  getPhone,
  getRawRole,
} from "./adminUserDetails.helpers";

function AdminUserHero({ user }: { user: any }) {
  const fullName = getPersonName(user);
  const email = getEmail(user);
  const phone = getPhone(user);
  const fullAddress = getFullAddress(user);
  const role = normalizeValue(getRawRole(user));
  const kycStatus = normalizeValue(getKycStatus(user));
  const isBanned = user?.is_banned === true;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--color-secondary)]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
          <UserAvatar name={fullName} isBanned={isBanned} />

          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              Admin User Review
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              {fullName}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge label={formatLabel(role)} variant="neutral" />

              <StatusBadge
                label={formatLabel(kycStatus)}
                variant={getStatusVariant(kycStatus)}
              />

              <StatusBadge
                label={isBanned ? "Banned" : "Active"}
                variant={isBanned ? "danger" : "success"}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2 text-sm font-semibold text-[var(--color-text-muted)]">
              {email !== "-" && (
                <p className="flex min-w-0 items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-[var(--color-primary)]/60" />
                  <span className="break-words">{email}</span>
                </p>
              )}

              {phone !== "-" && (
                <p className="flex min-w-0 items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-[var(--color-primary)]/60" />
                  <span className="break-words">{phone}</span>
                </p>
              )}

              {fullAddress !== "-" && (
                <p className="flex min-w-0 items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]/60" />
                  <span className="break-words">{fullAddress}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminUserHero;