import { useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Home,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  useGetAdminContractQuery,
  useGetAdminListingQuery,
  useGetAdminUserQuery,
} from "../../services/adminService";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";

import { formatDate, getApiDoc, getStatusVariant } from "../../utils/adminUtils";

import {
  ContractImageViewer,
  DetailItem,
  RecordLink,
  SectionBlock,
  SignerCard,
  SigningTimeline,
} from "./components/ContractDetailPieces";

import {
  formatLabel,
  formatMoney,
  getBidId,
  getBuyerId,
  getBuyerSignedAt,
  getCity,
  getContractPageImages,
  getContractStatus,
  getDoc,
  getFullAddress,
  getPdfUrl,
  getPropertyId,
  getPropertyName,
  getPropertyPrice,
  getPropertyStatus,
  getSellerId,
  getSellerSignedAt,
  getSigningLabel,
  getSigningVariant,
  getState,
  getStreetAddress,
  getZipCode,
  hasReadableValue,
  isBuyerSigned,
  isSellerSigned,
} from "../../utils/adminContractDetailsUtils";

function AdminContractDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const stateContract = (location.state as any)?.contract ?? null;

  const {
    data: contractResponse,
    isLoading: isContractLoading,
    isError: isContractError,
  } = useGetAdminContractQuery(id, {
    skip: !id,
  });

  const apiContract = getDoc(getApiDoc(contractResponse));
  const contract = getDoc(apiContract || stateContract);

  const propertyId = getPropertyId(contract);

  const stateProperty =
    stateContract?.property_id && typeof stateContract.property_id === "object"
      ? stateContract.property_id
      : null;

  const {
    data: listingResponse,
    isLoading: isListingLoading,
    isError: isListingError,
  } = useGetAdminListingQuery(propertyId, {
    skip: !propertyId,
  });

  const apiProperty = getDoc(getApiDoc(listingResponse));
  const property = getDoc(apiProperty || stateProperty);

  const sellerId = getSellerId(contract);
  const buyerId = getBuyerId(contract);

  const stateSeller =
    stateContract?.seller_id && typeof stateContract.seller_id === "object"
      ? stateContract.seller_id
      : null;

  const stateBuyer =
    stateContract?.buyer_id && typeof stateContract.buyer_id === "object"
      ? stateContract.buyer_id
      : null;

  const { data: sellerResponse } = useGetAdminUserQuery(sellerId, {
    skip: !sellerId,
  });

  const { data: buyerResponse } = useGetAdminUserQuery(buyerId, {
    skip: !buyerId,
  });

  const seller = getDoc(getApiDoc(sellerResponse)) || stateSeller;
  const buyer = getDoc(getApiDoc(buyerResponse)) || stateBuyer;

  const pageImages = useMemo(() => {
    return getContractPageImages(contract);
  }, [contract]);

  if (isContractLoading && !contract) {
    return (
      <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
        <Loader label="Loading contract details..." />
      </div>
    );
  }

  if ((isContractError && !contract) || !contract) {
    return (
      <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-base font-black text-[var(--color-danger)]">
          Failed to load contract details
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
          The contract could not be loaded. Please go back and try again.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/contracts")}
          className="mt-4 justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contracts
        </Button>
      </div>
    );
  }

  const contractStatus = getContractStatus(contract);
  const pdfUrl = getPdfUrl(contract);
  const bidId = getBidId(contract);

  const propertyName = isListingLoading
    ? stateProperty
      ? getPropertyName(stateProperty)
      : "Loading property..."
    : isListingError
    ? "Linked property unavailable"
    : getPropertyName(property);

  const fullAddress = isListingLoading
    ? stateProperty
      ? getFullAddress(stateProperty)
      : "Loading property..."
    : isListingError
    ? "-"
    : getFullAddress(property);

  const propertyStatus = property ? getPropertyStatus(property) : "unknown";
  const propertyPrice = property ? getPropertyPrice(property) : null;

  const sellerSignedAt = getSellerSignedAt(contract);
  const buyerSignedAt = getBuyerSignedAt(contract);
  const sellerSigned = isSellerSigned(contract);
  const buyerSigned = isBuyerSigned(contract);

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <button
        type="button"
        onClick={() => navigate("/contracts")}
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] shadow-sm transition hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Contracts
      </button>

      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--color-secondary)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Contract Review
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              {propertyName}
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
                label={formatLabel(contractStatus)}
                variant={getStatusVariant(contractStatus)}
              />

              <StatusBadge
                label={getSigningLabel(contract)}
                variant={getSigningVariant(contract) as any}
              />

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

            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
              >
                Open PDF
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </section>

      <SigningTimeline contract={contract} />

      <ContractImageViewer pdfUrl={pdfUrl} fallbackImages={pageImages} />

      <main className="min-w-0 space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-stretch">
          <SectionBlock
            title="Property"
            description={
              isListingLoading
                ? "Loading linked property details..."
                : isListingError
                ? "Linked property details could not be loaded."
                : "Property connected to this contract."
            }
            icon={<Home className="h-5 w-5" aria-hidden="true" />}
            columns="equal"
          >
            <DetailItem
              label="Street Address"
              value={getStreetAddress(property)}
            />

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
            title="Contract"
            description="Contract record, document status, and linked bid."
            icon={<FileText className="h-5 w-5" aria-hidden="true" />}
            columns="equal"
          >
            <DetailItem label="Contract Status">
              <StatusBadge
                label={formatLabel(contractStatus)}
                variant={getStatusVariant(contractStatus)}
              />
            </DetailItem>

            <DetailItem label="Signing Status">
              <StatusBadge
                label={getSigningLabel(contract)}
                variant={getSigningVariant(contract) as any}
              />
            </DetailItem>

            {hasReadableValue(propertyPrice) && (
              <DetailItem
                label="Property Price"
                value={formatMoney(propertyPrice)}
                featured
              />
            )}

            {bidId && (
              <DetailItem label="Linked Bid">
                <Link
                  to={`/bids/${bidId}`}
                  className="inline-flex items-center gap-1 text-[var(--color-primary)] underline-offset-4 hover:underline"
                >
                  Open Bid
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </DetailItem>
            )}

            <DetailItem label="Created" value={formatDate(contract.createdAt)} />
          </SectionBlock>
        </div>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SignerCard
            title="Seller"
            person={seller}
            signedAt={sellerSignedAt}
            isSigned={sellerSigned}
            path={sellerId ? `/users/${sellerId}` : undefined}
            icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
          />

          <SignerCard
            title="Buyer"
            person={buyer}
            signedAt={buyerSignedAt}
            isSigned={buyerSigned}
            path={buyerId ? `/users/${buyerId}` : undefined}
            icon={<UsersRound className="h-5 w-5" aria-hidden="true" />}
          />
        </section>
      </main>
    </div>
  );
}

export default AdminContractDetailsPage;