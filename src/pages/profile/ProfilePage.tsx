import { Link } from "react-router";
import {
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserCog,
  AlertTriangle,
} from "lucide-react";

import { useGetMeQuery } from "../../services/userService";
import StatusBadge from "../../components/common/StatusBadge";

function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

function getDisplayValue(value: any) {
  return value === undefined || value === null || value === "" ? "-" : value;
}

function formatRole(role?: string) {
  if (!role) return "-";

  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function DetailCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: any;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {label}
        </p>

        <Icon className="h-5 w-5 text-[var(--color-primary)]" />
      </div>

      <p className="text-sm font-bold text-[var(--color-text-main)]">
        {getDisplayValue(value)}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const { data, isLoading, refetch, isFetching } = useGetMeQuery();

  const profile = getApiPayload(data);

  const fullName =
    profile?.full_name ||
    profile?.fullName ||
    profile?.name ||
    profile?.email ||
    "User";

  const kycStatus =
    profile?.kyc_status ||
    profile?.kycStatus ||
    profile?.is_kyc_verified ||
    profile?.isKycVerified;

  const isKycVerified =
    kycStatus === true ||
    String(kycStatus || "").toLowerCase() === "verified" ||
    String(kycStatus || "").toLowerCase() === "approved";

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <p className="text-sm font-semibold text-[var(--color-primary)]">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Account
          </p>

          <h1 className="mt-1 flex items-center gap-3 font-serif text-3xl font-black text-[var(--color-primary)]">
            <UserCog className="h-7 w-7 text-[var(--color-secondary)]" />
            Profile & Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            View your account information and complete identity verification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="border border-[var(--color-border-light)] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] disabled:opacity-50"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] font-serif text-xl font-black text-[var(--color-secondary)] ring-2 ring-[var(--color-secondary)]/30">
              {String(fullName)
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("") || "U"}
            </div>

            <div>
              <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
                {fullName}
              </h2>

              <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                {formatRole(profile?.role)}
              </p>
            </div>
          </div>

          <StatusBadge
            label={isKycVerified ? "KYC Verified" : "KYC Pending"}
            variant={isKycVerified ? "success" : "gold"}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Full Name" value={fullName} icon={User} />
        <DetailCard label="Email" value={profile?.email} icon={Mail} />
        <DetailCard label="Phone" value={profile?.phone} icon={Phone} />
        <DetailCard
          label="Role"
          value={formatRole(profile?.role)}
          icon={ShieldCheck}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
            Identity Verification
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Complete KYC verification to unlock full marketplace access.
          </p>

          <Link
            to="/kyc"
            className="mt-5 inline-flex items-center gap-2 bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white"
          >
            <ShieldCheck className="h-4 w-4" />
            Open KYC Verification
          </Link>
        </div>

        <div className="rounded-2xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-[var(--color-secondary)]" />

            <div>
              <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                Update Profile
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Update profile API is not available yet. For now, this page only
                shows profile information from the existing get profile API.
              </p>

              <button
                type="button"
                disabled
                className="mt-5 cursor-not-allowed border border-[var(--color-border-light)] bg-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] opacity-60"
              >
                Update Profile Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}