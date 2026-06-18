import { useState } from "react";
import { useParams } from "react-router";
import {
  Ban,
  CalendarClock,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
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
} from "../../utils/adminUtils";

const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};

// ─── Detail Item ─────────────────────────────────────────────────────────────

function DetailItem({
  label,
  value,
  icon: Icon,
  children,
}: {
  label: string;
  value?: any;
  icon?: any;
  children?: React.ReactNode;
}) {
  return (
    <div className="group flex h-full flex-col gap-1.5 rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3.5 transition hover:border-[var(--color-primary)]/20 hover:shadow-sm">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-[var(--color-primary)]/50" />}
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {label}
        </p>
      </div>
      <div className="text-sm font-semibold text-[var(--color-text-main)] leading-snug break-words">
        {children ?? displayValue(value)}
      </div>
    </div>
  );
}

// ─── Section Block ────────────────────────────────────────────────────────────

function SectionBlock({
  title,
  description,
  icon,
  children,
  cols = 3,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const colClass =
    cols === 4
      ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      : cols === 2
      ? "grid-cols-2"
      : "grid-cols-2 md:grid-cols-3";

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3 pb-1 border-b border-[var(--color-border-light)]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          {icon}
        </div>
        <div>
          <h2 className="font-serif text-lg font-black text-[var(--color-primary)] leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className={`grid gap-3 auto-rows-fr ${colClass}`}>{children}</div>
    </section>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  icon: any;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 ${
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
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          {label}
        </p>
        <div
          className={`mt-0.5 truncate text-sm font-bold ${
            accent ? "text-[var(--color-primary)]" : "text-[var(--color-text-main)]"
          }`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function UserAvatar({ name, isBanned }: { name: string; isBanned: boolean }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  return (
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white shadow-sm ${
        isBanned ? "bg-[var(--color-danger)]" : "bg-[var(--color-primary)]"
      }`}
    >
      {initials || <UserRound className="h-6 w-6" />}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDoc(value: any) {
  return value?.data?._doc ?? value?._doc ?? value?.data ?? value;
}

function getPhone(user: any) {
  const doc = getDoc(user);
  return (
    doc?.phone || "-"
  );
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
    addressDoc?.street_address || addressDoc?.streetAddress ||
    addressDoc?.address_line_1 || addressDoc?.addressLine1 ||
    addressDoc?.address || doc?.street_address || doc?.streetAddress ||
    doc?.address_line_1 || doc?.addressLine1 || "-"
  );
}

function getAddressLine2(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);
  return (
    addressDoc?.address_line_2 || addressDoc?.addressLine2 ||
    addressDoc?.apartment || addressDoc?.unit ||
    doc?.address_line_2 || doc?.addressLine2 || doc?.apartment || doc?.unit || "-"
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
    addressDoc?.state || addressDoc?.state_name || addressDoc?.stateName ||
    addressDoc?.state_code || addressDoc?.stateCode ||
    doc?.state || doc?.state_name || doc?.stateName ||
    doc?.state_code || doc?.stateCode || ""
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
    addressDoc?.zip_code || addressDoc?.zipCode ||
    addressDoc?.postal_code || addressDoc?.postalCode ||
    doc?.zip_code || doc?.zipCode || doc?.postal_code || doc?.postalCode || "-"
  );
}

function getCountry(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);
  return addressDoc?.country || doc?.country || "-";
}

function getFullAddress(user: any) {
  const parts = [
    getStreetAddress(user), getAddressLine2(user), getCity(user),
    getState(user), getZipCode(user), getCountry(user),
  ].filter((p) => p && p !== "-");
  return parts.length > 0 ? parts.join(", ") : "-";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminUserDetailsPage() {
  const { id = "" } = useParams();
  const [banReason, setBanReason] = useState("");
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);

  const { data: user, isLoading, isError } = useGetAdminUserQuery(id, { skip: !id });

  const [banUser, { isLoading: isBanning }] = useBanAdminUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanAdminUserMutation();

  async function handleBan() {
    if (!user || banReason.trim().length < 3) return;
    await banUser({ id: getMongoId(user), reason: banReason.trim() }).unwrap();
    setIsBanModalOpen(false);
    setBanReason("");
  }

  async function handleUnban() {
    if (!user) return;
    await unbanUser(getMongoId(user)).unwrap();
  }

  if (isLoading) return <Loader label="Loading user details..." />;

  if (isError || !user) {
    return (
      <div className="rounded-xl bg-white p-5 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
        Failed to load user details.
      </div>
    );
  }

  const fullName = getPersonName(user);
  const fullAddress = getFullAddress(user);

  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

          {/* Left: avatar + name + contact */}
          <div className="flex items-start gap-4">
            <UserAvatar name={fullName} isBanned={user.is_banned} />
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--color-secondary)]">
                Admin · User Review
              </p>
              <h1 className="mt-1 font-serif text-2xl font-black leading-tight text-[var(--color-primary)] md:text-3xl">
                {fullName}
              </h1>
              {user.email && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {user.email}
                </p>
              )}
              {getPhone(user) !== "-" && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {getPhone(user)}
                </p>
              )}
              {fullAddress !== "-" && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {fullAddress}
                </p>
              )}
              {/* <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge label={user.role || "unknown"} variant="neutral" />
                <StatusBadge
                  label={user.kyc_status || "unknown"}
                  variant={getStatusVariant(user.kyc_status)}
                />
                <StatusBadge
                  label={user.is_banned ? "Banned" : "Active"}
                  variant={user.is_banned ? "danger" : "success"}
                />
              </div> */}
            </div>
          </div>

          {/* Right: action button */}
          <div className="shrink-0">
            {user.is_banned ? (
              <Button type="button" variant="outline" isLoading={isUnbanning} onClick={handleUnban}>
                <RotateCcw className="h-4 w-4" />
                Unban User
              </Button>
            ) : (
              <Button type="button" variant="danger" onClick={() => setIsBanModalOpen(true)}>
                <Ban className="h-4 w-4" />
                Ban User
              </Button>
            )}
          </div>
        </div>

        {/* Stat row */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-border-light)] pt-4 sm:grid-cols-4">
          {/* <StatCard label="User ID" value={getMongoId(user) || "-"} icon={UserRound} /> */}
          <StatCard
            label="Role"
            value={user.role || "-"}
            icon={ShieldCheck}
            accent
          />
          <StatCard label="KYC Status" value={user.kyc_status || "-"} icon={ShieldCheck} />
          <StatCard
            label="Account"
            value={user.is_banned ? "Banned" : "Active"}
            icon={user.is_banned ? Ban : ShieldCheck}
          />
        </div>
      </div>

      {/* ── Two-column: Contact + Address ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Contact Info */}
        <SectionBlock
          title="Contact"
          description="Primary contact details for this user."
          icon={<UserRound className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Full Name" value={fullName} />
          <DetailItem label="User ID" value={getMongoId(user)} />
          <DetailItem label="Email" value={user.email} icon={Mail} />
          <DetailItem label="Phone" value={getPhone(user)} icon={Phone} />
        </SectionBlock>

        {/* Address Info */}
        <SectionBlock
          title="Address"
          description="Registered address from user profile."
          icon={<MapPin className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Street" value={getStreetAddress(user)} />
          <DetailItem label="Line 2" value={getAddressLine2(user)} />
          <DetailItem label="City" value={getCity(user)} />
          <DetailItem label="State" value={getState(user)} />
          <DetailItem label="Zip Code" value={getZipCode(user)} />
          <DetailItem label="Country" value={getCountry(user)} />
        </SectionBlock>
      </div>

      {/* ── Account Status + Timeline ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Account Status */}
        <SectionBlock
          title="Account Status"
          description="Role, KYC, and ban information."
          icon={<ShieldCheck className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Role" value={user.role} />
          <DetailItem label="KYC Status">
            <StatusBadge
              label={user.kyc_status || "unknown"}
              variant={getStatusVariant(user.kyc_status)}
            />
          </DetailItem>
          <DetailItem label="Account Status">
            <StatusBadge
              label={user.is_banned ? "Banned" : "Active"}
              variant={user.is_banned ? "danger" : "success"}
            />
          </DetailItem>
          <DetailItem label="Ban Reason" value={user.ban_reason} />
        </SectionBlock>

        {/* Timeline */}
        <SectionBlock
          title="Timeline"
          description="Account creation and update history."
          icon={<CalendarClock className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Created At" value={formatDate(user.createdAt)} />
          <DetailItem label="Updated At" value={formatDate(user.updatedAt)} />
        </SectionBlock>
      </div>

      <ConfirmModal
        isOpen={isBanModalOpen}
        variant="danger"
        title="Ban user?"
        description="This user will be blocked from platform access until admin removes the ban."
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
        <textarea
          value={banReason}
          onChange={(event) => setBanReason(event.target.value)}
          rows={4}
          placeholder="Enter ban reason..."
          className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)]"
        />
      </ConfirmModal>
    </div>
  );
}

export default AdminUserDetailsPage;