import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Edit3,
  FileText,
  Gavel,
  Home,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import StatusBadge from "../../components/common/StatusBadge";
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
  if (normalizedStatus === "rejected") return "danger";
  if (normalizedStatus === "paused") return "warning";

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

function getListingLabel(listing: any) {
  const address = listing?.address || "Untitled Listing";
  const state = listing?.state_code ? `, ${listing.state_code}` : "";
  const zip = listing?.zip_code ? ` ${listing.zip_code}` : "";

  return `${address}${state}${zip}`;
}

function getListingStatus(listing: any) {
  return String(listing?.status || "").toLowerCase();
}

function isDraftListing(listing: any) {
  return getListingStatus(listing) === "draft";
}

function isWithdrawnListing(listing: any) {
  return getListingStatus(listing) === "withdrawn";
}

function isSubmittedListing(listing: any) {
  return getListingStatus(listing) === "submitted";
}

function isLiveListing(listing: any) {
  return getListingStatus(listing) === "live";
}

function isEditableListing(listing: any) {
  const status = getListingStatus(listing);

  return status === "draft" || status === "withdrawn";
}

function getBidCount(listing: any) {
  return (
    Number(listing?.bid_count) ||
    Number(listing?.bids_summary?.total) ||
    Number(Array.isArray(listing?.bids) ? listing.bids.length : 0)
  );
}

function canWithdrawListing(listing: any) {
  const status = getListingStatus(listing);
  const bidCount = getBidCount(listing);

  return status === "live" && bidCount === 0;
}

function getImageUrls(listing: any): string[] {
  if (!Array.isArray(listing?.picture_urls)) {
    return [];
  }

  return listing.picture_urls
    .map((item: any): string => {
      if (typeof item === "string") return item;

      return item?.url || item?.signed_url || item?.file_url || item?.src || "";
    })
    .map((url: string) => String(url || "").trim())
    .filter(Boolean)
    .filter(
      (url: string, index: number, array: string[]) =>
        array.findIndex((item: string) => item === url) === index
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

function SideAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: any;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-[var(--color-border-light)] bg-white px-5 py-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30"
    >
      <span className="inline-flex items-center gap-3 text-sm font-black text-[var(--color-text-main)]">
        <Icon className="h-5 w-5 text-[var(--color-primary)]" />
        {label}
      </span>

      <span className="text-lg text-[var(--color-text-muted)] transition group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

function WithdrawConfirmModal({
  isOpen,
  isLoading,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isLoading ? undefined : onCancel}
      />

      <div className="relative w-full max-w-lg rounded-3xl border border-[var(--color-border-light)] bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
          <Trash2 className="h-6 w-6" />
        </div>

        <h2 className="mt-5 font-serif text-2xl font-black text-[var(--color-primary)]">
          Withdraw listing to edit?
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
          This will move the live listing to withdrawn status. Then you can edit
          it and submit it again for admin review.
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 p-4 text-sm font-semibold text-[#7a5d00]">
          This action is allowed only before bids are placed.
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="border border-[var(--color-border-light)] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-text-main)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-danger)] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Withdraw to Edit
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PropertyImageGallery({ listing }: { listing: any }) {
const images: string[] = getImageUrls(listing);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const activeImage = images[activeIndex];

  useEffect(() => {
    if (activeIndex > images.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, images.length]);

  useEffect(() => {
    if (!previewOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [previewOpen]);

  const goPrevious = () => {
    if (!images.length) return;

    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const goNext = () => {
    if (!images.length) return;

    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  };

  if (!images.length) {
    return (
      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="mb-5 flex items-center gap-2">
          <Camera className="h-5 w-5 text-[var(--color-secondary)]" />
          <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
            Property Photos
          </h2>
        </div>

        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-8 text-center">
          <ImageIcon className="h-10 w-10 text-[var(--color-text-muted)]" />
          <p className="mt-3 text-sm font-bold text-[var(--color-text-muted)]">
            No property photos uploaded yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border-light)] px-6 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
              Media Gallery
            </p>

            <div className="mt-1 flex items-center gap-2">
              <Camera className="h-5 w-5 text-[var(--color-secondary)]" />
              <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
                Property Photos
              </h2>
            </div>
          </div>

          <span className="rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)] shadow-[var(--shadow-card)]">
            {images.length} photo{images.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
          <div className="relative min-h-[360px] bg-[var(--color-primary)]/5">
            <img
              src={activeImage}
              alt="Property preview"
              className="h-[420px] w-full object-cover"
            />

            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-primary)] shadow-xl transition hover:scale-105"
            >
              <Maximize2 className="h-4 w-4" />
              View Large
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrevious}
                  className="absolute left-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-primary)] shadow-xl transition hover:scale-105"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-primary)] shadow-xl transition hover:scale-105"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          <div className="border-t border-[var(--color-border-light)] p-5 lg:border-l lg:border-t-0">
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Gallery
            </p>

            <div className="grid grid-cols-3 gap-3 lg:grid-cols-2">
{images.map((imageUrl: string, index: number) => {
                const active = index === activeIndex;

                return (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-2xl border transition ${
                      active
                        ? "border-[var(--color-secondary)] ring-2 ring-[var(--color-secondary)]/40"
                        : "border-[var(--color-border-light)] hover:border-[var(--color-primary)]"
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Property thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {active && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <span className="rounded-full bg-white px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--color-primary)]">
                          Selected
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {previewOpen &&
        activeImage &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex h-screen w-screen items-center justify-center overflow-hidden bg-black/80 p-6 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--color-primary)] shadow-xl transition hover:scale-105"
            >
              <X className="h-5 w-5" />
            </button>

            {images.length > 1 && (
              <button
                type="button"
                onClick={goPrevious}
                className="absolute left-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-primary)] shadow-xl transition hover:scale-105"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <div className="relative flex max-h-[88vh] max-w-[88vw] items-center justify-center rounded-3xl bg-white p-3 shadow-2xl">
              <img
                src={activeImage}
                alt="Large property preview"
                className="max-h-[82vh] max-w-[84vw] rounded-2xl object-contain"
              />

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-5 py-2 text-sm font-bold text-white shadow-lg">
                {activeIndex + 1} / {images.length}
              </div>
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-primary)] shadow-xl transition hover:scale-105"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export default function ListingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const refreshListingKey = (
    location.state as { refreshListing?: number } | null
  )?.refreshListing;

  const { data, isLoading, isFetching, refetch } = useGetListingByIdQuery(
    id || "",
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    }
  );

  const [deleteListing, { isLoading: isDeleting }] = useDeleteListingMutation();

  useEffect(() => {
    if (refreshListingKey) {
      refetch();
    }
  }, [refreshListingKey, refetch]);

  if (!id) {
    return <Navigate to="/dashboard" replace />;
  }

  const listing = getListingFromResponse(data);
  const bidCount = getBidCount(listing);

  const canEdit = isEditableListing(listing);
  const isDraft = isDraftListing(listing);
  const isLive = isLiveListing(listing);
  const isWithdrawn = isWithdrawnListing(listing);
  const isSubmitted = isSubmittedListing(listing);
  const canWithdraw = canWithdrawListing(listing);
  const showWithdrawButton = isLive;

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

      navigate(`/listings/${id}/edit`, {
        replace: true,
        state: {
          refreshListing: Date.now(),
        },
      });
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

            {isDraft && (
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                Draft listing can be edited before submission.
              </span>
            )}

            {isWithdrawn && (
              <span className="text-xs font-semibold text-[var(--color-danger)]">
                Withdrawn listing can be edited and submitted again.
              </span>
            )}

            {isSubmitted && (
              <span className="text-xs font-semibold text-[var(--color-secondary)]">
                Waiting for admin review.
              </span>
            )}

            {isLive && (
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                Withdraw first if you need to edit this listing.
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

          {showWithdrawButton && (
            <button
              type="button"
              onClick={() => setShowWithdrawModal(true)}
              disabled={isDeleting || !canWithdraw}
              className="inline-flex items-center gap-2 border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-60"
              title={
                !canWithdraw
                  ? "This listing cannot be withdrawn because bids already exist."
                  : "Withdraw listing to edit it"
              }
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Withdraw to Edit
            </button>
          )}
        </div>
      </div>

      {apiError && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          {apiError}
        </div>
      )}

      {isLive && (
        <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 p-4 text-sm font-semibold text-[#7a5d00]">
          To edit this live listing, withdraw it first. After editing, submit it
          again for admin review.
        </div>
      )}

      {isWithdrawn && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          This listing is withdrawn. You can edit it and submit it again for
          admin review.
        </div>
      )}

      {isSubmitted && (
        <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 p-4 text-sm font-semibold text-[#7a5d00]">
          This listing has been submitted for admin review. Editing is now
          restricted.
        </div>
      )}

      {!canEdit && !isLive && !isWithdrawn && !isSubmitted && (
        <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 p-4 text-sm font-semibold text-[#7a5d00]">
          This listing cannot be edited in its current status.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
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
          value={formatDate(listing?.createdAt || listing?.created_at)}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <PropertyImageGallery listing={listing} />

          <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Property Information
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Address" value={listing?.address} />
              <Detail label="State" value={listing?.state_code} />
              <Detail label="ZIP Code" value={listing?.zip_code} />
              <Detail label="Year Built" value={listing?.year_built} />
              <Detail label="Zoning" value={listing?.zoning} />
              <Detail label="Unit Count" value={listing?.unit_count} />
              <Detail
                label="Hidden Reserve"
                value={formatMoney(listing?.hidden_reserve)}
              />
              <Detail
                label="Suggested Price"
                value={formatMoney(listing?.suggested_price)}
              />
              <Detail
                label="Mortgage Amount"
                value={formatMoney(listing?.mortgage_amount)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Disclosures
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Has Liens" value={listing?.has_liens ? "Yes" : "No"} />
              <Detail
                label="Pre-Foreclosure"
                value={listing?.is_preforeclosure ? "Yes" : "No"}
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
              <Detail
                label="Realtor Commission"
                value={
                  isPlaceholderValue(listing?.realtor_commission)
                    ? "-"
                    : `${listing.realtor_commission}%`
                }
              />
            </div>

            <NotesBox label="Lien Disclosure" value={listing?.lien_disclosure} />
          </section>

          <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Condition Report
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Detail
                label="Roof"
                value={formatCondition(listing?.condition_report?.roof)}
              />
              <Detail
                label="HVAC"
                value={formatCondition(listing?.condition_report?.hvac)}
              />
              <Detail
                label="Overall"
                value={formatCondition(listing?.condition_report?.overall)}
              />
              <Detail
                label="Wetlands"
                value={listing?.condition_report?.wetlands ? "Yes" : "No"}
              />
            </div>

            <NotesBox
              label="Condition Notes"
              value={listing?.condition_report?.notes}
            />
          </section>

          <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Seller Motivation
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Detail label="Motivation" value={listing?.motivation} />
              <Detail label="Sell Timeline" value={listing?.sell_timeline} />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <SideAction
            to={`/listings/${id}/documents`}
            icon={FileText}
            label="Document Vault"
          />

          <SideAction
            to={`/listings/${id}/bids`}
            icon={Gavel}
            label="View Bids"
          />

          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <p className="text-sm font-black text-[var(--color-primary)]">
              Edit Rule
            </p>

            <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
              Draft and withdrawn listings can be edited. To edit a live
              listing, withdraw it first. After editing, submit it again for
              admin review. Submitted, under contract, and closed listings
              cannot be edited.
            </p>
          </div>
        </aside>
      </div>

      <WithdrawConfirmModal
        isOpen={showWithdrawModal}
        isLoading={isDeleting}
        onCancel={() => setShowWithdrawModal(false)}
        onConfirm={handleWithdraw}
      />
    </div>
  );
}