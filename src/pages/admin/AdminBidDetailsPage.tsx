import type { ReactNode } from "react";
import { useLocation, useParams } from "react-router";
import {
  CalendarClock,
  Gavel,
  Home,
  UserRound,
  UsersRound,
  MapPin,
  DollarSign,
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
  getBidAmount,
  getListingTitle,
  getMongoId,
  getPersonName,
  getStatusVariant,
} from "../../utils/adminUtils";

// ─── Detail Item ─────────────────────────────────────────────────────────────

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
    <div className="group flex flex-col gap-1.5 rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3.5 transition hover:border-[var(--color-primary)]/20 hover:shadow-sm">
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
  icon: ReactNode;
  children: ReactNode;
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
      <div className={`grid gap-3 ${colClass}`}>{children}</div>
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
  value: string;
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
        <p
          className={`mt-0.5 truncate text-sm font-bold ${
            accent ? "text-[var(--color-primary)]" : "text-[var(--color-text-main)]"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isObject(value: any) {
  return value && typeof value === "object";
}

function getDoc(value: any) {
  return value?.data?._doc ?? value?._doc ?? value?.data ?? value;
}

function getRelationIdValue(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value;
  const doc = getDoc(value);
  return doc?._id || doc?.id || "";
}

function getRelationId(value: any) {
  return getRelationIdValue(value) || "-";
}

function getRelationEmail(value: any) {
  if (!value || typeof value !== "object") return "-";
  const doc = getDoc(value);
  return doc?.email || "-";
}

function getRelationPhone(value: any) {
  if (!value || typeof value !== "object") return "-";
  const doc = getDoc(value);
  return (
    doc?.phone || doc?.phone_number || doc?.phoneNumber || doc?.mobile || doc?.mobile_number || "-"
  );
}

function hasPersonName(value: any) {
  if (!value || typeof value !== "object") return false;
  const doc = getDoc(value);
  return Boolean(doc?.full_name || doc?.fullName || doc?.name);
}

function hasPersonEmail(value: any) {
  if (!value || typeof value !== "object") return false;
  const doc = getDoc(value);
  return Boolean(doc?.email);
}

function hasPersonPhone(value: any) {
  if (!value || typeof value !== "object") return false;
  const doc = getDoc(value);
  return Boolean(
    doc?.phone || doc?.phone_number || doc?.phoneNumber || doc?.mobile || doc?.mobile_number
  );
}

function hasCompletePerson(value: any) {
  return hasPersonName(value) && hasPersonEmail(value) && hasPersonPhone(value);
}

function mergePerson(primary: any, fallback: any) {
  if (!primary && !fallback) return null;
  if (typeof primary === "string") return fallback || primary;
  const primaryDoc = getDoc(primary) || {};
  const fallbackDoc = getDoc(fallback) || {};
  return {
    ...fallbackDoc,
    ...primaryDoc,
    _id: primaryDoc._id || primaryDoc.id || fallbackDoc._id || fallbackDoc.id,
    id: primaryDoc.id || primaryDoc._id || fallbackDoc.id || fallbackDoc._id,
    full_name:
      primaryDoc.full_name ||
      primaryDoc.fullName ||
      primaryDoc.name ||
      fallbackDoc.full_name ||
      fallbackDoc.fullName ||
      fallbackDoc.name,
    email: primaryDoc.email || fallbackDoc.email,
    phone:
      primaryDoc.phone ||
      primaryDoc.phone_number ||
      primaryDoc.phoneNumber ||
      primaryDoc.mobile ||
      primaryDoc.mobile_number ||
      fallbackDoc.phone ||
      fallbackDoc.phone_number ||
      fallbackDoc.phoneNumber ||
      fallbackDoc.mobile ||
      fallbackDoc.mobile_number,
  };
}

function getBidProperty(bid: any) {
  return bid?.property_id ?? bid?.listing_id ?? null;
}

function getListingIdFromBid(bid: any) {
  const property = getBidProperty(bid);
  if (!property) return "";
  if (typeof property === "string") return property;
  return property?._id || property?.id || "";
}

function getPropertyDisplay(property: any) {
  if (!property) return "-";
  return getListingTitle(property);
}

function getPropertyAddress(property: any) {
  if (!property || typeof property !== "object") return "-";
  const doc = getDoc(property);
  const address = [
    doc.address || doc.property_address || doc.street_address,
    doc.city,
    doc.state_code,
    doc.zip_code,
  ]
    .filter(Boolean)
    .join(", ");
  return address || getListingTitle(doc);
}

function getPropertySeller(property: any, bid: any) {
  const propertyDoc = getDoc(property);
  const bidDoc = getDoc(bid);
  const bidPropertyDoc = getDoc(getBidProperty(bidDoc));
  return (
    propertyDoc?.seller_id ||
    propertyDoc?.seller ||
    propertyDoc?.owner_id ||
    propertyDoc?.user_id ||
    bidDoc?.seller_id ||
    bidDoc?.seller ||
    bidPropertyDoc?.seller_id ||
    bidPropertyDoc?.seller ||
    bidPropertyDoc?.owner_id ||
    bidPropertyDoc?.user_id ||
    null
  );
}

function mergeBidData(apiBid: any, stateBid: any) {
  if (!apiBid && !stateBid) return null;
  if (!apiBid) return stateBid;
  if (!stateBid) return apiBid;
  return {
    ...stateBid,
    ...apiBid,
    property_id: isObject(apiBid.property_id)
      ? apiBid.property_id
      : stateBid.property_id ?? apiBid.property_id,
    listing_id: isObject(apiBid.listing_id)
      ? apiBid.listing_id
      : stateBid.listing_id ?? apiBid.listing_id,
    bidder_id: isObject(apiBid.bidder_id)
      ? apiBid.bidder_id
      : stateBid.bidder_id ?? apiBid.bidder_id,
    seller_id: isObject(apiBid.seller_id)
      ? apiBid.seller_id
      : stateBid.seller_id ?? apiBid.seller_id,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminBidDetailsPage() {
  const { id = "" } = useParams();
  const location = useLocation();

  const stateBid = (location.state as any)?.bid ?? null;

  const {
    data: apiBid,
    isLoading: isBidLoading,
    isError: isBidError,
  } = useGetAdminBidQuery(id, {
    skip: !id || Boolean(stateBid),
  });

  const bid = mergeBidData(apiBid, stateBid);

  const listingId = getListingIdFromBid(bid);
  const propertyFromBid = getBidProperty(bid);
  const sellerFromBidOrProperty = getPropertySeller(propertyFromBid, bid);

  const shouldFetchListing =
    Boolean(listingId) && !hasCompletePerson(sellerFromBidOrProperty);

  const {
    data: fetchedListing,
    isLoading: isListingLoading,
    isError: isListingError,
  } = useGetAdminListingQuery(listingId, {
    skip: !shouldFetchListing,
  });

  const property = fetchedListing || propertyFromBid;
  const sellerRaw = getPropertySeller(property, bid);
  const buyerRaw = bid?.bidder_id;

  const sellerUserId = getRelationIdValue(sellerRaw);
  const buyerUserId = getRelationIdValue(buyerRaw);

  const shouldFetchSellerUser = Boolean(sellerUserId) && !hasCompletePerson(sellerRaw);
  const shouldFetchBuyerUser = Boolean(buyerUserId) && !hasCompletePerson(buyerRaw);

  const { data: fetchedSellerUser } = useGetAdminUserQuery(sellerUserId, {
    skip: !shouldFetchSellerUser,
  });

  const { data: fetchedBuyerUser } = useGetAdminUserQuery(buyerUserId, {
    skip: !shouldFetchBuyerUser,
  });

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

  const seller = mergePerson(sellerRaw, fetchedSellerUser);
  const buyer = mergePerson(buyerRaw, fetchedBuyerUser);
  const bidAmount = getBidAmount(bid);

  const propertyDisplay = isListingLoading
    ? getPropertyDisplay(propertyFromBid) !== "-"
      ? getPropertyDisplay(propertyFromBid)
      : "Loading property..."
    : isListingError
    ? listingId || "-"
    : getPropertyDisplay(property);

  const propertyAddress = isListingLoading
    ? getPropertyAddress(propertyFromBid) !== "-"
      ? getPropertyAddress(propertyFromBid)
      : "Loading property..."
    : isListingError
    ? "-"
    : getPropertyAddress(property);

  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
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
              <p className="mt-1.5 text-sm font-semibold text-[var(--color-text-main)]">
                {propertyDisplay}
              </p>
            )}
            {propertyAddress !== "-" && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {propertyAddress}
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

        {/* Stat row */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-border-light)] pt-4 sm:grid-cols-4">
          <StatCard label="Bid ID" value={getMongoId(bid) || "-"} icon={Gavel} />
          <StatCard
            label="Bid Price"
            value={formatMoney(bid.bid_price)}
            icon={DollarSign}
            accent
          />
          <StatCard label="Seller" value={getPersonName(seller) || "-"} icon={UserRound} />
          <StatCard label="Buyer" value={getPersonName(buyer) || "-"} icon={UsersRound} />
        </div>
      </div>

      {/* ── Two-column: Property + Bid Info ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Property Info */}
        <SectionBlock
          title="Property"
          description="The listing this bid was placed on."
          icon={<Home className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Property Name" value={propertyDisplay} />
          <DetailItem label="Property ID" value={listingId || "-"} />
          <div className="col-span-2">
            <DetailItem label="Property Address" value={propertyAddress} />
          </div>
        </SectionBlock>

        {/* Bid Info */}
        <SectionBlock
          title="Bid Info"
          description="Bid identity, amount, and status."
          icon={<Gavel className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Bid ID" value={getMongoId(bid)} />
          <DetailItem label="Bid Price" value={formatMoney(bid.bid_price)} />
          <DetailItem label="Status">
            <StatusBadge
              label={bid.status || "unknown"}
              variant={getStatusVariant(bid.status)}
            />
          </DetailItem>
          <DetailItem label="Offered Amount" value={formatMoney(bidAmount)} />
        </SectionBlock>
      </div>

      {/* ── Two-column: Seller + Buyer ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Seller */}
        <SectionBlock
          title="Seller"
          description="Owner of the listed property."
          icon={<UserRound className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Name" value={getPersonName(seller)} />
          <DetailItem label="Seller ID" value={getRelationId(seller)} />
          <DetailItem label="Email" value={getRelationEmail(seller)} />
          <DetailItem label="Phone" value={getRelationPhone(seller)} />
        </SectionBlock>

        {/* Buyer */}
        <SectionBlock
          title="Buyer / Bidder"
          description="Wholesaler, realtor, or partner who placed this bid."
          icon={<UsersRound className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Name" value={getPersonName(buyer)} />
          <DetailItem label="Buyer ID" value={getRelationId(buyer)} />
          <DetailItem label="Email" value={getRelationEmail(buyer)} />
          <DetailItem label="Phone" value={getRelationPhone(buyer)} />
        </SectionBlock>
      </div>


      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <SectionBlock
        title="Timeline"
        description="When this bid was created and last updated."
        icon={<CalendarClock className="h-4 w-4" />}
        cols={2}
      >
        <DetailItem label="Created At" value={formatDate(bid.createdAt)} />
        <DetailItem label="Updated At" value={formatDate(bid.updatedAt)} />
      </SectionBlock>

    </div>
  );
}

export default AdminBidDetailsPage;