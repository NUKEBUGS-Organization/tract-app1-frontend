import { useLocation, useParams } from "react-router";

import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Home,
  MapPin,
  UserRound,
} from "lucide-react";

import {
  useGetAdminContractQuery,
  useGetAdminListingQuery,
  useGetAdminUserQuery,
} from "../../services/adminService";

import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";

import {
  formatDate,
  getApiDoc,
  getStatusVariant,
} from "../../utils/adminUtils";

import {
  DetailItem,
  PartyCard,
  SectionBlock,
  SigningCard,
  StatCard,
} from "./contract-details/ContractDetailsComponents";

import ContractPdfCarousel from "./contract-details/ContractPdfCarousel";

function getId(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value;

  return value._id || "";
}

function getContractId(contract: any) {
  return contract?._id || "";
}

function getPropertyId(contract: any) {
  return getId(contract?.property_id);
}

function getSellerId(contract: any) {
  return getId(contract?.seller_id);
}

function getBuyerId(contract: any) {
  return getId(contract?.buyer_id);
}

function getPersonName(person: any) {
  return person?.full_name || "-";
}

function getPropertyName(property: any) {
  return property?.address || "Listing";
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

function getPdfUrl(contract: any) {
  return contract?.pdf_url || "";
}

function getSellerSignedAt(contract: any) {
  return contract?.seller_signed_at || null;
}

function getBuyerSignedAt(contract: any) {
  return contract?.buyer_signed_at || null;
}

function isSellerSigned(contract: any) {
  return Boolean(contract?.seller_signed_at);
}

function isBuyerSigned(contract: any) {
  return Boolean(contract?.buyer_signed_at);
}

function AdminContractDetailsPage() {
  const { id = "" } = useParams();
  const location = useLocation();

  const stateContract = (location.state as any)?.contract ?? null;

  const {
    data: contractResponse,
    isLoading: isContractLoading,
    isError: isContractError,
  } = useGetAdminContractQuery(id, {
    skip: !id,
  });

  const apiContract = getApiDoc(contractResponse);
  const contract = apiContract || stateContract;

  const propertyId = getPropertyId(contract);
  const sellerId = getSellerId(contract);
  const buyerId = getBuyerId(contract);

  const stateProperty =
    stateContract?.property_id && typeof stateContract.property_id === "object"
      ? stateContract.property_id
      : null;

  const stateSeller =
    stateContract?.seller_id && typeof stateContract.seller_id === "object"
      ? stateContract.seller_id
      : null;

  const stateBuyer =
    stateContract?.buyer_id && typeof stateContract.buyer_id === "object"
      ? stateContract.buyer_id
      : null;

  const {
    data: listingResponse,
    isLoading: isListingLoading,
    isError: isListingError,
  } = useGetAdminListingQuery(propertyId, {
    skip: !propertyId,
  });

  const {
    data: sellerResponse,
    isFetching: isFetchingSeller,
  } = useGetAdminUserQuery(sellerId, {
    skip: !sellerId,
  });

  const {
    data: buyerResponse,
    isFetching: isFetchingBuyer,
  } = useGetAdminUserQuery(buyerId, {
    skip: !buyerId,
  });

  const apiProperty = getApiDoc(listingResponse);
  const apiSeller = getApiDoc(sellerResponse);
  const apiBuyer = getApiDoc(buyerResponse);

  const property = apiProperty || stateProperty;
  const seller = apiSeller || stateSeller;
  const buyer = apiBuyer || stateBuyer;

  if (isContractLoading && !contract) {
    return (
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
        <Loader label="Loading contract details..." />
      </div>
    );
  }

  if ((isContractError && !contract) || !contract) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
        Failed to load contract details.
      </div>
    );
  }

  const contractId = getContractId(contract);
  const status = contract.status || "unknown";

  const propertyName = isListingLoading
    ? stateProperty
      ? getPropertyName(stateProperty)
      : "Loading property..."
    : isListingError
      ? propertyId || "-"
      : getPropertyName(property);

  const propertyAddress = isListingLoading
    ? stateProperty
      ? getPropertyAddress(stateProperty)
      : "Loading property..."
    : isListingError
      ? "-"
      : getPropertyAddress(property);

  const pdfUrl = getPdfUrl(contract);

  const sellerSignedAt = getSellerSignedAt(contract);
  const buyerSignedAt = getBuyerSignedAt(contract);
  const sellerSigned = isSellerSigned(contract);
  const buyerSigned = isBuyerSigned(contract);
  const bothSigned = sellerSigned && buyerSigned;
  const eitherSigned = sellerSigned || buyerSigned;

  const sellerName = isFetchingSeller && !seller ? "Loading..." : getPersonName(seller);
  const buyerName = isFetchingBuyer && !buyer ? "Loading..." : getPersonName(buyer);

  const createdAt = contract.createdAt;
  const updatedAt = contract.updatedAt;
  const bidId = getId(contract.bid_id);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--color-secondary)]">
              Admin · Contract Review
            </p>

            <h1 className="mt-1.5 font-serif text-2xl font-black leading-tight text-[var(--color-primary)] md:text-3xl">
              Contract Details
            </h1>

            {propertyName !== "-" && (
              <p className="mt-2 break-words text-sm font-semibold text-[var(--color-text-main)]">
                {propertyName}
              </p>
            )}

            {propertyAddress !== "-" && (
              <p className="mt-1 flex items-start gap-1.5 text-sm text-[var(--color-text-muted)]">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="break-words">{propertyAddress}</span>
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge label={status} variant={getStatusVariant(status)} />

              {bothSigned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Fully Signed
                </span>
              )}

              {!bothSigned && eitherSigned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-700">
                  <Clock className="h-3.5 w-3.5" />
                  Partially Signed
                </span>
              )}

              {!eitherSigned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-[11px] font-bold text-[var(--color-text-muted)]">
                  <Clock className="h-3.5 w-3.5" />
                  Awaiting Signatures
                </span>
              )}
            </div>
          </div>

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-3 text-sm font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/10"
            >
              <FileText className="h-4 w-4" />
              Open Full PDF
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--color-border-light)] pt-5 sm:grid-cols-4">
          <StatCard label="Contract ID" value={contractId || "-"} icon={FileText} />

          <StatCard
            label="Status"
            value={<StatusBadge label={status} variant={getStatusVariant(status)} />}
            icon={CheckCircle2}
            accent
          />

          <StatCard label="Seller" value={sellerName || "-"} icon={UserRound} />
          <StatCard label="Buyer" value={buyerName || "-"} icon={Building2} />
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_780px]">
        {pdfUrl ? (
          <div>
            <ContractPdfCarousel pdfUrl={pdfUrl} />
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--color-border-light)] bg-white px-6 py-10 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
              <FileText className="h-5 w-5" />
            </div>

            <p className="mt-3 text-sm font-semibold text-[var(--color-text-main)]">
              No PDF attached
            </p>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              No contract PDF was uploaded for this contract.
            </p>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--color-border-light)] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
                <CalendarClock className="h-4 w-4" />
              </div>

              <div>
                <h2 className="font-serif text-base font-black leading-tight text-[var(--color-primary)]">
                  Signing Status
                </h2>

                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  Track which parties have signed.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SigningCard
                role="Seller"
                name={sellerName}
                signed={sellerSigned}
                signedAt={sellerSignedAt}
              />

              <SigningCard
                role="Buyer"
                name={buyerName}
                signed={buyerSigned}
                signedAt={buyerSignedAt}
              />
            </div>
          </div>

          <div className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
                <UserRound className="h-4 w-4" />
              </div>

              <div>
                <h2 className="font-serif text-base font-black leading-tight text-[var(--color-primary)]">
                  Contract Parties
                </h2>

                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  Seller and buyer contact details.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <PartyCard title="Seller" person={seller} relation={contract.seller_id} />
              <PartyCard title="Buyer" person={buyer} relation={contract.buyer_id} />
            </div>
          </div>
        </div>
      </div>

      <SectionBlock
        title="Property"
        description="Property connected to this contract."
        icon={<Home className="h-4 w-4" />}
        cols={3}
      >
        <DetailItem label="Property" value={propertyName} icon={Home} />
        <DetailItem label="Property ID" value={propertyId || "-"} icon={FileText} />
        <DetailItem label="Address" value={propertyAddress} icon={MapPin} />
      </SectionBlock>

      <SectionBlock
        title="Contract Information"
        description="Contract identifiers, signing status, and dates."
        icon={<FileText className="h-4 w-4" />}
        cols={4}
      >
        <DetailItem label="Contract ID" value={contractId || "-"} icon={FileText} />
        <DetailItem label="Bid ID" value={bidId || "-"} icon={FileText} />
        <DetailItem label="Created" value={formatDate(createdAt)} icon={CalendarClock} />
        <DetailItem label="Updated" value={formatDate(updatedAt)} icon={CalendarClock} />

        <DetailItem
          label="Seller Signed"
          value={
            sellerSignedAt
              ? formatDate(sellerSignedAt)
              : sellerSigned
                ? "Signed"
                : "Pending"
          }
          icon={sellerSigned ? CheckCircle2 : Clock}
        />

        <DetailItem
          label="Buyer Signed"
          value={
            buyerSignedAt
              ? formatDate(buyerSignedAt)
              : buyerSigned
                ? "Signed"
                : "Pending"
          }
          icon={buyerSigned ? CheckCircle2 : Clock}
        />
      </SectionBlock>
    </div>
  );
}

export default AdminContractDetailsPage;