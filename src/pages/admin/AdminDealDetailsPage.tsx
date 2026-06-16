import type { ReactNode } from "react";
import { useState } from "react";
import { useLocation, useParams } from "react-router";
import {
  Building2,
  CalendarClock,
  Handshake,
  Home,
  LockKeyhole,
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

  const explicitBidId = getDealBidIdValue(mergedDeal);
  const shouldFetchBids = Boolean(explicitBidId || (propertyId && buyerUserId));

  const { data: bidsResponse, isLoading: isBidsLoading } =
    useGetAdminBidsQuery(
      {
        page: 1,
        limit: 500,
      },
      {
        skip: !shouldFetchBids,
      }
    );

  const [closeDeal, { isLoading: isClosing }] = useCloseAdminDealMutation();

  async function handleCloseDeal() {
    if (!id) return;

    await closeDeal(id).unwrap();

    setLocalStatus("closed");
    setIsCloseOpen(false);

    if (!stateDeal) {
      refetch();
    }
  }

  if (isLoading && !mergedDeal) {
    return <Loader label="Loading deal details..." />;
  }

  if ((isError && !mergedDeal) || !mergedDeal) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
        Failed to load deal details.
      </div>
    );
  }

  const deal = {
    ...mergedDeal,
    status: localStatus ?? mergedDeal.status,
  };

  const status = normalizeValue(deal.status);

  const bids = getApiList(bidsResponse);
  const matchedBid = findMatchingBid(deal, bids);

  const property = propertyAlreadyPopulated ? propertyFromDeal : fetchedProperty;

  const propertyName = isPropertyLoading
    ? "Loading property..."
    : getListingTitle(property);

  const propertyAddress = isPropertyLoading
    ? "Loading property..."
    : getPropertyAddress(property);

  const propertyType = isPropertyLoading
    ? "Loading property..."
    : getPropertyType(property);

  const propertyStatus = isPropertyLoading
    ? "Loading property..."
    : getPropertyStatus(property);

  const seller = mergePerson(sellerRaw, fetchedSellerUser);
  const buyer = mergePerson(buyerRaw, fetchedBuyerUser);

  const amountFromDeal = getMoneyValue(deal);
  const amountFromBid = getBidAmount(matchedBid);
  const dealAmount = amountFromDeal ?? amountFromBid;

  const bidIdDisplay = isBidsLoading
    ? explicitBidId || "Loading bid..."
    : getDealBidId(deal, matchedBid);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
              Admin Deal Review
            </p>

            <h1 className="mt-2 font-serif text-3xl font-black text-[var(--color-primary)]">
              Deal Details
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Review deal, property, seller, buyer, contract, bid, and closing
              information in one place.
            </p>

            <p className="mt-3 text-sm font-bold text-[var(--color-text-main)]">
              {propertyName}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <StatusBadge
              label={deal.status || "unknown"}
              variant={getStatusVariant(status)}
            />

            {status !== "closed" && (
              <Button
                type="button"
                variant="danger"
                onClick={() => setIsCloseOpen(true)}
              >
                <LockKeyhole className="h-4 w-4" />
                Close Deal
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Deal Info */}
      <SectionBlock
        title="Deal Info"
        description="Main deal identity, linked bid/contract, amount, and current status."
        icon={<Handshake className="h-5 w-5" />}
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
        title="Property Info"
        description="The property/listing connected with this deal."
        icon={<Home className="h-5 w-5" />}
      >
        <DetailItem label="Property Name" value={propertyName} />

        <DetailItem label="Property Address" value={propertyAddress} />

        <DetailItem label="Property Type" value={propertyType} />

        <DetailItem label="Property Status" value={propertyStatus} />

        <DetailItem label="Property ID" value={propertyId || "-"} />
      </SectionBlock>

      {/* Seller Info */}
      <SectionBlock
        title="Seller Info"
        description="Seller attached to this deal."
        icon={<UserRound className="h-5 w-5" />}
      >
        <DetailItem label="Seller Name" value={getPersonName(seller)} />

        <DetailItem label="Seller ID" value={getRelationId(seller)} />

        <DetailItem label="Seller Email" value={getRelationEmail(seller)} />

        <DetailItem label="Seller Phone" value={getRelationPhone(seller)} />
      </SectionBlock>

      {/* Buyer Info */}
      <SectionBlock
        title="Buyer Info"
        description="Buyer, wholesaler, realtor, or partner attached to this deal."
        icon={<Building2 className="h-5 w-5" />}
      >
        <DetailItem label="Buyer Name" value={getPersonName(buyer)} />

        <DetailItem label="Buyer ID" value={getRelationId(buyer)} />

        <DetailItem label="Buyer Email" value={getRelationEmail(buyer)} />

        <DetailItem label="Buyer Phone" value={getRelationPhone(buyer)} />
      </SectionBlock>

      {/* Bid Info */}
      <SectionBlock
        title="Bid Info"
        description="Bid connected with this deal. If the deal does not store bid_id, it is matched using property and buyer."
        icon={<ReceiptText className="h-5 w-5" />}
      >
        <DetailItem label="Bid ID" value={bidIdDisplay} />

        <DetailItem label="Bid Amount" value={formatMoney(amountFromBid)} />

        <DetailItem
          label="Bidder"
          value={getPersonName(matchedBid?.bidder_id ?? buyer)}
        />

        <DetailItem
          label="Bid Status"
          value={matchedBid?.status || "-"}
        />
      </SectionBlock>

      {/* Deal Summary */}
      <SectionBlock
        title="Deal Summary"
        description="Quick readable summary of this deal."
        icon={<ReceiptText className="h-5 w-5" />}
      >
        <DetailItem label="Property" value={propertyName} />

        <DetailItem label="Seller" value={getPersonName(seller)} />

        <DetailItem label="Buyer" value={getPersonName(buyer)} />

        <DetailItem label="Amount" value={formatMoney(dealAmount)} />
      </SectionBlock>

      {/* Timeline */}
      <SectionBlock
        title="Timeline"
        description="Track when this deal was created, updated, or closed."
        icon={<CalendarClock className="h-5 w-5" />}
      >
        <DetailItem label="Created At" value={formatDate(deal.createdAt)} />

        <DetailItem label="Updated At" value={formatDate(deal.updatedAt)} />

        <DetailItem
          label="Closed At"
          value={formatDate(deal.closed_at || deal.closedAt)}
        />
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