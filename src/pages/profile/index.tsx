import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Edit3,
  FileText,
  Info,
  KeyRound,
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
  PARTNER_ROLES,
  REALTOR_ROLES,
  isAllowedRole,
  normalizeRole,
} from "../../constants/roles";

import {
  useChangePasswordMutation,
  useGetMeQuery,
  useUpdateMeMutation,
} from "../../services/userService";

import { DetailPageSkeleton } from "../../components/common/Skeleton";
import StatusBadge from "../../components/common/StatusBadge";

const STATE_OPTIONS = [
  { name: "New York", code: "NY" },
  { name: "New Jersey", code: "NJ" },
  { name: "Maryland", code: "MD" },
  { name: "Texas", code: "TX" },
  { name: "Delaware", code: "DE" },
  { name: "Florida", code: "FL" },
  { name: "Pennsylvania", code: "PA" },
] as const;

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

  if (normalized === "verified" || normalized === "approved") {
    return "success";
  }

  if (normalized === "rejected") {
    return "danger";
  }

  return "gold";
}

function formatBoolean(value: any) {
  if (value === undefined || value === null) return "-";

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

function getPhone(profile: any) {
  return profile?.phone || "-";
}

function normalizeStateCode(value?: string) {
  if (!value) return "";

  const normalized = value.trim().toUpperCase();

  const matchedByCode = STATE_OPTIONS.find(
    (state) => state.code === normalized
  );

  if (matchedByCode) return matchedByCode.code;

  const matchedByName = STATE_OPTIONS.find(
    (state) => state.name.toLowerCase() === value.trim().toLowerCase()
  );

  return matchedByName?.code || normalized;
}

function getStateOption(value?: string) {
  const normalizedCode = normalizeStateCode(value);

  return STATE_OPTIONS.find((state) => state.code === normalizedCode);
}

function getStateDisplayValue(value?: string) {
  const state = getStateOption(value);

  if (!state) return getDisplayValue(value);

  return `${state.name} (${state.code})`;
}

function DetailCard({
  label,
  value,
  icon: Icon,
  info,
  verified,
  verifiedLabel = "Verified",
}: {
  label: string;
  value: any;
  icon: any;
  info?: ReactNode;
  verified?: boolean;
  verifiedLabel?: string;
}) {
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isHoverOpen, setIsHoverOpen] = useState(false);

  const isInfoOpen = Boolean(info) && (isPinnedOpen || isHoverOpen);

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            {label}
          </p>

          {info && (
            <div
              className="relative"
              onMouseEnter={() => setIsHoverOpen(true)}
              onMouseLeave={() => {
                if (!isPinnedOpen) {
                  setIsHoverOpen(false);
                }
              }}
            >
              <button
                type="button"
                aria-label={`Information about ${label}`}
                aria-expanded={isInfoOpen}
                onClick={() => {
                  setIsPinnedOpen((current) => !current);
                  setIsHoverOpen(false);
                }}
                className={`flex h-6 w-6 items-center justify-center rounded-full transition focus:outline-none ${
                  isInfoOpen
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                }`}
              >
                <Info className="h-4 w-4" />
              </button>

              {isInfoOpen && (
                <div className="absolute left-0 top-8 z-50 w-[290px] rounded-xl border border-[var(--color-border-light)] bg-white p-4 text-left shadow-2xl sm:w-[340px]">
                  <div className="text-xs font-normal normal-case tracking-normal text-[var(--color-text-main)]">
                    {info}
                  </div>

                  {isPinnedOpen && (
                    <button
                      type="button"
                      onClick={() => setIsPinnedOpen(false)}
                      className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-danger)]"
                    >
                      Close
                    </button>
                  )}

                  <span className="absolute -top-1.5 left-3 h-3 w-3 rotate-45 border-l border-t border-[var(--color-border-light)] bg-white" />
                </div>
              )}
            </div>
          )}
        </div>

        <Icon className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <p className="break-words text-sm font-bold text-[var(--color-text-main)]">
          {getDisplayValue(value)}
        </p>

        {verified && (
          <span
            title={verifiedLabel}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
          >
            <BadgeCheck className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
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
        className="w-full rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(23,77,52,0.08)]"
      />
    </div>
  );
}

function StateDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedState = getStateOption(value);

  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        State
      </label>

      <div
        className="relative"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsOpen(false);
          }
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(23,77,52,0.08)]"
        >
          <span>
            {selectedState
              ? `${selectedState.name} (${selectedState.code})`
              : "Select state"}
          </span>

          <ChevronDown
            className={`h-4 w-4 text-[var(--color-text-muted)] transition ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 max-h-[260px] w-full overflow-y-auto rounded-xl border border-[var(--color-border-light)] bg-white py-2 shadow-xl">
            {STATE_OPTIONS.map((state) => {
              const active = state.code === value;

              return (
                <button
                  key={state.code}
                  type="button"
                  onClick={() => {
                    onChange(state.code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                    active
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-text-main)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                  }`}
                >
                  <span>{state.name}</span>
                  <span
                    className={
                      active ? "text-white" : "text-[var(--color-text-muted)]"
                    }
                  >
                    {state.code}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data, isLoading, refetch, isFetching } = useGetMeQuery();

  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();

  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const profile = getApiPayload(data);

  const [isEditing, setIsEditing] = useState(false);

  const [fullName, setFullName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [dob, setDob] = useState("");

  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const role = normalizeRole(profile?.role);
  const isAdmin = role === "admin";
  const isPartner = isAllowedRole(role, PARTNER_ROLES);
  const isRealtor = isAllowedRole(role, REALTOR_ROLES);

  const displayName = profile?.full_name || profile?.email || "User";

  const kycStatus = isAdmin ? undefined : profile?.kyc_status || "pending";

  const normalizedKycStatus = String(kycStatus || "").toLowerCase();

  const isKycVerified =
    !isAdmin && ["verified", "approved"].includes(normalizedKycStatus);

  useEffect(() => {
    if (!profile) return;

    setFullName(profile?.full_name || "");
    setStateCode(normalizeStateCode(profile?.state_code));
    setDob(formatDateForInput(profile?.dob));
  }, [profile]);

  function openEditMode() {
    setProfileError(null);
    setProfileSuccess(null);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setFullName(profile?.full_name || "");
    setStateCode(normalizeStateCode(profile?.state_code));
    setDob(formatDateForInput(profile?.dob));

    setProfileError(null);
    setProfileSuccess(null);
    setIsEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const normalizedState = normalizeStateCode(stateCode);

    if (!trimmedName) {
      setProfileError("Full name is required.");
      return;
    }

    if (!normalizedState) {
      setProfileError("State code is required.");
      return;
    }

    if (!getStateOption(normalizedState)) {
      setProfileError("Please select a valid state.");
      return;
    }

    try {
      setProfileError(null);
      setProfileSuccess(null);

      await updateMe({
        full_name: trimmedName,
        state_code: normalizedState,
        dob: dob || undefined,
      }).unwrap();

      setProfileSuccess("Profile updated successfully.");
      setIsEditing(false);

      await refetch();
    } catch (error: any) {
      setProfileError(getErrorMessage(error, "Unable to update profile."));
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword.trim()) {
      setPasswordError("Current password is required.");
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError("New password is required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password should be different from current password."
      );
      return;
    }

    try {
      setPasswordError(null);
      setPasswordSuccess(null);

      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      }).unwrap();

      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordError(getErrorMessage(error, "Unable to change password."));
    }
  }

  if (isLoading) {
    return <DetailPageSkeleton />;
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
            change your password.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-light)] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          {!isEditing && (
            <button
              type="button"
              onClick={openEditMode}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] font-serif text-xl font-black text-[var(--color-secondary)] ring-2 ring-[var(--color-secondary)]/30">
              {getInitials(displayName)}
            </div>

            <div className="min-w-0">
              <h2 className="break-words font-serif text-2xl font-black text-[var(--color-primary)]">
                {displayName}
              </h2>

              <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                {formatRole(profile?.role)}
              </p>
            </div>
          </div>

          {!isAdmin && (
            <StatusBadge
              label={formatKycStatus(kycStatus)}
              variant={getKycVariant(kycStatus)}
            />
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Full Name" value={profile?.full_name} icon={User} />

        <DetailCard label="Email" value={profile?.email} icon={Mail} />

        <DetailCard label="Phone" value={getPhone(profile)} icon={Phone} />

        <DetailCard
          label="Role"
          value={formatRole(profile?.role)}
          icon={ShieldCheck}
        />
      </section>

      <section
        className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${
          isAdmin ? "xl:grid-cols-2" : "xl:grid-cols-4"
        }`}
      >
        <DetailCard
          label="State"
          value={getStateDisplayValue(profile?.state_code)}
          icon={BadgeCheck}
        />

        <DetailCard
          label="Date of Birth"
          value={formatDate(profile?.dob)}
          icon={Calendar}
        />

        {!isAdmin && (
          <>
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
          </>
        )}
      </section>

      {!isAdmin && (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <DetailCard
            label="Reliability Score"
            value={profile?.reliability_score}
            icon={Star}
            info={
              <div className="space-y-3">
                <div>
                  <p className="font-black text-[var(--color-primary)]">
                    What does this score mean?
                  </p>

                  <p className="mt-1 leading-5 text-[var(--color-text-muted)]">
                    Reliability Score measures whether a wholesaler or private
                    partner responds on time, uploads required proof, completes
                    inspection, and proceeds toward closing.
                  </p>
                </div>

                <div>
                  <p className="font-black text-[var(--color-primary)]">
                    How is it calculated?
                  </p>

                  <p className="mt-1 leading-5 text-[var(--color-text-muted)]">
                    Every partner starts with a score of 100. The score is
                    reduced when deal responsibilities are not completed.
                  </p>
                </div>

                <div className="space-y-1 rounded-lg bg-[var(--color-bg-soft)] p-3">
                  <div className="flex justify-between gap-4">
                    <span>Ghosting</span>
                    <strong className="text-[var(--color-danger)]">-10</strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Inspection cancellation</span>
                    <strong className="text-[var(--color-danger)]">-20</strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Missed deadline</span>
                    <strong className="text-[var(--color-danger)]">-15</strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Failure to proceed to closing</span>
                    <strong className="text-[var(--color-danger)]">-20</strong>
                  </div>
                </div>

                <div className="border-t border-[var(--color-border-light)] pt-3 leading-5 text-[var(--color-text-muted)]">
                  <p>
                    <strong className="text-[var(--color-text-main)]">
                      Below 50:
                    </strong>{" "}
                    access to new deals may be delayed for 48 hours.
                  </p>

                  <p className="mt-1">
                    <strong className="text-[var(--color-text-main)]">
                      Below 30:
                    </strong>{" "}
                    the account may be banned or require reinstatement.
                  </p>
                </div>
              </div>
            }
          />

          <DetailCard
            label="Professional Score"
            value={profile?.professional_score}
            icon={ShieldCheck}
            info={
              <div className="space-y-3">
                <div>
                  <p className="font-black text-[var(--color-primary)]">
                    What does this score mean?
                  </p>

                  <p className="mt-1 leading-5 text-[var(--color-text-muted)]">
                    Professional Score measures how professionally a partner
                    behaves during communication, proof submission, inspection,
                    and closing steps.
                  </p>
                </div>

                <div className="space-y-1 rounded-lg bg-[var(--color-bg-soft)] p-3">
                  <div className="flex justify-between gap-4">
                    <span>Unprofessional communication</span>
                    <strong className="text-[var(--color-danger)]">-10</strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Missing required proof</span>
                    <strong className="text-[var(--color-danger)]">-15</strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Repeated failed follow-up</span>
                    <strong className="text-[var(--color-danger)]">-20</strong>
                  </div>
                </div>
              </div>
            }
          />
        </section>
      )}

      <section
        className={`grid grid-cols-1 gap-6 ${
          isAdmin ? "" : "xl:grid-cols-2"
        }`}
      >
        {!isAdmin && (
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
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white"
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
        )}

        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                Update Profile
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                You can update full name, state code, and date of birth.
              </p>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isUpdating}
                aria-label="Cancel profile editing"
                className="rounded-lg p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)] disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {profileError && (
            <div className="mb-5 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="mb-5 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 p-4 text-sm font-semibold text-[var(--color-primary)]">
              {profileSuccess}
            </div>
          )}

          {!isEditing && (
            <button
              type="button"
              onClick={openEditMode}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          )}

          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Full Name"
                value={fullName}
                onChange={setFullName}
                placeholder="Enter full name"
              />

              <StateDropdown value={stateCode} onChange={setStateCode} />

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
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="rounded-xl border border-[var(--color-border-light)] bg-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {isPartner && (
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="mb-5">
              <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                Proof of Activity
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Upload recent transaction history or proof of funds to unlock
                full deal access.
              </p>
            </div>

            <Link
              to="/proof-of-activity"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white"
            >
              <FileText className="h-4 w-4" />
              Upload Proof of Activity
            </Link>
          </div>
        )}

        {isRealtor && (
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="mb-5">
              <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                Professional Verification
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Submit your State License Number, Brokerage Name, and Managing
                Broker details for admin review to unlock property access.
              </p>
            </div>

            <Link
              to="/realtor-verification"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white"
            >
              <BadgeCheck className="h-4 w-4" />
              Submit Credentials
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 font-serif text-xl font-black text-[var(--color-primary)]">
            <KeyRound className="h-5 w-5 text-[var(--color-secondary)]" />
            Change Password
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Enter your current password and choose a new password with at least
            8 characters.
          </p>
        </div>

        {passwordError && (
          <div className="mb-5 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-5 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 p-4 text-sm font-semibold text-[var(--color-primary)]">
            {passwordSuccess}
          </div>
        )}

        <form
          onSubmit={handlePasswordSubmit}
          className="grid grid-cols-1 gap-5 lg:grid-cols-3"
        >
          <InputField
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Enter current password"
          />

          <InputField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Minimum 8 characters"
          />

          <InputField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter new password"
          />

          <div className="lg:col-span-3">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" />
              {isChangingPassword ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}