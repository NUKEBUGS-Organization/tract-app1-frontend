// src/pages/admin/AdminBidDetailsPage.tsx

import type { ReactNode } from "react";
import { useLocation, useParams } from "react-router";
import {
  CalendarClock,
  DollarSign,
  Gavel,
  Home,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  useGetAdminBidQuery,
  useGetAdminListingQuery,
  useGetAdminUserQuery,
} from "../../services/adminService";

import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import {
  displayValue,
  formatDate,
  formatMoney,
  getApiDoc,
  getMongoId,
  getPersonName,
  getStatusVariant,
} from "../../utils/adminUtils";

function DetailItem({
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
  cols = 3,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const colClass =
    cols === 4
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      : cols === 2
        ? "grid-cols-1 sm:grid-cols-2"
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

      <div className={`grid items-start gap-3 ${colClass}`}>{children}</div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
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

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          {label}
        </p>

        <p
          className={`mt-0.5 truncate text-sm font-bold ${
            accent
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-text-main)]"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function getId(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value;

  return value._id || "";
}

function getEmail(value: any) {
  return value?.email || "-";
}

function getPhone(value: any) {
  return value?.phone || "-";
}

function getBidPrice(bid: any) {
  return bid?.bid_price ?? null;
}

function getListingIdFromBid(bid: any) {
  return getId(bid?.property_id);
}

function getPropertyAddress(property: any) {
  if (!property || typeof property !== "object") return "-";

  const address = [
    property.address,
    property.city,
    property.state_code,
    property.zip_code,
  ]
    .filter(Boolean)
    .join(", ");

  return address || "-";
}

function getPropertyName(property: any) {
  if (!property || typeof property !== "object") return "-";

  return property.address || "-";
}

function AdminBidDetailsPage() {
  const { id = "" } = useParams();
  const location = useLocation();

  const stateBid = (location.state as any)?.bid ?? null;

  const {
    data: apiBidResponse,
    isLoading: isBidLoading,
    isError: isBidError,
  } = useGetAdminBidQuery(id, {
    skip: !id,
  });

  const apiBid = getApiDoc(apiBidResponse);
  const bid = apiBid || stateBid;

  const listingId = getListingIdFromBid(bid);

  const stateProperty =
    stateBid?.property_id && typeof stateBid.property_id === "object"
      ? stateBid.property_id
      : null;

  const {
    data: listingResponse,
    isLoading: isListingLoading,
    isError: isListingError,
  } = useGetAdminListingQuery(listingId, {
    skip: !listingId,
  });

  const apiListing = getApiDoc(listingResponse);
  const property = apiListing || stateProperty;

  const sellerId = getId(property?.seller_id);
  const buyerId = getId(bid?.bidder_id);

  const { data: sellerResponse } = useGetAdminUserQuery(sellerId, {
    skip: !sellerId,
  });

  const { data: buyerResponse } = useGetAdminUserQuery(buyerId, {
    skip: !buyerId,
  });

  const seller = getApiDoc(sellerResponse) || null;
  const buyer = getApiDoc(buyerResponse) || bid?.bidder_id || null;

  if (isBidLoading && !bid) {
    return <Loader label="Loading bid details..." />;
  }

  if ((isBidError && !bid) || !bid) {
    return (
      <div className="rounded-xl bg-white p-5 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
        Failed to load bid details.
      </div>
    );
  }

  const bidAmount = getBidPrice(bid);

  const propertyDisplay = isListingLoading
    ? stateProperty
      ? getPropertyName(stateProperty)
      : "Loading property..."
    : isListingError
      ? listingId || "-"
      : getPropertyName(property);

  const propertyAddress = isListingLoading
    ? stateProperty
      ? getPropertyAddress(stateProperty)
      : "Loading property..."
    : isListingError
      ? "-"
      : getPropertyAddress(property);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--color-secondary)]">
              Admin · Bid Review
            </p>

            <h1 className="mt-1.5 font-serif text-2xl font-black leading-tight text-[var(--color-primary)] md:text-3xl">
              Bid Details
            </h1>

            {propertyDisplay !== "-" && (
              <p className="mt-1.5 break-words text-sm font-semibold text-[var(--color-text-main)]">
                {propertyDisplay}
              </p>
            )}

            {propertyAddress !== "-" && (
              <p className="mt-1 flex items-start gap-1.5 text-sm text-[var(--color-text-muted)]">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="break-words">{propertyAddress}</span>
              </p>
            )}

            <div className="mt-3">
              <StatusBadge
                label={bid.status || "unknown"}
                variant={getStatusVariant(bid.status)}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[var(--color-border-light)] pt-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Bid ID" value={getMongoId(bid) || "-"} icon={Gavel} />

          <StatCard
            label="Bid Price"
            value={formatMoney(bidAmount)}
            icon={DollarSign}
            accent
          />

          <StatCard
            label="Seller"
            value={seller ? getPersonName(seller) : "-"}
            icon={UserRound}
          />

          <StatCard
            label="Buyer"
            value={buyer ? getPersonName(buyer) : "-"}
            icon={UsersRound}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionBlock
          title="Property"
          description="The listing this bid was placed on."
          icon={<Home className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Property Name" value={propertyDisplay} />
          <DetailItem label="Property ID" value={listingId || "-"} />

          <div className="sm:col-span-2">
            <DetailItem label="Property Address" value={propertyAddress} />
          </div>
        </SectionBlock>

        <SectionBlock
          title="Bid Info"
          description="Bid identity, amount, and status."
          icon={<Gavel className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Bid ID" value={getMongoId(bid)} />
          <DetailItem label="Bid Price" value={formatMoney(bidAmount)} />

          <DetailItem label="Status">
            <StatusBadge
              label={bid.status || "unknown"}
              variant={getStatusVariant(bid.status)}
            />
          </DetailItem>

          <DetailItem label="Net To Seller" value={formatMoney(bid.net_to_seller)} />
          {/* <DetailItem label="Inspection Period" value={bid.inspection_period} />
          <DetailItem label="Due Diligence Period" value={bid.due_diligence_period} />
          <DetailItem label="Backup Position" value={bid.backup_position} /> */}
        </SectionBlock>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionBlock
          title="Seller"
          description="Owner of the listed property."
          icon={<UserRound className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Name" value={seller ? getPersonName(seller) : "-"} />
          <DetailItem label="Seller ID" value={sellerId || "-"} />
          <DetailItem label="Email" value={getEmail(seller)} />
          <DetailItem label="Phone" value={getPhone(seller)} />
        </SectionBlock>

        <SectionBlock
          title="Buyer / Bidder"
          description="Wholesaler, realtor, or partner who placed this bid."
          icon={<UsersRound className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Name" value={buyer ? getPersonName(buyer) : "-"} />
          <DetailItem label="Buyer ID" value={buyerId || "-"} />
          <DetailItem label="Email" value={getEmail(buyer)} />
          <DetailItem label="Phone" value={getPhone(buyer)} />
        </SectionBlock>
      </div>

      <SectionBlock
        title="Documents"
        description="LOI and proof of funds attached with the bid."
        icon={<Gavel className="h-4 w-4" />}
        cols={2}
      >
        <DetailItem label="LOI URL" value={bid.loi_url || "-"} />
        <DetailItem label="Proof Of Funds URL" value={bid.proof_of_funds_url || "-"} />
      </SectionBlock>

      <SectionBlock
        title="Timeline"
        description="When this bid was submitted, created, and last updated."
        icon={<CalendarClock className="h-4 w-4" />}
        cols={3}
      >
        <DetailItem label="Submitted At" value={formatDate(bid.submitted_at)} />
        <DetailItem label="Created At" value={formatDate(bid.createdAt)} />
        <DetailItem label="Updated At" value={formatDate(bid.updatedAt)} />
        <DetailItem label="LOI Expires At" value={formatDate(bid.loi_expires_at)} />
      </SectionBlock>
    </div>
  );
}

export default AdminBidDetailsPage;