import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Edit3,
  Mail,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Star,
  User,
  UserCog,
  X,
} from "lucide-react";

import {
  useGetMeQuery,
  useUpdateMeMutation,
} from "../../services/userService";
import StatusBadge from "../../components/common/StatusBadge";

function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

function getDisplayValue(value: any) {
  return value === undefined || value === null || value === "" ? "-" : value;
}

function getErrorMessage(error: any, fallback: string) {
  const message = error?.data?.message || error?.data?.error || error?.error;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return message || fallback;
}

function formatRole(role?: string) {
  if (!role) return "-";

  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatKycStatus(status?: string) {
  if (!status) return "Pending";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getKycVariant(status?: string) {
  const normalized = String(status || "pending").toLowerCase();

  if (normalized === "verified") return "success";
  if (normalized === "rejected") return "danger";

  return "gold";
}

function formatBoolean(value: any) {
  return value ? "Yes" : "No";
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateForInput(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
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

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(23,77,52,0.08)]"
      />
    </div>
  );
}

export default function ProfilePage() {
  const { data, isLoading, refetch, isFetching } = useGetMeQuery();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();

  const profile = getApiPayload(data);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [dob, setDob] = useState("");

  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const displayName = profile?.full_name || profile?.email || "User";
  const kycStatus = profile?.kyc_status || "pending";
  const isKycVerified = String(kycStatus).toLowerCase() === "verified";

  useEffect(() => {
    if (!profile) return;

    setFullName(profile?.full_name || "");
    setStateCode(profile?.state_code || "");
    setDob(formatDateForInput(profile?.dob));
  }, [profile]);

  function handleCancelEdit() {
    setFullName(profile?.full_name || "");
    setStateCode(profile?.state_code || "");
    setDob(formatDateForInput(profile?.dob));
    setApiError(null);
    setApiSuccess(null);
    setIsEditing(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const normalizedState = stateCode.trim().toUpperCase();

    if (!trimmedName) {
      setApiError("Full name is required.");
      return;
    }

    if (!normalizedState) {
      setApiError("State code is required.");
      return;
    }

    if (normalizedState.length < 2) {
      setApiError("State code should be valid, for example NY, NJ, TX.");
      return;
    }

    try {
      setApiError(null);
      setApiSuccess(null);

      await updateMe({
        full_name: trimmedName,
        state_code: normalizedState,
        dob: dob || undefined,
      }).unwrap();

      setApiSuccess("Profile updated successfully.");
      setIsEditing(false);
      await refetch();
    } catch (error: any) {
      setApiError(getErrorMessage(error, "Unable to update profile."));
    }
  }

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
            View your account information, update allowed profile details, and
            complete identity verification.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setApiError(null);
                setApiSuccess(null);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {apiError && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          {apiError}
        </div>
      )}

      {apiSuccess && (
        <div className="rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 p-4 text-sm font-semibold text-[var(--color-primary)]">
          {apiSuccess}
        </div>
      )}

      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] font-serif text-xl font-black text-[var(--color-secondary)] ring-2 ring-[var(--color-secondary)]/30">
              {getInitials(displayName)}
            </div>

            <div>
              <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
                {displayName}
              </h2>

              <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                {formatRole(profile?.role)}
              </p>
            </div>
          </div>

          <StatusBadge
            label={`KYC ${formatKycStatus(kycStatus)}`}
            variant={getKycVariant(kycStatus)}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Full Name" value={profile?.full_name} icon={User} />
        <DetailCard label="Email" value={profile?.email} icon={Mail} />
        <DetailCard label="Phone" value={profile?.phone} icon={Phone} />
        <DetailCard
          label="Role"
          value={formatRole(profile?.role)}
          icon={ShieldCheck}
        />
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard
          label="State Code"
          value={profile?.state_code}
          icon={BadgeCheck}
        />
        <DetailCard label="Date of Birth" value={formatDate(profile?.dob)} icon={Calendar} />
        <DetailCard
          label="Bank Verified"
          value={formatBoolean(profile?.bank_verified)}
          icon={CheckCircle2}
        />
        <DetailCard
          label="Deal Count"
          value={profile?.deal_count}
          icon={Star}
        />
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <DetailCard
          label="Reliability Score"
          value={profile?.reliability_score}
          icon={Star}
        />
        <DetailCard
          label="Professional Score"
          value={profile?.professional_score}
          icon={ShieldCheck}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                Identity Verification
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Your current KYC status is{" "}
                <strong>{formatKycStatus(kycStatus)}</strong>.
              </p>
            </div>

            <StatusBadge
              label={formatKycStatus(kycStatus)}
              variant={getKycVariant(kycStatus)}
            />
          </div>

          {!isKycVerified && (
            <Link
              to="/kyc"
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white"
            >
              <ShieldCheck className="h-4 w-4" />
              Open KYC Verification
            </Link>
          )}

          {isKycVerified && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-5 py-3 text-sm font-bold text-[var(--color-primary)]">
              <CheckCircle2 className="h-4 w-4" />
              Identity verification completed.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                Update Profile
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                You can update only full name, state code, and date of birth.
              </p>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="rounded-lg p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)] disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* {!isEditing && (
            <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-[var(--color-secondary)]" />

                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  Email and phone are read-only because backend update DTO does
                  not allow changing them yet.
                </p>
              </div>
            </div>
          )} */}

          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Full Name"
                value={fullName}
                onChange={setFullName}
                placeholder="Enter full name"
              />

              <InputField
                label="State Code"
                value={stateCode}
                onChange={(value) => setStateCode(value.toUpperCase())}
                placeholder="NY"
              />

              <InputField
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={setDob}
              />

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="border border-[var(--color-border-light)] bg-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}