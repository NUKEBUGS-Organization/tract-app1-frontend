import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  DollarSign,
  ExternalLink,
  FileText,
  Gavel,
  Handshake,
  Home,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  useCloseAdminDealMutation,
  useGetAdminBidQuery,
  useGetAdminDealQuery,
  useGetAdminListingQuery,
  useGetAdminUserQuery,
} from "../../services/adminService";

import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";

import {
  formatDate,
  getApiDoc,
  getMongoId,
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

function formatLabel(value: any) {
  if (!value) return "-";

  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function hasReadableValue(value: any) {
  return value !== undefined && value !== null && value !== "" && value !== "-";
}

function formatMoney(value: any) {
  if (value === undefined || value === null || value === "") return "-";

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return String(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

function getPersonName(person: any) {
  const doc = getDoc(person);

  return (
    doc?.full_name ||
    doc?.fullName ||
    doc?.name ||
    [doc?.first_name, doc?.last_name].filter(Boolean).join(" ") ||
    "-"
  );
}

function getEmail(person: any) {
  const doc = getDoc(person);

  return doc?.email || "-";
}

function getPhone(person: any) {
  const doc = getDoc(person);

  return (
    doc?.phone ||
    doc?.phone_number ||
    doc?.phoneNumber ||
    doc?.mobile ||
    doc?.mobile_number ||
    "-"
  );
}

function getRole(person: any) {
  const doc = getDoc(person);

  return doc?.role || "-";
}

function getDealStatus(deal: any) {
  const doc = getDoc(deal);

  return doc?.status || "unknown";
}

function getDealPropertyId(deal: any) {
  const doc = getDoc(deal);

  return getId(doc?.property_id) || getId(doc?.listing_id);
}

function getDealBidId(deal: any) {
  const doc = getDoc(deal);

  return getId(doc?.bid_id) || getId(doc?.selected_bid_id);
}

function getDealContractId(deal: any) {
  const doc = getDoc(deal);

  return getId(doc?.contract_id) || getId(doc?.contract);
}

function getDealSellerId(deal: any, property: any) {
  const dealDoc = getDoc(deal);
  const propertyDoc = getDoc(property);

  return getId(dealDoc?.seller_id) || getId(propertyDoc?.seller_id);
}

function getDealBuyerId(deal: any, bid: any) {
  const dealDoc = getDoc(deal);
  const bidDoc = getDoc(bid);

  return (
    getId(dealDoc?.buyer_id) ||
    getId(dealDoc?.wholesaler_id) ||
    getId(dealDoc?.realtor_id) ||
    getId(bidDoc?.bidder_id)
  );
}

function getDealAmount(deal: any, bid: any) {
  const dealDoc = getDoc(deal);
  const bidDoc = getDoc(bid);

  return (
    dealDoc?.purchase_price ??
    dealDoc?.purchasePrice ??
    dealDoc?.deal_price ??
    dealDoc?.dealPrice ??
    dealDoc?.final_price ??
    dealDoc?.finalPrice ??
    dealDoc?.amount ??
    bidDoc?.bid_price ??
    bidDoc?.bidPrice ??
    bidDoc?.amount ??
    null
  );
}

function getClosedAt(deal: any) {
  const doc = getDoc(deal);

  return doc?.closed_at || doc?.closedAt || null;
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

  return (
    doc?.zip_code ||
    doc?.zipCode ||
    doc?.postal_code ||
    doc?.postalCode ||
    "-"
  );
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

function getPropertyStatus(property: any) {
  const doc = getDoc(property);

  return doc?.status || "unknown";
}

function getPropertyPrice(property: any) {
  const doc = getDoc(property);

  return (
    doc?.market_price ??
    doc?.marketPrice ??
    doc?.asking_price ??
    doc?.askingPrice ??
    doc?.price ??
    null
  );
}

function isDealClosed(status: string) {
  const normalized = normalizeValue(status);

  return ["closed", "completed", "complete"].includes(normalized);
}

function canCloseDeal(status: string) {
  const normalized = normalizeValue(status);

  return !["closed", "completed", "complete", "cancelled", "canceled"].includes(
    normalized
  );
}

function getDealProgress(deal: any, bid: any, contractId: string) {
  const status = normalizeValue(getDealStatus(deal));
  const closedAt = getClosedAt(deal);
  const bidId = getDealBidId(deal);
  const isClosed = isDealClosed(status) || Boolean(closedAt);

  const steps = [
    {
      title: "Deal Created",
      description: "Deal record was created",
      helper: deal?.createdAt ? formatDate(deal.createdAt) : "-",
      isComplete: Boolean(deal?.createdAt),
    },
    {
      title: "Bid Selected",
      description: "Winning bid is linked to this deal",
      helper: bidId ? "Bid connected" : "Waiting",
      isComplete: Boolean(bidId || bid),
    },
    {
      title: "Contract Stage",
      description: "Contract flow is connected",
      helper: contractId ? "Contract connected" : "Not connected yet",
      isComplete: Boolean(contractId),
    },
    {
      title: "Closed",
      description: "Deal has been finalized",
      helper: closedAt ? formatDate(closedAt) : isClosed ? "Closed" : "Waiting",
      isComplete: isClosed,
    },
  ];

  const completedCount = steps.filter((step) => step.isComplete).length;
  const progress =
    completedCount === 0 ? 0 : (completedCount / steps.length) * 100;

  return {
    steps,
    completedCount,
    totalSteps: steps.length,
    progress,
  };
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
        {children ?? value ?? "-"}
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
  columns?: "default" | "equal" | "compact";
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
  fullWidth = false,
}: {
  to: string;
  label: string;
  fullWidth?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {label}
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

function DealTimeline({ deal, bid, contractId }: { deal: any; bid: any; contractId: string }) {
  const { steps, completedCount, totalSteps, progress } = getDealProgress(
    deal,
    bid,
    contractId
  );

  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
            Deal Journey
          </div>

          <h2 className="font-serif text-2xl font-black leading-tight text-[var(--color-primary)]">
            Deal Timeline
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Progress from deal creation to final closing.
          </p>
        </div>

        <div className="w-fit rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Progress
          </p>

          <p className="mt-1 text-sm font-black text-[var(--color-primary)]">
            {completedCount}/{totalSteps} completed
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4 sm:p-5">
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`group rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                step.isComplete
                  ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5"
                  : "border-[var(--color-border-light)] bg-white"
              }`}
            >
              <div className="mb-4 flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105 ${
                    step.isComplete
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                  }`}
                >
                  {step.isComplete ? (
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Clock3 className="h-5 w-5" aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    Step {index + 1}
                  </p>

                  <h3 className="mt-1 text-sm font-black text-[var(--color-primary)]">
                    {step.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
                {step.description}
              </p>

              <p className="mt-3 text-sm font-black text-[var(--color-text-main)]">
                {step.helper}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartyCard({
  title,
  person,
  path,
  icon,
}: {
  title: string;
  person: any;
  path?: string;
  icon: ReactNode;
}) {
  const name = person ? getPersonName(person) : "-";
  const email = getEmail(person);
  const phone = getPhone(person);
  const role = getRole(person);

  return (
    <article className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex min-w-0 items-start gap-3">
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
            <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
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
          <RecordLink to={path} label="Open Profile" fullWidth />
        </div>
      )}
    </article>
  );
}

function AdminDealDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCloseOpen, setIsCloseOpen] = useState(false);

  const stateDeal = (location.state as any)?.deal ?? null;

  const {
    data: dealResponse,
    isLoading: isDealLoading,
    isError: isDealError,
    refetch,
  } = useGetAdminDealQuery(id, {
    skip: !id,
  });

  const apiDeal = getDoc(getApiDoc(dealResponse));
  const deal = getDoc(apiDeal || stateDeal);

  const propertyId = getDealPropertyId(deal);
  const bidId = getDealBidId(deal);
  const contractId = getDealContractId(deal);

  const stateProperty =
    deal?.property_id && typeof deal.property_id === "object"
      ? deal.property_id
      : deal?.listing_id && typeof deal.listing_id === "object"
      ? deal.listing_id
      : null;

  const stateBid =
    deal?.bid_id && typeof deal.bid_id === "object" ? deal.bid_id : null;

  const {
    data: listingResponse,
    isLoading: isListingLoading,
    isError: isListingError,
  } = useGetAdminListingQuery(propertyId, {
    skip: !propertyId,
  });

  const { data: bidResponse } = useGetAdminBidQuery(bidId, {
    skip: !bidId,
  });

  const property = getDoc(getApiDoc(listingResponse)) || stateProperty;
  const bid = getDoc(getApiDoc(bidResponse)) || stateBid;

  const sellerId = getDealSellerId(deal, property);
  const buyerId = getDealBuyerId(deal, bid);

  const stateSeller =
    deal?.seller_id && typeof deal.seller_id === "object"
      ? deal.seller_id
      : property?.seller_id && typeof property.seller_id === "object"
      ? property.seller_id
      : null;

  const stateBuyer =
    deal?.buyer_id && typeof deal.buyer_id === "object"
      ? deal.buyer_id
      : bid?.bidder_id && typeof bid.bidder_id === "object"
      ? bid.bidder_id
      : null;

  const { data: sellerResponse } = useGetAdminUserQuery(sellerId, {
    skip: !sellerId,
  });

  const { data: buyerResponse } = useGetAdminUserQuery(buyerId, {
    skip: !buyerId,
  });

  const seller = getDoc(getApiDoc(sellerResponse)) || stateSeller;
  const buyer = getDoc(getApiDoc(buyerResponse)) || stateBuyer;

  const [closeDeal, { isLoading: isClosing }] = useCloseAdminDealMutation();

  async function handleCloseDeal() {
    if (!deal) return;

    await closeDeal(getMongoId(deal)).unwrap();

    setIsCloseOpen(false);
    refetch();
  }

  if (isDealLoading && !deal) {
    return (
      <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
        <Loader label="Loading deal details..." />
      </div>
    );
  }

  if ((isDealError && !deal) || !deal) {
    return (
      <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-base font-black text-[var(--color-danger)]">
          Failed to load deal details
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
          The deal could not be loaded. Please go back and try again.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/deals")}
          className="mt-4 justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Deals
        </Button>
      </div>
    );
  }

  const dealStatus = getDealStatus(deal);
  const normalizedDealStatus = normalizeValue(dealStatus);
  const dealAmount = getDealAmount(deal, bid);
  const closedAt = getClosedAt(deal);

  const propertyTitle = isListingLoading
    ? stateProperty
      ? getPropertyTitle(stateProperty)
      : "Loading property..."
    : isListingError
    ? "Linked property unavailable"
    : getPropertyTitle(property);

  const fullAddress = isListingLoading
    ? stateProperty
      ? getFullAddress(stateProperty)
      : "Loading property..."
    : isListingError
    ? "-"
    : getFullAddress(property);

  const propertyStatus = property ? getPropertyStatus(property) : "unknown";
  const propertyPrice = property ? getPropertyPrice(property) : null;

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <button
        type="button"
        onClick={() => navigate("/deals")}
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] shadow-sm transition hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Deals
      </button>

      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--color-secondary)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Deal Review
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              {propertyTitle}
            </h1>

            {fullAddress !== "-" && (
              <p className="mt-3 flex max-w-3xl items-start gap-2 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="break-words">{fullAddress}</span>
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge
                label={formatLabel(dealStatus)}
                variant={getStatusVariant(dealStatus)}
              />

              {hasReadableValue(dealAmount) && (
                <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-black text-[var(--color-primary)]">
                  {formatMoney(dealAmount)}
                </span>
              )}

              {property && (
                <StatusBadge
                  label={`Listing ${formatLabel(propertyStatus)}`}
                  variant={getStatusVariant(propertyStatus)}
                />
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
            {propertyId && (
              <RecordLink to={`/properties/${propertyId}`} label="Open Listing" />
            )}

            {canCloseDeal(normalizedDealStatus) && (
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsCloseOpen(true)}
                className="justify-center"
              >
                <LockKeyhole className="h-4 w-4" />
                Close Deal
              </Button>
            )}
          </div>
        </div>
      </section>

      <DealTimeline deal={deal} bid={bid} contractId={contractId} />

      <main className="min-w-0 space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-stretch">
          <SectionBlock
            title="Property"
            description={
              isListingLoading
                ? "Loading linked property details..."
                : isListingError
                ? "Linked property details could not be loaded."
                : "Property connected to this deal."
            }
            icon={<Home className="h-5 w-5" aria-hidden="true" />}
            columns="equal"
          >
            <DetailItem label="Street Address" value={getStreetAddress(property)} />
            <DetailItem label="City" value={getCity(property)} />
            <DetailItem label="State" value={getState(property)} />
            <DetailItem label="Zip Code" value={getZipCode(property)} />

            <DetailItem label="Listing Status">
              {property ? (
                <StatusBadge
                  label={formatLabel(propertyStatus)}
                  variant={getStatusVariant(propertyStatus)}
                />
              ) : (
                "-"
              )}
            </DetailItem>

            <DetailItem label="Full Address" value={fullAddress} featured />
          </SectionBlock>

          <SectionBlock
            title="Deal"
            description="Core deal state, value, and linked workflow."
            icon={<Handshake className="h-5 w-5" aria-hidden="true" />}
            columns="equal"
          >
            <DetailItem label="Deal Status">
              <StatusBadge
                label={formatLabel(dealStatus)}
                variant={getStatusVariant(dealStatus)}
              />
            </DetailItem>

            {hasReadableValue(dealAmount) && (
              <DetailItem
                label="Deal Amount"
                value={formatMoney(dealAmount)}
                featured
                icon={<DollarSign className="h-3.5 w-3.5" aria-hidden="true" />}
              />
            )}

            {hasReadableValue(propertyPrice) && (
              <DetailItem label="Property Price" value={formatMoney(propertyPrice)} />
            )}

            {bidId && (
              <DetailItem label="Selected Bid">
                <Link
                  to={`/bids/${bidId}`}
                  className="inline-flex items-center gap-1 text-[var(--color-primary)] underline-offset-4 hover:underline"
                >
                  Open Bid
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </DetailItem>
            )}

            {contractId && (
              <DetailItem label="Contract">
                <Link
                  to={`/contracts/${contractId}`}
                  className="inline-flex items-center gap-1 text-[var(--color-primary)] underline-offset-4 hover:underline"
                >
                  Open Contract
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </DetailItem>
            )}

            <DetailItem label="Created" value={formatDate(deal.createdAt)} />

            {closedAt && (
              <DetailItem label="Closed" value={formatDate(closedAt)} featured />
            )}
          </SectionBlock>
        </div>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PartyCard
            title="Seller"
            person={seller}
            path={sellerId ? `/users/${sellerId}` : undefined}
            icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
          />

          <PartyCard
            title="Buyer"
            person={buyer}
            path={buyerId ? `/users/${buyerId}` : undefined}
            icon={<UsersRound className="h-5 w-5" aria-hidden="true" />}
          />
        </section>
      </main>

      <ConfirmModal
        isOpen={isCloseOpen}
        variant="success"
        title="Close deal?"
        description="This will mark the deal as closed. Make sure the contract and final review are complete before continuing."
        icon={<LockKeyhole className="h-5 w-5" />}
        confirmLabel="Close Deal"
        loadingLabel="Closing..."
        isLoading={isClosing}
        onCancel={() => setIsCloseOpen(false)}
        onConfirm={handleCloseDeal}
      />
    </div>
  );
}

export default AdminDealDetailsPage;