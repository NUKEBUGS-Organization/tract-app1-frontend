import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Bath,
  BedDouble,
  Calendar,
  CheckCircle,
  FileText,
  Home,
  Image as ImageIcon,
  Link as LinkIcon,
  MapPin,
  Ruler,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  useApproveAdminListingMutation,
  useDeleteAdminListingMutation,
  useGetAdminListingQuery,
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

function getRelationId(value: any) {
  if (!value) return "-";

  if (typeof value === "string") return value;

  return value._id || value.id || value._doc?._id || value._doc?.id || "-";
}

function getRelationEmail(value: any) {
  if (!value || typeof value !== "object") return "-";

  return value.email || value._doc?.email || "-";
}

function getRelationPhone(value: any) {
  if (!value || typeof value !== "object") return "-";

  return (
    value.phone ||
    value.phone_number ||
    value.phoneNumber ||
    value.mobile ||
    value.mobile_number ||
    value._doc?.phone ||
    value._doc?.phone_number ||
    value._doc?.phoneNumber ||
    value._doc?.mobile ||
    value._doc?.mobile_number ||
    "-"
  );
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
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            {label}
          </p>

          <div className="mt-2 break-words text-sm font-bold text-[var(--color-text-main)]">
            {children ?? displayValue(value)}
          </div>
        </div>

        {Icon && (
          <Icon className="h-5 w-5 shrink-0 text-[var(--color-primary)]/60" />
        )}
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

function AdminListingDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [rejectReason, setRejectReason] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    data: listing,
    isLoading,
    isError,
  } = useGetAdminListingQuery(id, {
    skip: !id,
  });

  const {
    data: documentsResponse,
    isLoading: isDocumentsLoading,
    isError: isDocumentsError,
  } = useGetListingDocumentsQuery(id, {
    skip: !id,
  });

  const [approveListing, { isLoading: isApproving }] =
    useApproveAdminListingMutation();

  const [rejectListing, { isLoading: isRejecting }] =
    useRejectAdminListingMutation();

  const [deleteListing, { isLoading: isDeleting }] =
    useDeleteAdminListingMutation();

  async function handleApprove() {
    if (!id) return;

    await approveListing(id).unwrap();
  }

  async function handleReject() {
    if (!id || rejectReason.trim().length < 3) return;

    await rejectListing({
      id,
      reason: rejectReason.trim(),
    }).unwrap();

    setIsRejectOpen(false);
    setRejectReason("");
  }

  async function handleDelete() {
    if (!id) return;

    await deleteListing(id).unwrap();

    setIsDeleteOpen(false);
    navigate("/properties", { replace: true });
  }

  if (isLoading) {
    return <Loader label="Loading listing details..." />;
  }

  if (isError || !listing) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
        Failed to load listing details.
      </div>
    );
  }

  const listingId = getMongoId(listing);
  const status = normalizeValue(listing.status);
  const seller = listing.seller_id;
  const documents = getDocumentsFromResponse(documentsResponse);

  const addressLine = getAddressLine(listing);

  const price =
    listing.price ||
    listing.asking_price ||
    listing.askingPrice ||
    listing.list_price ||
    listing.listPrice;

  const reservePrice =
    listing.reserve_price ||
    listing.reservePrice ||
    listing.hidden_reserve ||
    listing.hiddenReserve;

  return (
    <div className="space-y-8">
      {/* Page Header - same style as AdminBidDetailsPage */}
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
              Admin Listing Review
            </p>

            <h1 className="mt-2 font-serif text-3xl font-black text-[var(--color-primary)]">
              {getListingTitle(listing)}
            </h1>

            <p className="mt-2 flex items-center gap-2 text-sm leading-6 text-[var(--color-text-muted)]">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{addressLine || "-"}</span>
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge
                label={listing.status || "unknown"}
                variant={getStatusVariant(status)}
              />

              {(listing.state_code || listing.state) && (
                <StatusBadge
                  label={listing.state_code || listing.state}
                  variant="neutral"
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            {status === "submitted" && (
              <>
                <Button
                  type="button"
                  variant="primary"
                  isLoading={isApproving}
                  onClick={handleApprove}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setIsRejectOpen(true)}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <SectionBlock
        title="Property Overview"
        description="Main property information, price, size, and listing status."
        icon={<Home className="h-5 w-5" />}
      >
        <DetailItem label="Listing ID" value={listingId} />
        <DetailItem label="Title" value={getListingTitle(listing)} />
        <DetailItem label="Status">
          <StatusBadge
            label={listing.status || "unknown"}
            variant={getStatusVariant(status)}
          />
        </DetailItem>

        <DetailItem label="Property Type" value={formatLabel(listing.property_type || listing.propertyType)} />
        <DetailItem label="Price" value={formatMoney(price)} />
        <DetailItem label="Reserve Price" value={formatMoney(reservePrice)} />

        <DetailItem label="Bedrooms" value={listing.bedrooms} icon={BedDouble} />
        <DetailItem label="Bathrooms" value={listing.bathrooms} icon={Bath} />
        <DetailItem
          label="Square Feet"
          value={listing.square_feet || listing.squareFeet || listing.sqft}
          icon={Ruler}
        />

        <DetailItem
          label="Lot Size"
          value={listing.lot_size || listing.lotSize}
          icon={Ruler}
        />
        <DetailItem
          label="Year Built"
          value={listing.year_built || listing.yearBuilt}
          icon={Calendar}
        />
        <DetailItem
          label="Created At"
          value={formatDate(listing.createdAt)}
          icon={Calendar}
        />
      </SectionBlock>

      <SectionBlock
        title="Address Info"
        description="Location details attached to this listing."
        icon={<MapPin className="h-5 w-5" />}
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

      <SectionBlock
        title="Seller Info"
        description="Seller who submitted or owns this property listing."
        icon={<UserRound className="h-5 w-5" />}
      >
        <DetailItem label="Seller Name" value={getPersonName(seller)} />
        <DetailItem label="Seller ID" value={getRelationId(seller)} />
        <DetailItem label="Seller Email" value={getRelationEmail(seller)} />
        <DetailItem label="Seller Phone" value={getRelationPhone(seller)} />
      </SectionBlock>

      <SectionBlock
        title="Documents & Media"
        description="Documents and files uploaded for this listing."
        icon={<FileText className="h-5 w-5" />}
      >
        <DetailItem label="Documents Status">
          {isDocumentsLoading
            ? "Loading documents..."
            : isDocumentsError
            ? "Failed to load documents"
            : `${documents.length} document(s)`}
        </DetailItem>

        {documents.length === 0 && !isDocumentsLoading ? (
          <DetailItem label="Uploaded Documents" value="No documents uploaded" />
        ) : (
          documents.map((document: any, index: number) => {
            const documentUrl = getDocumentUrl(document);

            return (
              <DetailItem
                key={getMongoId(document) || index}
                label={getDocumentTitle(document)}
                icon={documentUrl ? LinkIcon : ImageIcon}
              >
                {documentUrl ? (
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:underline"
                  >
                    Open File
                    <LinkIcon className="h-4 w-4" />
                  </a>
                ) : (
                  "File URL not available"
                )}
              </DetailItem>
            );
          })
        )}
      </SectionBlock>

      <SectionBlock
        title="Timeline"
        description="Listing creation and update history."
        icon={<Calendar className="h-5 w-5" />}
      >
        <DetailItem label="Created At" value={formatDate(listing.createdAt)} />
        <DetailItem label="Updated At" value={formatDate(listing.updatedAt)} />
        <DetailItem label="Approved At" value={formatDate(listing.approved_at || listing.approvedAt)} />
        <DetailItem label="Rejected At" value={formatDate(listing.rejected_at || listing.rejectedAt)} />
        <DetailItem label="Deleted At" value={formatDate(listing.deleted_at || listing.deletedAt)} />
      </SectionBlock>

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
          onChange={(event) => setRejectReason(event.target.value)}
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