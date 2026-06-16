import { useState } from "react";
import { useParams } from "react-router";
import {
  Ban,
  MapPin,
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

function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-[var(--color-text-main)]">
        {displayValue(value)}
      </p>
    </div>
  );
}

function SectionBlock({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          {icon}
        </div>

        <div>
          <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function getDoc(value: any) {
  return value?.data?._doc ?? value?._doc ?? value?.data ?? value;
}

function getPhone(user: any) {
  const doc = getDoc(user);

  return (
    doc?.phone ||
    doc?.phone_number ||
    doc?.phoneNumber ||
    doc?.mobile ||
    doc?.mobile_number ||
    "-"
  );
}

function getAddressObject(user: any) {
  const doc = getDoc(user);

  if (doc?.address && typeof doc.address === "object") {
    return doc.address;
  }

  if (doc?.location && typeof doc.location === "object") {
    return doc.location;
  }

  if (doc?.profile && typeof doc.profile === "object") {
    return doc.profile;
  }

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
  const street = getStreetAddress(user);
  const addressLine2 = getAddressLine2(user);
  const city = getCity(user);
  const state = getState(user);
  const zipCode = getZipCode(user);
  const country = getCountry(user);

  const parts = [
    street !== "-" ? street : "",
    addressLine2 !== "-" ? addressLine2 : "",
    city !== "-" ? city : "",
    state !== "-" ? state : "",
    zipCode !== "-" ? zipCode : "",
    country !== "-" ? country : "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "-";
}

function AdminUserDetailsPage() {
  const { id = "" } = useParams();
  const [banReason, setBanReason] = useState("");
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);

  const {
    data: user,
    isLoading,
    isError,
  } = useGetAdminUserQuery(id, {
    skip: !id,
  });

  const [banUser, { isLoading: isBanning }] = useBanAdminUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanAdminUserMutation();

  async function handleBan() {
    if (!user || banReason.trim().length < 3) return;

    await banUser({
      id: getMongoId(user),
      reason: banReason.trim(),
    }).unwrap();

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
      <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
        Failed to load user details.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
              Admin User Review
            </p>

            <h1 className="mt-2 font-serif text-3xl font-black text-[var(--color-primary)]">
              {getPersonName(user)}
            </h1>

            <p className="mt-2 break-words text-sm text-[var(--color-text-muted)]">
              {user.email || "-"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge label={user.role || "unknown"} variant="neutral" />

              <StatusBadge
                label={user.kyc_status || "unknown"}
                variant={getStatusVariant(user.kyc_status)}
              />

              <StatusBadge
                label={user.is_banned ? "Banned" : "Active"}
                variant={user.is_banned ? "danger" : "success"}
              />
            </div>
          </div>

          {user.is_banned ? (
            <Button
              type="button"
              variant="outline"
              isLoading={isUnbanning}
              onClick={handleUnban}
            >
              <RotateCcw className="h-4 w-4" />
              Unban User
            </Button>
          ) : (
            <Button
              type="button"
              variant="danger"
              onClick={() => setIsBanModalOpen(true)}
            >
              <Ban className="h-4 w-4" />
              Ban User
            </Button>
          )}
        </div>
      </div>

      <SectionBlock
        title="Basic Info"
        description="Main account identity and contact details."
        icon={<UserRound className="h-5 w-5" />}
      >
        <DetailItem label="Full Name" value={getPersonName(user)} />
        <DetailItem label="Email" value={user.email} />
        <DetailItem label="Phone" value={getPhone(user)} />
        <DetailItem label="User ID" value={getMongoId(user)} />
      </SectionBlock>

      <SectionBlock
        title="Address Info"
        description="User address and state information from registration/profile."
        icon={<MapPin className="h-5 w-5" />}
      >
        <DetailItem label="Street Address" value={getStreetAddress(user)} />
        <DetailItem label="Address Line 2" value={getAddressLine2(user)} />
        <DetailItem label="City" value={getCity(user)} />
        <DetailItem label="State" value={getState(user)} />
        <DetailItem label="Zip Code" value={getZipCode(user)} />
        <DetailItem label="Country" value={getCountry(user)} />
        <DetailItem label="Full Address" value={getFullAddress(user)} />
      </SectionBlock>

      <SectionBlock
        title="Account Status"
        description="Role, KYC status, ban status, and audit dates."
        icon={<ShieldCheck className="h-5 w-5" />}
      >
        <DetailItem label="Role" value={user.role} />
        <DetailItem label="KYC Status" value={user.kyc_status} />
        <DetailItem label="Ban Status" value={user.is_banned ? "Banned" : "Active"} />
        <DetailItem label="Ban Reason" value={user.ban_reason} />
        <DetailItem label="Created At" value={formatDate(user.createdAt)} />
        <DetailItem label="Updated At" value={formatDate(user.updatedAt)} />
      </SectionBlock>

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