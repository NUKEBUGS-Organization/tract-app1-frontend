// src/pages/admin/AdminBidDetailsPage.tsx

import type { ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CalendarClock,
  DollarSign,
  ExternalLink,
  Gavel,
  Home,
  Mail,
  MapPin,
  Phone,
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
  normalizeValue,
} from "../../utils/adminUtils";

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

function getId(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value;

  const doc = getDoc(value);

  return doc?._id || doc?.id || "";
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

function getEmail(value: any) {
  const doc = getDoc(value);

  return doc?.email || "-";
}

function getPhone(value: any) {
  const doc = getDoc(value);

  return doc?.phone || doc?.phone_number || doc?.phoneNumber || "-";
}

function getRole(value: any) {
  const doc = getDoc(value);

  return doc?.role || "-";
}

function getBidPrice(bid: any) {
  return bid?.bid_price ?? bid?.bidPrice ?? bid?.amount ?? null;
}

function getBidStatus(bid: any) {
  return bid?.status || "unknown";
}

function getBackupPosition(bid: any) {
  return bid?.backup_position ?? bid?.backupPosition ?? null;
}

function getListingIdFromBid(bid: any) {
  return getId(bid?.property_id);
}

function getBidderIdFromBid(bid: any) {
  return getId(bid?.bidder_id);
}

function getSellerIdFromProperty(property: any) {
  return getId(property?.seller_id);
}

function getPropertyTitle(property: any) {
  const doc = getDoc(property);

  return (
    doc?.address ||
    doc?.property_address ||
    doc?.street_address ||
    doc?.title ||
    doc?.propertyTitle ||
    "Linked Property"
  );
}

function getStreetAddress(property: any) {
  const doc = getDoc(property);

  return (
    doc?.address ||
    doc?.property_address ||
    doc?.street_address ||
    doc?.streetAddress ||
    doc?.address_line_1 ||
    doc?.addressLine1 ||
    "-"
  );
}

function getCity(property: any) {
  const doc = getDoc(property);

  return doc?.city || "-";
}

function getState(property: any) {
  const doc = getDoc(property);

  return doc?.state_code || doc?.stateCode || doc?.state || "-";
}

function getZipCode(property: any) {
  const doc = getDoc(property);

  return doc?.zip_code || doc?.zipCode || doc?.postal_code || doc?.postalCode || "-";
}

function getFullAddress(property: any) {
  const parts = [
    getStreetAddress(property),
    getCity(property),
    getState(property),
    getZipCode(property),
  ].filter((part) => hasReadableValue(part));

  return parts.length > 0 ? parts.join(", ") : "-";
}

function getListingStatus(property: any) {
  const doc = getDoc(property);

  return doc?.status || "unknown";
}

function DetailItem({
  label,
  value,
  children,
  icon,
  featured = false,
}: {
  label: string;
  value?: any;
  children?: ReactNode;
  icon?: ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={`group min-w-0 rounded-2xl border px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-secondary)]/40 hover:shadow-sm ${
        featured
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
        className={`mt-1.5 break-words text-sm font-bold leading-6 ${
          featured
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
  columns?: "default" | "compact" | "equal";
}) {
  const gridClass =
    columns === "compact"
      ? "grid-cols-1"
      : columns === "equal"
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";

  return (
    <section className="h-full rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-lg sm:p-6">
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

      <div className={`grid ${gridClass} gap-3`}>{children}</div>
    </section>
  );
}
function RecordLink({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
    >
      {label}
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

function PartyCard({
  title,
  person,
  fallback,
  path,
  icon,
}: {
  title: string;
  person: any;
  fallback: string;
  path?: string;
  icon: ReactNode;
}) {
  const personDoc = getDoc(person);
  const name = personDoc ? getPersonName(personDoc) : fallback;
  const email = getEmail(personDoc);
  const phone = getPhone(personDoc);
  const role = getRole(personDoc);

  return (
    <article className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            {title}
          </p>

          <h3 className="mt-1 break-words text-base font-black text-[var(--color-primary)]">
            {name}
          </h3>

          {role !== "-" && (
            <p className="mt-1 text-xs font-semibold capitalize text-[var(--color-text-muted)]">
              {formatLabel(role)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm font-semibold text-[var(--color-text-muted)]">
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
      </div>

      {path && (
        <div className="mt-5">
          <RecordLink to={path} label="Open Profile" />
        </div>
      )}
    </article>
  );
}


function AdminBidDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
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
  const bid = getDoc(apiBid || stateBid);

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
  const property = getDoc(apiListing || stateProperty);

  const sellerId = getSellerIdFromProperty(property);
  const buyerId = getBidderIdFromBid(bid);

  const { data: sellerResponse } = useGetAdminUserQuery(sellerId, {
    skip: !sellerId,
  });

  const { data: buyerResponse } = useGetAdminUserQuery(buyerId, {
    skip: !buyerId,
  });

  const seller =
    getDoc(getApiDoc(sellerResponse)) ||
    (property?.seller_id && typeof property.seller_id === "object"
      ? property.seller_id
      : null);

  const buyer =
    getDoc(getApiDoc(buyerResponse)) ||
    (bid?.bidder_id && typeof bid.bidder_id === "object"
      ? bid.bidder_id
      : null);

  if (isBidLoading && !bid) {
    return (
      <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
        <Loader label="Loading bid details..." />
      </div>
    );
  }

  if ((isBidError && !bid) || !bid) {
    return (
      <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-base font-black text-[var(--color-danger)]">
          Failed to load bid details
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
          The bid could not be loaded. Please go back and try again.
        </p>

        <button
          type="button"
          onClick={() => navigate("/bids")}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] transition hover:bg-[var(--color-bg-soft)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Bids
        </button>
      </div>
    );
  }

  const bidPrice = getBidPrice(bid);
  const bidStatus = normalizeValue(getBidStatus(bid));
  const backupPosition = getBackupPosition(bid);
  const propertyTitle = property ? getPropertyTitle(property) : "Linked Property";
  const fullAddress = property ? getFullAddress(property) : "-";
  const listingStatus = property ? getListingStatus(property) : "unknown";

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <button
        type="button"
        onClick={() => navigate("/bids")}
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] shadow-sm transition hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Bids
      </button>

      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--color-secondary)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Bid Review
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              {formatMoney(bidPrice)}
            </h1>

            <p className="mt-2 max-w-3xl break-words text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
              Bid submitted for{" "}
              <span className="font-black text-[var(--color-primary)]">
                {propertyTitle}
              </span>
              {fullAddress !== "-" ? ` · ${fullAddress}` : ""}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge
                label={formatLabel(bidStatus)}
                variant={getStatusVariant(bidStatus)}
              />

              {hasReadableValue(backupPosition) && (
                <span className="rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-primary)]">
                  Backup #{backupPosition}
                </span>
              )}

              {property && (
                <StatusBadge
                  label={`Listing ${formatLabel(listingStatus)}`}
                  variant={getStatusVariant(listingStatus)}
                />
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
            {listingId && (
              <RecordLink to={`/properties/${listingId}`} label="Open Listing" />
            )}
          </div>
        </div>
      </section>

      <main className="min-w-0 space-y-6">
 <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-stretch">
   <SectionBlock
  title="Bid Information"
  description="Core bid amount and submission metadata."
  icon={<DollarSign className="h-5 w-5" aria-hidden="true" />}
  columns="equal"
>
      <DetailItem
        label="Offer Amount"
        value={formatMoney(bidPrice)}
        featured
        icon={<DollarSign className="h-3.5 w-3.5" aria-hidden="true" />}
      />

      <DetailItem label="Bid Status">
        <StatusBadge
          label={formatLabel(bidStatus)}
          variant={getStatusVariant(bidStatus)}
        />
      </DetailItem>

      {hasReadableValue(backupPosition) && (
        <DetailItem label="Backup Position" value={`#${backupPosition}`} />
      )}

      <DetailItem
        label="Submitted"
        value={formatDate(bid.createdAt)}
        icon={<CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />}
      />

      <DetailItem
        label="Last Updated"
        value={formatDate(bid.updatedAt)}
        icon={<CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />}
      />
    </SectionBlock>

    <SectionBlock
  title="Property Address"
  description={
    isListingLoading
      ? "Loading linked property details..."
      : isListingError
      ? "Linked property details could not be loaded."
      : "Location details for the listing connected to this bid."
  }
  icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
  columns="equal"
>
      <DetailItem
        label="Street Address"
        value={property ? getStreetAddress(property) : "-"}
      />

      <DetailItem label="City" value={property ? getCity(property) : "-"} />

      <DetailItem label="State" value={property ? getState(property) : "-"} />

      <DetailItem
        label="Zip Code"
        value={property ? getZipCode(property) : "-"}
      />

      <DetailItem label="Listing Status">
        {property ? (
          <StatusBadge
            label={formatLabel(listingStatus)}
            variant={getStatusVariant(listingStatus)}
          />
        ) : (
          "-"
        )}
      </DetailItem>

      <DetailItem
        label="Full Address"
        value={property ? fullAddress : "-"}
        featured
      />
    </SectionBlock>
  </div>

  <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <PartyCard
      title="Bidder"
      person={buyer}
      fallback="Bidder unavailable"
      path={buyer ? `/users/${getId(buyer)}` : undefined}
      icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
    />

    <PartyCard
      title="Seller"
      person={seller}
      fallback="Seller unavailable"
      path={seller ? `/users/${getId(seller)}` : undefined}
      icon={<UsersRound className="h-5 w-5" aria-hidden="true" />}
    />
  </section>

  <SectionBlock
    title="Linked Listing"
    description="Listing record connected to this bid."
    icon={<Home className="h-5 w-5" aria-hidden="true" />}
    columns="compact"
  >
    <DetailItem label="Listing" value={propertyTitle} featured />

    <DetailItem label="Listing Status">
      {property ? (
        <StatusBadge
          label={formatLabel(listingStatus)}
          variant={getStatusVariant(listingStatus)}
        />
      ) : (
        "-"
      )}
    </DetailItem>

    <DetailItem
      label="Created"
      value={property ? formatDate(property.createdAt) : "-"}
    />

    <DetailItem
      label="Updated"
      value={property ? formatDate(property.updatedAt) : "-"}
    />
  </SectionBlock>
</main>
    </div>
  );
}

export default AdminBidDetailsPage;