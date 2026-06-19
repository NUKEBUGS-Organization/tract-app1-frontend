import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Ban,
  CalendarClock,
  Clock3,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useBanAdminUserMutation,
  useGetAdminUserQuery,
  useUnbanAdminUserMutation,
} from "../../services/adminService";

import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import {
  displayValue,
  formatDate,
  getMongoId,
  getPersonName,
  getStatusVariant,
  normalizeValue,
} from "../../utils/adminUtils";

const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

function getDoc(value: any) {
  return (
    value?.data?.data?._doc ??
    value?.data?._doc ??
    value?._doc ??
    value?.data?.data ??
    value?.data ??
    value
  );
}

function formatLabel(value: string) {
  if (!value) return "-";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function hasReadableValue(value: any) {
  return value !== undefined && value !== null && value !== "" && value !== "-";
}

function getEmail(user: any) {
  const doc = getDoc(user);
  return doc?.email || "-";
}

function getPhone(user: any) {
  const doc = getDoc(user);

  return doc?.phone || doc?.phone_number || doc?.phoneNumber || "-";
}

function getRole(user: any) {
  const doc = getDoc(user);

  return doc?.role || "unknown";
}

function getKycStatus(user: any) {
  const doc = getDoc(user);

  return doc?.kyc_status || doc?.kycStatus || "unknown";
}

function getBanReason(user: any) {
  const doc = getDoc(user);

  return doc?.ban_reason || doc?.banReason || "-";
}

function getCreatedAt(user: any) {
  const doc = getDoc(user);

  return doc?.createdAt;
}

function getUpdatedAt(user: any) {
  const doc = getDoc(user);

  return doc?.updatedAt;
}

function getAddressObject(user: any) {
  const doc = getDoc(user);

  if (doc?.address && typeof doc.address === "object") return doc.address;
  if (doc?.location && typeof doc.location === "object") return doc.location;
  if (doc?.profile && typeof doc.profile === "object") return doc.profile;

  return doc;
}

function getStreetAddress(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);

  if (typeof doc?.address === "string") return doc.address;

  return (
    addressDoc?.street_address ||
    addressDoc?.streetAddress ||
    addressDoc?.address_line_1 ||
    addressDoc?.addressLine1 ||
    addressDoc?.address ||
    doc?.street_address ||
    doc?.streetAddress ||
    doc?.address_line_1 ||
    doc?.addressLine1 ||
    "-"
  );
}

function getAddressLine2(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);

  return (
    addressDoc?.address_line_2 ||
    addressDoc?.addressLine2 ||
    addressDoc?.apartment ||
    addressDoc?.unit ||
    doc?.address_line_2 ||
    doc?.addressLine2 ||
    doc?.apartment ||
    doc?.unit ||
    "-"
  );
}

function getCity(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);

  return addressDoc?.city || doc?.city || "-";
}

function getRawState(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);

  return (
    addressDoc?.state ||
    addressDoc?.state_name ||
    addressDoc?.stateName ||
    addressDoc?.state_code ||
    addressDoc?.stateCode ||
    doc?.state ||
    doc?.state_name ||
    doc?.stateName ||
    doc?.state_code ||
    doc?.stateCode ||
    ""
  );
}

function getState(user: any) {
  const rawState = getRawState(user);

  if (!rawState) return "-";

  const upperState = rawState.toString().trim().toUpperCase();

  return US_STATE_NAMES[upperState] || rawState;
}

function getZipCode(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);

  return (
    addressDoc?.zip_code ||
    addressDoc?.zipCode ||
    addressDoc?.postal_code ||
    addressDoc?.postalCode ||
    doc?.zip_code ||
    doc?.zipCode ||
    doc?.postal_code ||
    doc?.postalCode ||
    "-"
  );
}

function getCountry(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);

  return addressDoc?.country || doc?.country || "-";
}

function getFullAddress(user: any) {
  const parts = [
    getStreetAddress(user),
    getAddressLine2(user),
    getCity(user),
    getState(user),
    getZipCode(user),
    getCountry(user),
  ].filter((part) => hasReadableValue(part));

  return parts.length > 0 ? parts.join(", ") : "-";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function UserAvatar({ name, isBanned }: { name: string; isBanned: boolean }) {
  const initials = getInitials(name);

  return (
    <div
      className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-xl font-black text-white shadow-lg sm:h-20 sm:w-20 ${isBanned ? "bg-[var(--color-danger)]" : "bg-[var(--color-primary)]"
        }`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-white/10" />

      {initials || <UserRound className="h-8 w-8" aria-hidden="true" />}

      <span
        className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white ${isBanned ? "bg-[var(--color-danger)]" : "bg-[var(--color-primary)]"
          }`}
      />
    </div>
  );
}

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
      className={`group min-w-0 rounded-2xl border px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-secondary)]/40 hover:shadow-sm ${featured
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
        className={`mt-1.5 break-words text-sm font-bold leading-6 ${featured
            ? "text-[var(--color-primary)]"
            : "text-[var(--color-text-main)]"
          }`}
      >
        {children ?? displayValue(value)}
      </div>
    </div>
  );
}

function SectionBlock({
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
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-lg sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
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
        className={`grid grid-cols-1 gap-3 ${columns === "compact"
            ? "sm:grid-cols-1"
            : "sm:grid-cols-2 xl:grid-cols-3"
          }`}
      >
        {children}
      </div>
    </section>
  );
}

function AdminControlPanel({
  user,
  isUnbanning,
  onBanClick,
  onUnban,
}: {
  user: any;
  isUnbanning: boolean;
  onBanClick: () => void;
  onUnban: () => void;
}) {
  const isBanned = Boolean(user?.is_banned);
  const banReason = getBanReason(user);

  return (
    <aside className="rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)] xl:sticky xl:top-6">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isBanned
              ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
              : "bg-[var(--color-primary)]/8 text-[var(--color-primary)]"
            }`}
        >
          {isBanned ? (
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          ) : (
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="font-serif text-lg font-black text-[var(--color-primary)]">
            Admin Control
          </h2>

          <p className="mt-1 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
            Manage user access.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Access
          </p>

          <div className="mt-1">
            <StatusBadge
              label={isBanned ? "Banned" : "Active"}
              variant={isBanned ? "danger" : "success"}
            />
          </div>
        </div>
      </div>

      {isBanned && banReason !== "-" && (
        <div className="mt-3 rounded-2xl border border-[var(--color-danger)]/15 bg-[var(--color-danger)]/5 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-danger)]">
            Ban Reason
          </p>

          <p className="mt-1 text-sm font-semibold leading-6 text-[var(--color-text-main)]">
            {banReason}
          </p>
        </div>
      )}

      <div className="mt-4">
        {isBanned ? (
          <Button
            type="button"
            variant="outline"
            isLoading={isUnbanning}
            onClick={onUnban}
            className="w-full justify-center py-2.5 text-xs"
          >
            <RotateCcw className="h-4 w-4" />
            Unban User
          </Button>
        ) : (
          <Button
            type="button"
            variant="danger"
            onClick={onBanClick}
            className="w-full justify-center py-2.5 text-xs"
          >
            <Ban className="h-4 w-4" />
            Ban User
          </Button>
        )}
      </div>
    </aside>
  );
}

function AdminUserDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [banReason, setBanReason] = useState("");
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);

  const {
    data: userResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAdminUserQuery(id, { skip: !id });

  const [banUser, { isLoading: isBanning }] = useBanAdminUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanAdminUserMutation();

  const user = getDoc(userResponse);

  async function handleBan() {
    if (!user || banReason.trim().length < 3) return;

    await banUser({
      id: getMongoId(user),
      reason: banReason.trim(),
    }).unwrap();

    setIsBanModalOpen(false);
    setBanReason("");
    refetch();
  }

  async function handleUnban() {
    if (!user) return;

    await unbanUser(getMongoId(user)).unwrap();

    refetch();
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
        <Loader label="Loading user details..." />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-base font-black text-[var(--color-danger)]">
          Failed to load user details
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
          The user could not be loaded. Please go back and try again.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/users")}
          className="mt-4 justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  const fullName = getPersonName(user);
  const email = getEmail(user);
  const phone = getPhone(user);
  const fullAddress = getFullAddress(user);
  const role = normalizeValue(getRole(user));
  const kycStatus = normalizeValue(getKycStatus(user));
  const isBanned = Boolean(user.is_banned);

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <button
        type="button"
        onClick={() => navigate("/users")}
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] shadow-sm transition hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Users
      </button>

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">

        <main className="min-w-0 space-y-6">
          <SectionBlock
            title="Contact"
            description="Primary contact details for this user."
            icon={<Mail className="h-5 w-5" aria-hidden="true" />}
          >
            <DetailItem label="Full Name" value={fullName} featured />

            <DetailItem
              label="Email"
              value={email}
              icon={<Mail className="h-3.5 w-3.5" aria-hidden="true" />}
            />

            <DetailItem
              label="Phone"
              value={phone}
              icon={<Phone className="h-3.5 w-3.5" aria-hidden="true" />}
            />

            <DetailItem label="Role" value={formatLabel(role)} />
          </SectionBlock>

          <SectionBlock
            title="Address"
            description={
              fullAddress === "-"
                ? "No registered address is available for this user."
                : "Registered address from the user profile."
            }
            icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
          >
            <DetailItem label="Street Address" value={getStreetAddress(user)} />

            <DetailItem label="City" value={getCity(user)} />

            <DetailItem label="State" value={getState(user)} />

            <DetailItem label="Zip Code" value={getZipCode(user)} />

            <DetailItem label="Country" value={getCountry(user)} />

            <DetailItem label="Full Address" value={fullAddress} featured />
          </SectionBlock>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionBlock
              title="Account Status"
              description="Role, KYC, and access information."
              icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
              columns="compact"
            >
              <DetailItem label="Role" value={formatLabel(role)} />

              <DetailItem label="KYC Status">
                <StatusBadge
                  label={formatLabel(kycStatus)}
                  variant={getStatusVariant(kycStatus)}
                />
              </DetailItem>

              <DetailItem label="Account Access">
                <StatusBadge
                  label={isBanned ? "Banned" : "Active"}
                  variant={isBanned ? "danger" : "success"}
                />
              </DetailItem>

              {isBanned && getBanReason(user) !== "-" && (
                <DetailItem label="Ban Reason" value={getBanReason(user)} />
              )}
            </SectionBlock>

            <SectionBlock
              title="Timeline"
              description="Account creation and latest profile update."
              icon={<CalendarClock className="h-5 w-5" aria-hidden="true" />}
              columns="compact"
            >
              <DetailItem
                label="Created"
                value={formatDate(getCreatedAt(user))}
                icon={
                  <CalendarClock
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                }
              />

              <DetailItem
                label="Last Updated"
                value={formatDate(getUpdatedAt(user))}
                icon={<Clock3 className="h-3.5 w-3.5" aria-hidden="true" />}
              />
            </SectionBlock>
          </div>
        </main>

        <AdminControlPanel
          user={user}
          isUnbanning={isUnbanning}
          onBanClick={() => setIsBanModalOpen(true)}
          onUnban={handleUnban}
        />
      </div>

      <ConfirmModal
        isOpen={isBanModalOpen}
        variant="danger"
        title="Ban user?"
        description={`This will block ${fullName} from platform access until an admin removes the ban.`}
        icon={<Ban className="h-5 w-5" />}
        confirmLabel="Ban User"
        loadingLabel="Banning..."
        isLoading={isBanning}
        onCancel={() => {
          setIsBanModalOpen(false);
          setBanReason("");
        }}
        onConfirm={handleBan}
      >
        <div>
          <label
            htmlFor="user-ban-reason"
            className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]"
          >
            Ban reason
          </label>

          <textarea
            id="user-ban-reason"
            value={banReason}
            onChange={(event) => setBanReason(event.target.value)}
            rows={4}
            placeholder="Enter ban reason..."
            className="w-full resize-none rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />

          <p className="mt-2 text-xs font-semibold text-[var(--color-text-muted)]">
            Minimum 3 characters are required before this action can be
            submitted.
          </p>
        </div>
      </ConfirmModal>
    </div>
  );
}

export default AdminUserDetailsPage;