import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Bath,
  BedDouble,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Home,
  MapPin,
  Images,
  Ruler,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  useApproveAdminListingMutation,
  useDeleteAdminListingMutation,
  useGetAdminListingQuery,
  useGetAdminUserQuery,
  useRejectAdminListingMutation,
} from "../../services/adminService";

import { useGetListingDocumentsQuery } from "../../services/listingService";

import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";

import {
  displayValue,
  formatDate,
  getListingTitle,
  getMongoId,
  getPersonName,
  getStatusVariant,
  normalizeValue,
} from "../../utils/adminUtils";

function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

function getDocumentsFromResponse(response: any) {
  const payload = getApiPayload(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.documents)) return payload.documents;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getDoc(value: any) {
  return value?.data?._doc ?? value?._doc ?? value?.data ?? value;
}

function formatMoney(value: any) {
  if (value === undefined || value === null || value === "") return "-";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return displayValue(value);
  return numberValue.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatLabel(value: any) {
  if (!value) return "-";
  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function hasCompletePerson(value: any) {
  if (!value || typeof value !== "object") return false;
  const doc = getDoc(value);
  const hasName = Boolean(doc?.full_name );
  const hasEmail = Boolean(doc?.email);
  const hasPhone = Boolean(
    doc?.phone 
  );
  return hasName && hasEmail && hasPhone;
}

function mergePerson(primary: any, fallback: any) {
  if (!primary && !fallback) return null;
  const primaryDoc = typeof primary === "object" ? getDoc(primary) || {} : {};
  const fallbackDoc = typeof fallback === "object" ? getDoc(fallback) || {} : {};
  const primaryId =
    typeof primary === "string" ? primary : primaryDoc?._id || primaryDoc?.id;
  return {
    ...fallbackDoc,
    ...primaryDoc,
    _id: primaryId || fallbackDoc?._id || fallbackDoc?.id,
    id: primaryId || fallbackDoc?.id || fallbackDoc?._id,
    full_name:
      primaryDoc?.full_name ||
      primaryDoc?.fullName ||
      primaryDoc?.name ||
      fallbackDoc?.full_name ||
      fallbackDoc?.fullName ||
      fallbackDoc?.name,
    email: primaryDoc?.email || fallbackDoc?.email,
    phone:
      primaryDoc?.phone ||
      primaryDoc?.phone_number ||
      primaryDoc?.phoneNumber ||
      primaryDoc?.mobile ||
      primaryDoc?.mobile_number ||
      fallbackDoc?.phone ||
      fallbackDoc?.phone_number ||
      fallbackDoc?.phoneNumber ||
      fallbackDoc?.mobile ||
      fallbackDoc?.mobile_number,
  };
}

function getAddressLine(listing: any) {
  return [
    listing.address || listing.property_address || listing.street_address,
    listing.city,
    listing.state_code || listing.state,
    listing.zip_code || listing.zipCode,
  ]
    .filter(Boolean)
    .join(", ");
}

function getDocumentTitle(document: any) {
  return (
    document.title ||
    document.name ||
    document.file_name ||
    document.filename ||
    document.document_type ||
    document.type ||
    "Document"
  );
}

function getDocumentUrl(document: any) {
  return (
    document.url ||
    document.file_url ||
    document.fileUrl ||
    document.document_url ||
    document.documentUrl ||
    document.secure_url ||
    document.path ||
    ""
  );
}

function getDocumentMimeType(document: any) {
  return (
    document.mime_type ||
    document.mimeType ||
    document.file_type ||
    document.fileType ||
    ""
  );
}

function isImageDocument(document: any) {
  const mimeType = getDocumentMimeType(document).toLowerCase();
  const title = getDocumentTitle(document).toLowerCase();
  const url = getDocumentUrl(document).toLowerCase();
  if (mimeType.startsWith("image/")) return true;
  return /\.(jpg|jpeg|png|webp|gif|bmp|avif|svg)(\?.*)?$/i.test(title || url);
}

// ─── Detail Item ────────────────────────────────────────────────────────────

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
    <div className="group flex flex-col gap-1.5 rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3.5 transition hover:border-[var(--color-primary)]/20 hover:shadow-sm">
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

// ─── Section Block ───────────────────────────────────────────────────────────

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
            <p className="text-xs text-[var(--color-text-muted)] leading-5 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
    </section>
  );
}

// ─── Property Image Gallery ──────────────────────────────────────────────────

function PropertyImageGallery({
  images,
  isLoading,
}: {
  images: any[];
  isLoading: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [images.length]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <Loader label="Loading property images..." />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white px-6 py-8 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          <Images className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-semibold text-[var(--color-text-main)]">No images uploaded</p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          No property images were attached to this listing.
        </p>
      </div>
    );
  }

  const activeImage = images[activeIndex];
  const activeImageUrl = getDocumentUrl(activeImage);
  const activeImageTitle = getDocumentTitle(activeImage);

  function showPrevious() {
    setActiveIndex((c) => (c === 0 ? images.length - 1 : c - 1));
  }

  function showNext() {
    setActiveIndex((c) => (c === images.length - 1 ? 0 : c + 1));
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-light)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Images className="h-4 w-4 text-[var(--color-primary)]/60" />
          <span className="text-sm font-black text-[var(--color-primary)]">
            Listing Images
          </span>
          <span className="rounded-full bg-[var(--color-bg-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-primary)]">
            {activeIndex + 1}/{images.length}
          </span>
        </div>
        {activeImageUrl && (
          <a
            href={activeImageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition"
          >
            Full size
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Main image — compact fixed height */}
      <div className="relative bg-[var(--color-bg-soft)]">
        <div className="relative h-64 w-full overflow-hidden sm:h-80">
          <img
            src={activeImageUrl}
            alt={activeImageTitle}
            className="h-full w-full object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--color-primary)] shadow-md transition hover:scale-105 hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--color-primary)] shadow-md transition hover:scale-105 hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Image label */}
          <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-lg bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            {activeImageTitle}
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="overflow-x-auto border-t border-[var(--color-border-light)] p-3">
          <div className="flex min-w-max gap-2">
            {images.map((image: any, index: number) => {
              const imageUrl = getDocumentUrl(image);
              const title = getDocumentTitle(image);
              const isActive = index === activeIndex;
              return (
                <button
                  key={getMongoId(image) || `${imageUrl}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show ${title}`}
                  className={`relative h-14 w-20 overflow-hidden rounded-lg border-2 transition ${
                    isActive
                      ? "border-[var(--color-secondary)] shadow"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
                  {isActive && (
                    <span className="absolute inset-0 ring-2 ring-inset ring-[var(--color-secondary)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function AdminListingDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [rejectReason, setRejectReason] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: listing, isLoading, isError } = useGetAdminListingQuery(id, { skip: !id });

  const {
    data: documentsResponse,
    isLoading: isDocumentsLoading,
  } = useGetListingDocumentsQuery(id, { skip: !id });

  const sellerRaw = listing?.seller_id ?? null;
  const sellerId = getRelationIdValue(sellerRaw);
  const shouldFetchSeller = Boolean(sellerId) && !hasCompletePerson(sellerRaw);

  const { data: fetchedSeller, isLoading: isSellerLoading } = useGetAdminUserQuery(sellerId, {
    skip: !shouldFetchSeller,
  });

  const [approveListing, { isLoading: isApproving }] = useApproveAdminListingMutation();
  const [rejectListing, { isLoading: isRejecting }] = useRejectAdminListingMutation();
  const [deleteListing, { isLoading: isDeleting }] = useDeleteAdminListingMutation();

  async function handleApprove() {
    if (!id) return;
    await approveListing(id).unwrap();
  }

  async function handleReject() {
    if (!id || rejectReason.trim().length < 3) return;
    await rejectListing({ id, reason: rejectReason.trim() }).unwrap();
    setIsRejectOpen(false);
    setRejectReason("");
  }

  async function handleDelete() {
    if (!id) return;
    await deleteListing(id).unwrap();
    setIsDeleteOpen(false);
    navigate("/properties", { replace: true });
  }

  if (isLoading) return <Loader label="Loading listing details..." />;

  if (isError || !listing) {
    return (
      <div className="rounded-xl bg-white p-5 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
        Failed to load listing details.
      </div>
    );
  }

  const listingId = getMongoId(listing);
  const status = normalizeValue(listing.status);
  const seller = mergePerson(sellerRaw, fetchedSeller);
  const documents = getDocumentsFromResponse(documentsResponse);
  const propertyImages = documents.filter(
    (doc: any) => isImageDocument(doc) && Boolean(getDocumentUrl(doc))
  );
  const addressLine = getAddressLine(listing);
  const price =
    listing.price || listing.asking_price || listing.askingPrice || listing.list_price || listing.listPrice;
  const reservePrice =
    listing.reserve_price || listing.reservePrice || listing.hidden_reserve || listing.hiddenReserve;

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          {/* Left: title + meta */}
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--color-secondary)]">
              Admin · Listing Review
            </p>
            <h1 className="mt-1.5 font-serif text-2xl font-black leading-tight text-[var(--color-primary)] md:text-3xl">
              {getListingTitle(listing)}
            </h1>
            {addressLine && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {addressLine}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge
                label={listing.status || "unknown"}
                variant={getStatusVariant(status)}
              />
              {(listing.state_code || listing.state) && (
                <StatusBadge label={listing.state_code || listing.state} variant="neutral" />
              )}
              {/* Quick stats chips */}
              {price && (
                <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-[11px] font-bold text-[var(--color-text-main)]">
                  {formatMoney(price)}
                </span>
              )}
              {listing.bedrooms && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-[11px] font-bold text-[var(--color-text-main)]">
                  <BedDouble className="h-3 w-3" />
                  {listing.bedrooms} bd
                </span>
              )}
              {listing.bathrooms && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-[11px] font-bold text-[var(--color-text-main)]">
                  <Bath className="h-3 w-3" />
                  {listing.bathrooms} ba
                </span>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
            {status === "submitted" && (
              <>
                <Button type="button" variant="primary" isLoading={isApproving} onClick={handleApprove}>
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
                <Button type="button" variant="danger" onClick={() => setIsRejectOpen(true)}>
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* ── Two-column layout: gallery + property overview ───────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Gallery */}
        <PropertyImageGallery images={propertyImages} isLoading={isDocumentsLoading} />

        {/* Property Overview inline */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 pb-1 border-b border-[var(--color-border-light)]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
              <Home className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-black text-[var(--color-primary)] leading-tight">
                Property Overview
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Key listing details at a glance
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DetailItem label="Listing ID" value={listingId} />
            <DetailItem label="Status">
              <StatusBadge
                label={listing.status || "unknown"}
                variant={getStatusVariant(status)}
              />
            </DetailItem>
            <DetailItem
              label="Property Type"
              value={formatLabel(listing.property_type || listing.propertyType)}
            />
            <DetailItem label="Price" value={formatMoney(price)} />
            <DetailItem label="Reserve Price" value={formatMoney(reservePrice)} />
            <DetailItem label="Bedrooms" value={listing.bedrooms} icon={BedDouble} />
            <DetailItem label="Bathrooms" value={listing.bathrooms} icon={Bath} />
            <DetailItem
              label="Square Feet"
              value={listing.square_feet || listing.squareFeet || listing.sqft}
              icon={Ruler}
            />
            <DetailItem label="Lot Size" value={listing.lot_size || listing.lotSize} icon={Ruler} />
            <DetailItem
              label="Year Built"
              value={listing.year_built || listing.yearBuilt}
              icon={Calendar}
            />
            <DetailItem label="Created At" value={formatDate(listing.createdAt)} icon={Calendar} />
            <DetailItem label="Title" value={getListingTitle(listing)} />
          </div>
        </section>
      </div>

       {/* ── Seller Info ──────────────────────────────────────────────────── */}
      <SectionBlock
        title="Seller"
        description="The person who submitted this listing."
        icon={<UserRound className="h-4 w-4" />}
      >
        <DetailItem
          label="Name"
          value={isSellerLoading ? "Loading…" : getPersonName(seller)}
        />
        <DetailItem label="Seller ID" value={getRelationId(seller)} />
        <DetailItem
          label="Email"
          value={isSellerLoading ? "Loading…" : getRelationEmail(seller)}
        />
        <DetailItem
          label="Phone"
          value={isSellerLoading ? "Loading…" : getRelationPhone(seller)}
        />
      </SectionBlock>

      {/* ── Address Info ─────────────────────────────────────────────────── */}
      <SectionBlock
        title="Address"
        description="Location details for this listing."
        icon={<MapPin className="h-4 w-4" />}
      >
        <DetailItem
          label="Street Address"
          value={listing.address || listing.property_address || listing.street_address}
        />
        <DetailItem label="City" value={listing.city} />
        <DetailItem label="State" value={listing.state_code || listing.state} />
        <DetailItem label="Zip Code" value={listing.zip_code || listing.zipCode} />
        <DetailItem label="Full Address" value={addressLine} />
      </SectionBlock>

     

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <SectionBlock
        title="Timeline"
        description="Listing activity history."
        icon={<Calendar className="h-4 w-4" />}
      >
        <DetailItem label="Created" value={formatDate(listing.createdAt)} />
        <DetailItem label="Updated" value={formatDate(listing.updatedAt)} />
        <DetailItem
          label="Approved"
          value={formatDate(listing.approved_at || listing.approvedAt)}
        />
        <DetailItem
          label="Rejected"
          value={formatDate(listing.rejected_at || listing.rejectedAt)}
        />
        <DetailItem
          label="Deleted"
          value={formatDate(listing.deleted_at || listing.deletedAt)}
        />
      </SectionBlock>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={isRejectOpen}
        variant="danger"
        title="Reject listing?"
        description="This will mark the listing as rejected."
        icon={<XCircle className="h-5 w-5" />}
        confirmLabel="Reject Listing"
        loadingLabel="Rejecting..."
        isLoading={isRejecting}
        onCancel={() => {
          setIsRejectOpen(false);
          setRejectReason("");
        }}
        onConfirm={handleReject}
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder="Enter rejection reason..."
          className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)]"
        />
      </ConfirmModal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        variant="danger"
        title="Delete listing?"
        description="This listing will be marked as deleted by admin."
        icon={<Trash2 className="h-5 w-5" />}
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        isLoading={isDeleting}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default AdminListingDetailsPage;