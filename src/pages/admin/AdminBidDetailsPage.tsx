import type { ReactNode } from "react";
import { useLocation, useParams } from "react-router";
import {
  CalendarClock,
  Gavel,
  Home,
  ReceiptText,
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
  getBidAmount,
  getListingTitle,
  getMongoId,
  getPersonName,
  getStatusVariant,
} from "../../utils/adminUtils";

function DetailItem({
  label,
  value,
  children,
}: {
  label: string;
  value?: any;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
        {label}
      </p>

      <div className="mt-2 break-words text-sm font-bold text-[var(--color-text-main)]">
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
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
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
    doc?.phone ||
    doc?.phone_number ||
    doc?.phoneNumber ||
    doc?.mobile ||
    doc?.mobile_number ||
    "-"
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
    doc?.phone ||
      doc?.phone_number ||
      doc?.phoneNumber ||
      doc?.mobile ||
      doc?.mobile_number
  );
}

function hasCompletePerson(value: any) {
  return hasPersonName(value) && hasPersonEmail(value) && hasPersonPhone(value);
}

function mergePerson(primary: any, fallback: any) {
  if (!primary && !fallback) return null;

  if (typeof primary === "string") {
    return fallback || primary;
  }

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

  const shouldFetchSellerUser =
    Boolean(sellerUserId) && !hasCompletePerson(sellerRaw);

  const shouldFetchBuyerUser =
    Boolean(buyerUserId) && !hasCompletePerson(buyerRaw);

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
      <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
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
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
              Admin Bid Review
            </p>

            <h1 className="mt-2 font-serif text-3xl font-black text-[var(--color-primary)]">
              Bid Details
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Review bid amount, property, seller, buyer/bidder, and bid
              timeline in one place.
            </p>

            <p className="mt-3 text-sm font-bold text-[var(--color-text-main)]">
              {propertyDisplay}
            </p>
          </div>

          <StatusBadge
            label={bid.status || "unknown"}
            variant={getStatusVariant(bid.status)}
          />
        </div>
      </div>

      <SectionBlock
        title="Bid Info"
        description="Main bid identity, amount, and current status."
        icon={<Gavel className="h-5 w-5" />}
      >
        <DetailItem label="Bid ID" value={getMongoId(bid)} />

        {/* <DetailItem label="Amount" value={formatMoney(bidAmount)} /> */}

        <DetailItem label="Bid Price" value={formatMoney(bid.bid_price)} />

        <DetailItem label="Status">
          <StatusBadge
            label={bid.status || "unknown"}
            variant={getStatusVariant(bid.status)}
          />
        </DetailItem>
      </SectionBlock>

      <SectionBlock
        title="Property Info"
        description="The listing/property on which this bid was submitted."
        icon={<Home className="h-5 w-5" />}
      >
        <DetailItem label="Property Name" value={propertyDisplay} />

        <DetailItem label="Property Address" value={propertyAddress} />

        <DetailItem label="Property ID" value={listingId || "-"} />
      </SectionBlock>

      <SectionBlock
        title="Seller Info"
        description="The seller who owns the property/listing."
        icon={<UserRound className="h-5 w-5" />}
      >
        <DetailItem label="Seller Name" value={getPersonName(seller)} />

        <DetailItem label="Seller ID" value={getRelationId(seller)} />

        <DetailItem label="Seller Email" value={getRelationEmail(seller)} />

        <DetailItem label="Seller Phone" value={getRelationPhone(seller)} />
      </SectionBlock>

      <SectionBlock
        title="Buyer / Bidder Info"
        description="The wholesaler, realtor, or partner who submitted this bid."
        icon={<UsersRound className="h-5 w-5" />}
      >
        <DetailItem label="Buyer Name" value={getPersonName(buyer)} />

        <DetailItem label="Buyer ID" value={getRelationId(buyer)} />

        <DetailItem label="Buyer Email" value={getRelationEmail(buyer)} />

        <DetailItem label="Buyer Phone" value={getRelationPhone(buyer)} />
      </SectionBlock>

      <SectionBlock
        title="Bid Summary"
        description="Quick readable summary of this bid."
        icon={<ReceiptText className="h-5 w-5" />}
      >
        <DetailItem label="Property" value={propertyDisplay} />

        <DetailItem label="Seller" value={getPersonName(seller)} />

        <DetailItem label="Buyer / Bidder" value={getPersonName(buyer)} />

        <DetailItem label="Offered Amount" value={formatMoney(bidAmount)} />
      </SectionBlock>

      <SectionBlock
        title="Timeline"
        description="Track when this bid was created and last updated."
        icon={<CalendarClock className="h-5 w-5" />}
      >
        <DetailItem label="Created At" value={formatDate(bid.createdAt)} />

        <DetailItem label="Updated At" value={formatDate(bid.updatedAt)} />
      </SectionBlock>
    </div>
  );
}

export default AdminBidDetailsPage;