import type { ReactNode } from "react";
import { useState } from "react";
import { useLocation, useParams } from "react-router";
import {
  Building2,
  CalendarClock,
  DollarSign,
  Gavel,
  Handshake,
  Home,
  LockKeyhole,
  MapPin,
  ReceiptText,
  UserRound,
} from "lucide-react";

import {
  useCloseAdminDealMutation,
  useGetAdminBidsQuery,
  useGetAdminDealQuery,
  useGetAdminListingQuery,
  useGetAdminUserQuery,
} from "../../services/adminService";

import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import {
  displayValue,
  formatDate,
  formatMoney,
  getApiList,
  getBidAmount,
  getListingTitle,
  getMongoId,
  getPersonName,
  getStatusVariant,
  normalizeValue,
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
  value: ReactNode;
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

function getDealProperty(deal: any) {
  return deal?.listing_id ?? deal?.property_id ?? null;
}

function getDealPropertyId(deal: any) {
  const property = getDealProperty(deal);
  if (!property) return "";
  if (typeof property === "string") return property;
  return property._id || property.id || "";
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

function getPropertyType(property: any) {
  if (!property || typeof property !== "object") return "-";
  const doc = getDoc(property);
  return doc.property_type || doc.propertyType || doc.type || "-";
}

function getPropertyStatus(property: any) {
  if (!property || typeof property !== "object") return "-";
  const doc = getDoc(property);
  return doc.status || doc.listing_status || "-";
}

function getMoneyValue(deal: any) {
  return (
    deal?.amount ??
    deal?.deal_amount ??
    deal?.dealAmount ??
    deal?.purchase_price ??
    deal?.purchasePrice ??
    deal?.final_price ??
    deal?.finalPrice ??
    deal?.accepted_price ??
    deal?.acceptedPrice ??
    deal?.bid_price ??
    deal?.bidPrice ??
    null
  );
}

function getDealBidIdValue(deal: any) {
  const bid =
    deal?.bid_id ||
    deal?.bid ||
    deal?.selected_bid_id ||
    deal?.selectedBidId ||
    deal?.primary_bid_id ||
    deal?.primaryBidId;
  return getRelationIdValue(bid);
}

function getDealBidId(deal: any, matchedBid: any) {
  return getDealBidIdValue(deal) || getMongoId(matchedBid) || "-";
}

function getDealContractId(deal: any) {
  const contract = deal?.contract_id || deal?.contract;
  if (!contract) return "-";
  if (typeof contract === "string") return contract;
  return contract._id || contract.id || "-";
}

function getBidPropertyId(bid: any) {
  const property = bid?.property_id ?? bid?.listing_id;
  return getRelationIdValue(property);
}

function getBidBuyerId(bid: any) {
  const buyer = bid?.bidder_id ?? bid?.buyer_id;
  return getRelationIdValue(buyer);
}

function findMatchingBid(deal: any, bids: any[]) {
  if (!deal || bids.length === 0) return null;
  const explicitBidId = getDealBidIdValue(deal);
  const propertyId = getDealPropertyId(deal);
  const buyerId = getRelationIdValue(deal?.buyer_id);
  if (explicitBidId) {
    const byExplicitId = bids.find((bid) => getMongoId(bid) === explicitBidId);
    if (byExplicitId) return byExplicitId;
  }
  if (propertyId && buyerId) {
    return (
      bids.find((bid) => {
        const bidPropertyId = getBidPropertyId(bid);
        const bidBuyerId = getBidBuyerId(bid);
        return bidPropertyId === propertyId && bidBuyerId === buyerId;
      }) ?? null
    );
  }
  return null;
}

function mergeDealData(apiDeal: any, stateDeal: any) {
  if (!apiDeal && !stateDeal) return null;
  if (!apiDeal) return stateDeal;
  if (!stateDeal) return apiDeal;
  return {
    ...stateDeal,
    ...apiDeal,
    listing_id: isObject(apiDeal.listing_id)
      ? apiDeal.listing_id
      : stateDeal.listing_id ?? apiDeal.listing_id,
    property_id: isObject(apiDeal.property_id)
      ? apiDeal.property_id
      : stateDeal.property_id ?? apiDeal.property_id,
    seller_id: isObject(apiDeal.seller_id)
      ? apiDeal.seller_id
      : stateDeal.seller_id ?? apiDeal.seller_id,
    buyer_id: isObject(apiDeal.buyer_id)
      ? apiDeal.buyer_id
      : stateDeal.buyer_id ?? apiDeal.buyer_id,
    bid_id: isObject(apiDeal.bid_id)
      ? apiDeal.bid_id
      : stateDeal.bid_id ?? apiDeal.bid_id,
    contract_id: isObject(apiDeal.contract_id)
      ? apiDeal.contract_id
      : stateDeal.contract_id ?? apiDeal.contract_id,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminDealDetailsPage() {
  const { id = "" } = useParams();
  const location = useLocation();

  const stateDeal = (location.state as any)?.deal ?? null;
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  const {
    data: apiDeal,
    isLoading,
    isError,
    refetch,
  } = useGetAdminDealQuery(id, {
    skip: !id || Boolean(stateDeal),
  });

  const mergedDeal = mergeDealData(apiDeal, stateDeal);

  const propertyId = getDealPropertyId(mergedDeal);
  const propertyFromDeal = getDealProperty(mergedDeal);
  const propertyAlreadyPopulated = isObject(propertyFromDeal);

  const { data: fetchedProperty, isLoading: isPropertyLoading } =
    useGetAdminListingQuery(propertyId, {
      skip: !propertyId || propertyAlreadyPopulated,
    });

  const sellerRaw = mergedDeal?.seller_id ?? null;
  const buyerRaw = mergedDeal?.buyer_id ?? null;

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

  const explicitBidId = getDealBidIdValue(mergedDeal);
  const shouldFetchBids = Boolean(explicitBidId || (propertyId && buyerUserId));

  const { data: bidsResponse, isLoading: isBidsLoading } = useGetAdminBidsQuery(
    { page: 1, limit: 500 },
    { skip: !shouldFetchBids }
  );

  const [closeDeal, { isLoading: isClosing }] = useCloseAdminDealMutation();

  async function handleCloseDeal() {
    if (!id) return;
    await closeDeal(id).unwrap();
    setLocalStatus("closed");
    setIsCloseOpen(false);
    if (!stateDeal) refetch();
  }

  if (isLoading && !mergedDeal) {
    return <Loader label="Loading deal details..." />;
  }

  if ((isError && !mergedDeal) || !mergedDeal) {
    return (
      <div className="rounded-xl bg-white p-5 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
        Failed to load deal details.
      </div>
    );
  }

  const deal = { ...mergedDeal, status: localStatus ?? mergedDeal.status };
  const status = normalizeValue(deal.status);

  const bids = getApiList(bidsResponse);
  const matchedBid = findMatchingBid(deal, bids);

  const property = propertyAlreadyPopulated ? propertyFromDeal : fetchedProperty;

  const propertyName = isPropertyLoading ? "Loading property..." : getListingTitle(property);
  const propertyAddress = isPropertyLoading ? "Loading property..." : getPropertyAddress(property);
  const propertyType = isPropertyLoading ? "Loading property..." : getPropertyType(property);
  const propertyStatus = isPropertyLoading ? "Loading property..." : getPropertyStatus(property);

  const seller = mergePerson(sellerRaw, fetchedSellerUser);
  const buyer = mergePerson(buyerRaw, fetchedBuyerUser);

  const amountFromDeal = getMoneyValue(deal);
  const amountFromBid = getBidAmount(matchedBid);
  const dealAmount = amountFromDeal ?? amountFromBid;

  const bidIdDisplay = isBidsLoading
    ? explicitBidId || "Loading bid..."
    : getDealBidId(deal, matchedBid);

  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--color-secondary)]">
              Admin · Deal Review
            </p>
            <h1 className="mt-1.5 font-serif text-2xl font-black leading-tight text-[var(--color-primary)] md:text-3xl">
              Deal Details
            </h1>
            {propertyName && propertyName !== "-" && (
              <p className="mt-1.5 text-sm font-semibold text-[var(--color-text-main)]">
                {propertyName}
              </p>
            )}
            {propertyAddress !== "-" && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {propertyAddress}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge
                label={deal.status || "unknown"}
                variant={getStatusVariant(status)}
              />
              {dealAmount && (
                <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-[11px] font-bold text-[var(--color-text-main)]">
                  {formatMoney(dealAmount)}
                </span>
              )}
            </div>
          </div>

          {/* Close Deal action */}
          {status !== "closed" && (
            <div className="shrink-0">
              <Button
                type="button"
                variant="danger"
                onClick={() => setIsCloseOpen(true)}
              >
                <LockKeyhole className="h-4 w-4" />
                Close Deal
              </Button>
            </div>
          )}
        </div>

        {/* Stat row */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-border-light)] pt-4 sm:grid-cols-4">
          <StatCard label="Deal ID" value={getMongoId(deal) || "-"} icon={Handshake} />
          <StatCard
            label="Deal Amount"
            value={formatMoney(dealAmount)}
            icon={DollarSign}
            accent
          />
          <StatCard label="Seller" value={getPersonName(seller) || "-"} icon={UserRound} />
          <StatCard label="Buyer" value={getPersonName(buyer) || "-"} icon={Building2} />
        </div>
      </div>

      {/* ── Two-column: Deal Info + Property Info ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Deal Info */}
        <SectionBlock
          title="Deal Info"
          description="Identity, linked bid/contract, amount, and status."
          icon={<Handshake className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Deal ID" value={getMongoId(deal)} />
          <DetailItem label="Status">
            <StatusBadge
              label={deal.status || "unknown"}
              variant={getStatusVariant(status)}
            />
          </DetailItem>
          <DetailItem label="Deal Amount" value={formatMoney(dealAmount)} />
          <DetailItem label="Bid ID" value={bidIdDisplay} />
          <DetailItem label="Contract ID" value={getDealContractId(deal)} />
          <DetailItem label="Property ID" value={propertyId || "-"} />
        </SectionBlock>

        {/* Property Info */}
        <SectionBlock
          title="Property"
          description="The listing connected with this deal."
          icon={<Home className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Property Name" value={propertyName} />
          <DetailItem label="Property ID" value={propertyId || "-"} />
          <DetailItem label="Type" value={propertyType} />
          <DetailItem label="Listing Status" value={propertyStatus} />
          <div className="col-span-2">
            <DetailItem label="Address" value={propertyAddress} />
          </div>
        </SectionBlock>
      </div>

      {/* ── Two-column: Seller + Buyer ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Seller */}
        <SectionBlock
          title="Seller"
          description="Seller attached to this deal."
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
          title="Buyer"
          description="Buyer, wholesaler, or partner attached to this deal."
          icon={<Building2 className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Name" value={getPersonName(buyer)} />
          <DetailItem label="Buyer ID" value={getRelationId(buyer)} />
          <DetailItem label="Email" value={getRelationEmail(buyer)} />
          <DetailItem label="Phone" value={getRelationPhone(buyer)} />
        </SectionBlock>
      </div>

      {/* ── Bid Info ─────────────────────────────────────────────────────── */}
      <SectionBlock
        title="Bid Info"
        description="Bid connected with this deal — matched by bid ID, or by property and buyer."
        icon={<Gavel className="h-4 w-4" />}
        cols={4}
      >
        <DetailItem label="Bid ID" value={bidIdDisplay} />
        <DetailItem label="Bid Amount" value={formatMoney(amountFromBid)} />
        <DetailItem label="Bidder" value={getPersonName(matchedBid?.bidder_id ?? buyer)} />
        <DetailItem label="Bid Status" value={matchedBid?.status || "-"} />
      </SectionBlock>

      {/* ── Deal Summary ─────────────────────────────────────────────────── */}
      <SectionBlock
        title="Deal Summary"
        description="Quick overview of this deal at a glance."
        icon={<ReceiptText className="h-4 w-4" />}
        cols={4}
      >
        <DetailItem label="Property" value={propertyName} />
        <DetailItem label="Seller" value={getPersonName(seller)} />
        <DetailItem label="Buyer" value={getPersonName(buyer)} />
        <DetailItem label="Amount" value={formatMoney(dealAmount)} />
      </SectionBlock>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <SectionBlock
        title="Timeline"
        description="When this deal was created, updated, or closed."
        icon={<CalendarClock className="h-4 w-4" />}
        cols={3}
      >
        <DetailItem label="Created At" value={formatDate(deal.createdAt)} />
        <DetailItem label="Updated At" value={formatDate(deal.updatedAt)} />
        <DetailItem label="Closed At" value={formatDate(deal.closed_at || deal.closedAt)} />
      </SectionBlock>

      <ConfirmModal
        isOpen={isCloseOpen}
        variant="danger"
        title="Force close deal?"
        description="This will close the deal from admin side."
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