import {
  useLocation,
  useParams,
} from "react-router";

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
  useGetAdminUserQuery,
} from "../../services/adminService";

import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";

import {
  formatDate,
  getListingTitle,
  getMongoId,
  getPersonName,
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

import {
  formatCurrency,
  getApiPayload,
  getBuyerSignedAt,
  getContractAmount,
  getContractPdfUrl,
  getContractProperty,
  getContractPropertyRelation,
  getPropertyAddress,
  getRelationId,
  getRelationIdValue,
  getSellerSignedAt,
  hasCompletePerson,
  isBuyerSigned,
  isSellerSigned,
  mergeContractData,
  mergePerson,
} from "./contract-details/contractDetailsUtils";

function AdminContractDetailsPage() {
  const { id = "" } = useParams();
  const location = useLocation();

  const stateContract = (location.state as any)?.contract ?? null;

  const {
    data: contractResponse,
    isLoading,
    isError,
  } = useGetAdminContractQuery(id, { skip: !id });

  const contract = mergeContractData(contractResponse, stateContract);

  const sellerRelation = contract?.seller_id ?? null;
  const buyerRelation = contract?.buyer_id ?? null;

  const sellerUserId = getRelationIdValue(sellerRelation);
  const buyerUserId = getRelationIdValue(buyerRelation);

  const shouldFetchSeller = Boolean(sellerUserId) && !hasCompletePerson(sellerRelation);
  const shouldFetchBuyer = Boolean(buyerUserId) && !hasCompletePerson(buyerRelation);

  const { data: sellerResponse, isFetching: isFetchingSeller } = useGetAdminUserQuery(
    sellerUserId,
    { skip: !shouldFetchSeller }
  );

  const { data: buyerResponse, isFetching: isFetchingBuyer } = useGetAdminUserQuery(
    buyerUserId,
    { skip: !shouldFetchBuyer }
  );

  const fetchedSeller = getApiPayload(sellerResponse);
  const fetchedBuyer = getApiPayload(buyerResponse);

  if (isLoading && !contract) {
    return (
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
        <Loader label="Loading contract details..." />
      </div>
    );
  }

  if ((isError && !contract) || !contract) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
        Failed to load contract details.
      </div>
    );
  }

  const propertyRelation = getContractPropertyRelation(contract);
  const property = getContractProperty(contract);
  const seller = mergePerson(sellerRelation, fetchedSeller);
  const buyer = mergePerson(buyerRelation, fetchedBuyer);

  const contractId = getMongoId(contract);
  const status = contract?.status || "unknown";
  const propertyName = property ? getListingTitle(property) : "-";
  const propertyAddress = getPropertyAddress(property);
  const pdfUrl = getContractPdfUrl(contract);

  const sellerSignedAt = getSellerSignedAt(contract);
  const buyerSignedAt = getBuyerSignedAt(contract);
  const sellerSigned = isSellerSigned(contract);
  const buyerSigned = isBuyerSigned(contract);
  const bothSigned = sellerSigned && buyerSigned;
  const eitherSigned = sellerSigned || buyerSigned;

  const sellerName = isFetchingSeller && !seller ? "Loading..." : getPersonName(seller);
  const buyerName = isFetchingBuyer && !buyer ? "Loading..." : getPersonName(buyer);

  const createdAt = contract?.createdAt || contract?.created_at;
  const updatedAt = contract?.updatedAt || contract?.updated_at;
  const bidRelation = contract?.bid_id || contract?.bidId;
  const dealRelation = contract?.deal_id || contract?.dealId;

  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
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

      {/* ── PDF Preview (left) + Signing & Parties (right) ──────────────── */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_780px]">

        {/* ── Left: PDF carousel — no outer wrapper, carousel IS the card ── */}
        {pdfUrl ? (
          <div>
            {/* Thin label row above the carousel */}
            {/* <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--color-primary)]/60" />
                <span className="text-sm font-black text-[var(--color-primary)]">
                  Contract Preview
                </span>
              </div>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)] transition hover:text-[var(--color-primary)]"
              >
                Open Full PDF
                <ExternalLink className="h-6.5 w-6.5" />
              </a>
            </div> */}
            {/* Carousel renders its own white card — no wrapper needed */}
            <ContractPdfCarousel pdfUrl={pdfUrl} />
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--color-border-light)] bg-white px-6 py-10 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
              <FileText className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--color-text-main)]">No PDF attached</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              No contract PDF was uploaded for this contract.
            </p>
          </div>
        )}

        {/* ── Right: single white card containing Signing + Parties ─────── */}
        <div className="overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">

          {/* Signing Status */}
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

          {/* Contract Parties */}
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
              <PartyCard title="Seller" person={seller} relation={sellerRelation} />
              <PartyCard title="Buyer" person={buyer} relation={buyerRelation} />
            </div>
          </div>

        </div>
      </div>

      {/* ── Property ─────────────────────────────────────────────────────── */}
      <SectionBlock
        title="Property"
        description="Property connected to this contract."
        icon={<Home className="h-4 w-4" />}
        cols={3}
      >
        <DetailItem label="Property" value={propertyName} icon={Home} />
        <DetailItem label="Property ID" value={getRelationId(propertyRelation)} icon={FileText} />
        <DetailItem label="Address" value={propertyAddress} icon={MapPin} />
      </SectionBlock>

      {/* ── Contract Information ──────────────────────────────────────────── */}
      <SectionBlock
        title="Contract Information"
        description="Contract amount, identifiers, and dates."
        icon={<FileText className="h-4 w-4" />}
        cols={4}
      >
        <DetailItem label="Contract ID" value={contractId} icon={FileText} />
        <DetailItem label="Bid ID" value={getRelationId(bidRelation)} icon={FileText} />
      
        <DetailItem label="Created" value={formatDate(createdAt)} icon={CalendarClock} />
        <DetailItem label="Updated" value={formatDate(updatedAt)} icon={CalendarClock} />
        <DetailItem
          label="Seller Signed"
          value={
            sellerSignedAt
              ? formatDate(sellerSignedAt)
              : sellerSigned ? "Signed" : "Pending"
          }
          icon={sellerSigned ? CheckCircle2 : Clock}
        />
        <DetailItem
          label="Buyer Signed"
          value={
            buyerSignedAt
              ? formatDate(buyerSignedAt)
              : buyerSigned ? "Signed" : "Pending"
          }
          icon={buyerSigned ? CheckCircle2 : Clock}
        />
      </SectionBlock>

    </div>
  );
}

export default AdminContractDetailsPage;