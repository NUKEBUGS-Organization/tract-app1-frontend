import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit3,
  FileText,
  Gavel,
  Home,
  ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

import StatusBadge from "../../components/common/StatusBadge";
import WithdrawListingModal from "../../components/common/WithdrawListingModal";
import {
  useDeleteListingMutation,
  useGetListingByIdQuery,
} from "../../services/listingService";

type StatusBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "gold"
  | "neutral"
  | "dark";

function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

function getListingFromResponse(response: any) {
  const payload = getApiPayload(response);
  return payload?.listing ?? payload;
}

function getErrorMessage(error: any, fallback: string) {
  const message = error?.data?.message || error?.data?.error || error?.error;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return message || fallback;
}

function isPlaceholderValue(value: any) {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    return (
      normalized === "" ||
      normalized === "string" ||
      normalized === "n/a" ||
      normalized === "null" ||
      normalized === "undefined"
    );
  }

  return false;
}

function displayValue(value: any) {
  if (isPlaceholderValue(value)) {
    return "-";
  }

  return value;
}

function formatMoney(value: any) {
  if (isPlaceholderValue(value)) {
    return "-";
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "-";
  }

  return numberValue.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatStatus(status?: string) {
  if (!status) return "Draft";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusVariant(status?: string): StatusBadgeVariant {
  const normalizedStatus = String(status || "draft").toLowerCase();

  if (normalizedStatus === "live") return "success";
  if (normalizedStatus === "draft") return "neutral";
  if (normalizedStatus === "submitted") return "gold";
  if (normalizedStatus === "review") return "gold";
  if (normalizedStatus === "under_contract") return "warning";
  if (normalizedStatus === "closed") return "dark";
  if (normalizedStatus === "withdrawn") return "danger";
  if (normalizedStatus === "deleted") return "danger";

  return "neutral";
}

function formatPropertyType(propertyType?: string) {
  const normalized = String(propertyType || "").toLowerCase();

  const propertyTypeLabels: Record<string, string> = {
    sfh: "Single Family Home",
    single_family: "Single Family Home",
    single_family_home: "Single Family Home",
    multi: "Multi-Family",
    multi_family: "Multi-Family",
    multifamily: "Multi-Family",
    land: "Land",
    commercial: "Commercial",
    mixeduse: "Mixed Use",
    mixed_use: "Mixed Use",
  };

  return propertyTypeLabels[normalized] || displayValue(propertyType);
}

function formatCondition(value?: string) {
  if (isPlaceholderValue(value)) return "-";

  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeImageUrl(rawUrl: any) {
  if (!rawUrl) return "";

  const url = String(rawUrl).trim();

  if (!url) return "";

  const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || "").replace(
    /\/$/,
    ""
  );

  const apiOrigin = apiBaseUrl.replace(/\/api\/v1$/, "");

  /*
    Important:
    Do not replace %5C or backslashes here.
    %5C may be part of the backend file key.
    Frontend should only fix the missing /api/v1 prefix.
  */

  // Relative URL missing /v1:
  // /api/listings/documents/view/...
  if (url.startsWith("/api/listings/")) {
    return `${apiOrigin}${url.replace(
      "/api/listings/",
      "/api/v1/listings/"
    )}`;
  }

  // Relative URL already has /api/v1:
  // /api/v1/listings/documents/view/...
  if (url.startsWith("/api/v1/")) {
    return `${apiOrigin}${url}`;
  }

  // Relative URL without leading slash and missing /v1:
  // api/listings/documents/view/...
  if (url.startsWith("api/listings/")) {
    return `${apiOrigin}/${url.replace(
      "api/listings/",
      "api/v1/listings/"
    )}`;
  }

  // Relative URL without leading slash but already has /api/v1:
  // api/v1/listings/documents/view/...
  if (url.startsWith("api/v1/")) {
    return `${apiOrigin}/${url}`;
  }

  // Backend route only:
  // listings/documents/view/...
  if (url.startsWith("listings/")) {
    return `${apiBaseUrl}/${url}`;
  }

  // Full URL but missing /v1:
  // http://localhost:3000/api/listings/documents/view/...
  if (url.includes("/api/listings/")) {
    return url.replace("/api/listings/", "/api/v1/listings/");
  }

  // S3 signed URL, public URL, or already valid full URL
  return url;
}

function getListingLabel(listing: any) {
  const address = listing?.address || "Untitled Listing";
  const state = listing?.state_code ? `, ${listing.state_code}` : "";
  const zip = listing?.zip_code ? ` ${listing.zip_code}` : "";

  return `${address}${state}${zip}`;
}

function isDraftListing(listing: any) {
  return String(listing?.status || "").toLowerCase() === "draft";
}

function getBidCount(listing: any) {
  return (
    Number(listing?.bid_count) ||
    Number(listing?.bids_summary?.total) ||
    Number(Array.isArray(listing?.bids) ? listing.bids.length : 0)
  );
}

function canWithdrawListing(listing: any) {
  const status = String(listing?.status || "").toLowerCase();
  const bidCount = getBidCount(listing);

  return bidCount === 0 && !["under_contract", "closed"].includes(status);
}

function getListingImages(listing: any) {
  if (!Array.isArray(listing?.picture_urls)) {
    return [];
  }

  return listing.picture_urls
    .map((item: any, index: number) => {
      const rawUrl =
        typeof item === "string"
          ? item
          : item?.url || item?.signed_url || item?.file_url || item?.src;

      const url = normalizeImageUrl(rawUrl);

      return {
        id:
          typeof item === "string"
            ? `picture-${index}`
            : item?._id || item?.id || `picture-${index}`,
        url,
        name:
          typeof item === "string"
            ? `Property Image ${index + 1}`
            : item?.file_name || item?.name || `Property Image ${index + 1}`,
      };
    })
    .filter((image: any) => Boolean(image.url))
    .filter(
      (image: any, index: number, array: any[]) =>
        array.findIndex((item) => item.url === image.url) === index
    );
}

function InfoCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {label}
        </p>

        <Icon className="h-5 w-5 text-[var(--color-primary)]" />
      </div>

      <p className="font-serif text-2xl font-black text-[var(--color-primary)]">
        {value}
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
        {displayValue(value)}
      </p>
    </div>
  );
}

function NotesBox({ label, value }: { label: string; value: any }) {
  if (isPlaceholderValue(value)) {
    return null;
  }

  return (
    <div className="mt-5 rounded-xl bg-[var(--color-bg-soft)] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className="mt-2 text-sm leading-6 text-[var(--color-text-main)]">
        {value}
      </p>
    </div>
  );
}

function ImageCard({ image }: { image: any }) {
  const [hasError, setHasError] = useState(false);

  return (
    <a
      href={image.url}
      target="_blank"
      rel="noreferrer"
      className="group overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
    >
      {!hasError ? (
        <img
          src={image.url}
          alt={image.name}
          className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-52 flex-col items-center justify-center gap-2 bg-[var(--color-bg-soft)] px-4 text-center">
          <ImageIcon className="h-8 w-8 text-[var(--color-text-muted)]" />

          <p className="text-sm font-bold text-[var(--color-text-main)]">
            Image preview unavailable
          </p>

          <p className="text-xs leading-5 text-[var(--color-text-muted)]">
            The image URL was returned, but it could not be loaded.
          </p>
        </div>
      )}

      <div className="border-t border-[var(--color-border-light)] bg-white px-4 py-3">
        <p className="truncate text-xs font-bold text-[var(--color-primary)]">
          {image.name}
        </p>
      </div>
    </a>
  );
}

function PropertyImagesSection({
  listingId,
  listingImages,
}: {
  listingId: string;
  listingImages: any[];
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
            Property Images
          </h2>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Uploaded property pictures for this listing.
          </p>
        </div>

        <ImageIcon className="h-5 w-5 text-[var(--color-primary)]" />
      </div>

      {listingImages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-8 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" />

          <p className="mt-3 text-sm font-bold text-[var(--color-text-main)]">
            No property images uploaded yet.
          </p>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Upload property pictures from the Document Vault.
          </p>

          <Link
            to={`/document-vault?listingId=${listingId}`}
            className="mt-4 inline-flex bg-[var(--color-primary)] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white"
          >
            Upload Images
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {listingImages.map((image: any) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ListingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetListingByIdQuery(
    id || "",
    {
      skip: !id,
    }
  );

  const [deleteListing, { isLoading: isDeleting }] = useDeleteListingMutation();

  if (!id) {
    return <Navigate to="/dashboard" replace />;
  }

  const listing = getListingFromResponse(data);
  const listingImages = getListingImages(listing);
  const bidCount = getBidCount(listing);
  const canEdit = isDraftListing(listing);
  const canWithdraw = canWithdrawListing(listing);

  const handleWithdraw = async () => {
    if (!id) {
      setApiError("Listing ID is missing.");
      return;
    }

    if (!canWithdraw) {
      setApiError(
        "This listing cannot be withdrawn because bids already exist or it is already in deal flow."
      );
      setShowWithdrawModal(false);
      return;
    }

    try {
      setApiError(null);

      await deleteListing(id).unwrap();

      setShowWithdrawModal(false);
      navigate("/dashboard");
    } catch (error: any) {
      setApiError(
        getErrorMessage(
          error,
          "Unable to withdraw listing. Bids may already exist for this listing."
        )
      );
      setShowWithdrawModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-8 py-6 text-center shadow-[var(--shadow-card)]">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-primary)]" />

          <p className="mt-3 text-sm font-semibold text-[var(--color-primary)]">
            Loading listing details...
          </p>
        </div>
      </div>
    );
  }

  if (!listing?._id) {
    return (
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <h1 className="font-serif text-2xl font-black text-[var(--color-primary)]">
          Listing not found
        </h1>

        <Link
          to="/dashboard"
          className="mt-5 inline-flex bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <Link
            to="/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Listing Details
          </p>

          <h1 className="mt-1 font-serif text-3xl font-black text-[var(--color-primary)]">
            {getListingLabel(listing)}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge
              label={formatStatus(listing?.status)}
              variant={getStatusVariant(listing?.status)}
            />

            {!canEdit && (
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                Editing is restricted after draft stage.
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          {canEdit && (
            <Link
              to={`/listings/${id}/edit`}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white"
            >
              <Edit3 className="h-4 w-4" />
              Edit Listing
            </Link>
          )}

          {canWithdraw && (
            <button
              type="button"
              onClick={() => setShowWithdrawModal(true)}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Withdraw
            </button>
          )}
        </div>
      </div>

      {apiError && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          {apiError}
        </div>
      )}

      {!canEdit && (
        <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 p-4 text-sm font-semibold text-[#7a5d00]">
          This listing is no longer in draft status, so editing is restricted.
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          label="Market Price"
          value={formatMoney(listing?.market_price)}
          icon={DollarSign}
        />

        <InfoCard label="Bids" value={bidCount} icon={Gavel} />

        <InfoCard
          label="Property Type"
          value={formatPropertyType(listing?.property_type)}
          icon={Home}
        />

        <InfoCard
          label="Created"
          value={formatDate(listing?.createdAt)}
          icon={Clock}
        />
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <PropertyImagesSection
            listingId={id}
            listingImages={listingImages}
          />

          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Property Information
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail label="Address" value={listing?.address} />
              <Detail label="State" value={listing?.state_code} />
              <Detail label="ZIP Code" value={listing?.zip_code} />
              <Detail label="Year Built" value={listing?.year_built} />
              <Detail label="Zoning" value={listing?.zoning} />
              <Detail
                label="Property Type"
                value={formatPropertyType(listing?.property_type)}
              />
              <Detail
                label="Market Price"
                value={formatMoney(listing?.market_price)}
              />
              <Detail
                label="Hidden Reserve"
                value={formatMoney(listing?.hidden_reserve)}
              />
              <Detail label="Unit Count" value={listing?.unit_count} />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
              Legal Disclosures
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail
                label="Active Liens or Mortgages"
                value={listing?.has_liens ? "Yes" : "No"}
              />
              <Detail
                label="Pre-Foreclosure"
                value={listing?.is_preforeclosure ? "Yes" : "No"}
              />
              <Detail
                label="Mortgage Amount"
                value={formatMoney(listing?.mortgage_amount)}
              />
              <Detail label="Vacant" value={listing?.is_vacant ? "Yes" : "No"} />
              <Detail
                label="Off Market"
                value={listing?.is_off_market ? "Yes" : "No"}
              />
              <Detail
                label="Proof of Funds Required"
                value={listing?.proof_of_funds_required ? "Yes" : "No"}
              />
            </div>

            <NotesBox
              label="Lien Disclosure"
              value={listing?.lien_disclosure}
            />
          </div>

          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Condition Report
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail
                label="Roof"
                value={formatCondition(listing?.condition_report?.roof)}
              />
              <Detail
                label="HVAC"
                value={formatCondition(listing?.condition_report?.hvac)}
              />
              <Detail
                label="Wetlands"
                value={listing?.condition_report?.wetlands ? "Yes" : "No"}
              />
              <Detail
                label="Overall"
                value={formatCondition(listing?.condition_report?.overall)}
              />
            </div>

            <NotesBox label="Notes" value={listing?.condition_report?.notes} />
          </div>

          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Motivation
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail label="Motivation" value={listing?.motivation} />
              <Detail label="Sell Timeline" value={listing?.sell_timeline} />
              <Detail
                label="Realtor Commission"
                value={listing?.realtor_commission}
              />
              <Detail
                label="Suggested Price"
                value={formatMoney(listing?.suggested_price)}
              />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <Link
            to={`/document-vault?listingId=${id}`}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border-light)] bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[var(--color-primary)]" />

              <span className="text-sm font-bold text-[var(--color-text-main)]">
                Document Vault
              </span>
            </div>

            <ArrowLeft className="h-4 w-4 rotate-180 text-[var(--color-text-muted)]" />
          </Link>

          <Link
            to={`/bids?listingId=${id}`}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border-light)] bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <Gavel className="h-5 w-5 text-[var(--color-primary)]" />

              <span className="text-sm font-bold text-[var(--color-text-main)]">
                View Bids
              </span>
            </div>

            <ArrowLeft className="h-4 w-4 rotate-180 text-[var(--color-text-muted)]" />
          </Link>

          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--color-primary)]" />

              <div>
                <h3 className="text-sm font-black text-[var(--color-primary)]">
                  Edit Rule
                </h3>

                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                  Listings can only be edited while they are in draft status.
                  Once a listing moves forward in the process, editing is
                  restricted.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <WithdrawListingModal
        isOpen={showWithdrawModal}
        isLoading={isDeleting}
        listingTitle={getListingLabel(listing)}
        onCancel={() => setShowWithdrawModal(false)}
        onConfirm={handleWithdraw}
      />
    </div>
  );
}