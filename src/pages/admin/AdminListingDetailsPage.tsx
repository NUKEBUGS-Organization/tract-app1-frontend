import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Calendar,
  CheckCircle,
  DollarSign,
  FileText,
  Home,
  MapPin,
  Ruler,
  ShieldCheck,
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
import {DetailPageSkeleton} from "../../components/common/Skeleton"
import StatusBadge from "../../components/common/StatusBadge";

import {
  formatDate,
  getListingTitle,
  getMongoId,
  getPersonName,
  getStatusVariant,
  normalizeValue,
} from "../../utils/adminUtils";

import {
  DetailItem,
  MetricCard,
  SectionBlock,
} from "./components/AdminDetailPrimitives";

import ListingDocumentsPanel from "./components/ListingDocumentsPanel";
import ListingTimelineStepper from "./components/ListingTimelineStepper";
import PropertyImageGallery from "./components/PropertyImageGallery";

import {
  formatLabel,
  formatMoney,
  formatStatusLabel,
  getAddressLine,
  getApprovedAt,
  getDeletedAt,
  getDoc,
  getDocumentsFromResponse,
  getListingImageItems,
  getListingPrice,
  getListingReservePrice,
  getListingTimelineSteps,
  getRejectedAt,
  getRelationEmail,
  getRelationId,
  getRelationIdValue,
  getRelationPhone,
  hasCompletePerson,
  isImageDocument,
  mergePerson,
} from "./components/listingDetailHelpers";

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
  } = useGetAdminListingQuery(id, { skip: !id });

  const listingDoc = getDoc(listing);

  const {
    data: documentsResponse,
    isLoading: isDocumentsLoading,
  } = useGetListingDocumentsQuery(id, { skip: !id });

  const sellerRaw = listingDoc?.seller_id ?? null;
  const sellerId = getRelationIdValue(sellerRaw);
  const shouldFetchSeller = Boolean(sellerId) && !hasCompletePerson(sellerRaw);

  const { data: fetchedSeller, isLoading: isSellerLoading } =
    useGetAdminUserQuery(sellerId, {
      skip: !shouldFetchSeller,
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

 if (isLoading) {
  return <DetailPageSkeleton />;
}

  if (isError || !listingDoc) {
    return (
      <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-base font-black text-[var(--color-danger)]">
          Failed to load listing details
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
          The listing could not be loaded. Please go back and try again.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/properties")}
          className="mt-4 justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Button>
      </div>
    );
  }

  const listingId = getMongoId(listingDoc);
  const status = normalizeValue(listingDoc.status);
  const formattedStatus = formatStatusLabel(listingDoc.status || status);

  const seller = mergePerson(sellerRaw, fetchedSeller);

  const documents = getDocumentsFromResponse(documentsResponse);

  const propertyImages = getListingImageItems(listingDoc, documents);

  const supportingDocuments = documents.filter(
    (document: any) => !isImageDocument(document)
  );

  const addressLine = getAddressLine(listingDoc);
  const price = getListingPrice(listingDoc);
  const reservePrice = getListingReservePrice(listingDoc);
  const timelineSteps = getListingTimelineSteps(listingDoc);

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <button
        type="button"
        onClick={() => navigate("/properties")}
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] shadow-sm transition hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Listings
      </button>

      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--color-secondary)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Listing Review
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              {getListingTitle(listingDoc)}
            </h1>

            {addressLine && (
              <p className="mt-3 flex max-w-3xl items-start gap-2 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="break-words">{addressLine}</span>
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge
                label={formattedStatus}
                variant={getStatusVariant(status)}
              />

              {(listingDoc.state_code || listingDoc.state) && (
                <StatusBadge
                  label={listingDoc.state_code || listingDoc.state}
                  variant="neutral"
                />
              )}

              {listingDoc.property_type || listingDoc.propertyType ? (
                <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-black text-[var(--color-primary)]">
                  {formatLabel(
                    listingDoc.property_type || listingDoc.propertyType
                  )}
                </span>
              ) : null}

              <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-black text-[var(--color-text-muted)]">
                ID: {listingId}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
            {status === "submitted" && (
              <>
                <Button
                  type="button"
                  variant="primary"
                  isLoading={isApproving}
                  onClick={handleApprove}
                  className="justify-center"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setIsRejectOpen(true)}
                  className="justify-center"
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
              className="justify-center"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </section>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
  <MetricCard
    label="Asking Price"
    value={formatMoney(price)}
    helper="Mapped from market_price"
    featured
    icon={<DollarSign className="h-5 w-5" aria-hidden="true" />}
  />

  <MetricCard
    label="Reserve Price"
    value={formatMoney(reservePrice)}
    helper="Mapped from hidden_reserve"
    icon={<DollarSign className="h-5 w-5" aria-hidden="true" />}
  />

  <MetricCard
    label="Bid Count"
    value={listingDoc.bid_count ?? "-"}
    helper="Total bids received"
    icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
  />

  <MetricCard
    label="Created"
    value={formatDate(listingDoc.createdAt)}
    helper="Listing creation date"
    icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
  />
</div>

      <ListingTimelineStepper steps={timelineSteps} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px] 2xl:grid-cols-[minmax(0,1.15fr)_420px]">
        <main className="min-w-0 space-y-6">
          <PropertyImageGallery
            images={propertyImages}
            isLoading={isDocumentsLoading}
          />

          <SectionBlock
            title="Property Overview"
            description="Core property facts needed during admin review."
            icon={<Home className="h-5 w-5" aria-hidden="true" />}
          >
            <DetailItem label="Listing ID" value={listingId} featured />

            <DetailItem label="Status">
              <StatusBadge
                label={formattedStatus}
                variant={getStatusVariant(status)}
              />
            </DetailItem>

            <DetailItem
              label="Property Type"
              value={formatLabel(
                listingDoc.property_type || listingDoc.propertyType
              )}
            />

            <DetailItem
              label="Asking Price"
              value={formatMoney(price)}
              featured
            />

            <DetailItem
              label="Hidden Reserve"
              value={formatMoney(reservePrice)}
            />

            <DetailItem
              label="Market Price"
              value={formatMoney(listingDoc.market_price)}
            />

            <DetailItem
              label="Suggested Price"
              value={formatMoney(listingDoc.suggested_price)}
            />

            <DetailItem
              label="Mortgage Amount"
              value={formatMoney(listingDoc.mortgage_amount)}
            />

            <DetailItem
              label="Realtor Commission"
              value={
                listingDoc.realtor_commission !== undefined &&
                listingDoc.realtor_commission !== null
                  ? `${listingDoc.realtor_commission}%`
                  : "-"
              }
            />

            <DetailItem label="Bid Count" value={listingDoc.bid_count} />

            <DetailItem
              label="Bedrooms"
              value={listingDoc.bedrooms}
              icon={BedDouble}
            />

            <DetailItem
              label="Bathrooms"
              value={listingDoc.bathrooms}
              icon={Bath}
            />

            <DetailItem
              label="Square Feet"
              value={
                listingDoc.square_feet ||
                listingDoc.squareFeet ||
                listingDoc.sqft
              }
              icon={Ruler}
            />

            <DetailItem
              label="Lot Size"
              value={listingDoc.lot_size || listingDoc.lotSize}
              icon={Ruler}
            />

            <DetailItem
              label="Year Built"
              value={listingDoc.year_built || listingDoc.yearBuilt}
              icon={Calendar}
            />

            <DetailItem label="Zoning" value={listingDoc.zoning} />

            <DetailItem label="Unit Count" value={listingDoc.unit_count} />

            <DetailItem
              label="Proof Of Funds Required"
              value={listingDoc.proof_of_funds_required}
            />

            <DetailItem label="Off Market" value={listingDoc.is_off_market} />

            <DetailItem label="Vacant" value={listingDoc.is_vacant} />

            <DetailItem
              label="Pre-Foreclosure"
              value={listingDoc.is_preforeclosure}
            />

            <DetailItem label="Has Liens" value={listingDoc.has_liens} />

            <DetailItem
              label="Lien Disclosure"
              value={listingDoc.lien_disclosure}
            />

            <DetailItem label="Motivation" value={listingDoc.motivation} />

            <DetailItem
              label="Sell Timeline"
              value={listingDoc.sell_timeline}
            />

            <DetailItem
              label="Created At"
              value={formatDate(listingDoc.createdAt)}
              icon={Calendar}
            />

            <DetailItem
              label="Updated At"
              value={formatDate(listingDoc.updatedAt)}
              icon={Calendar}
            />

            <DetailItem label="Title" value={getListingTitle(listingDoc)} />
          </SectionBlock>

          {listingDoc.condition_report && (
            <SectionBlock
              title="Condition Report"
              description="Property condition details submitted with the listing."
              icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
            >
              <DetailItem
                label="Roof"
                value={formatLabel(listingDoc.condition_report.roof)}
              />

              <DetailItem
                label="HVAC"
                value={formatLabel(listingDoc.condition_report.hvac)}
              />

              <DetailItem
                label="Overall"
                value={formatLabel(listingDoc.condition_report.overall)}
                featured
              />

              <DetailItem
                label="Wetlands"
                value={listingDoc.condition_report.wetlands}
              />

              <DetailItem
                label="Notes"
                value={listingDoc.condition_report.notes}
              />
            </SectionBlock>
          )}

          <SectionBlock
            title="Address"
            description="Location information connected with this property."
            icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
          >
            <DetailItem
              label="Street Address"
              value={
                listingDoc.address ||
                listingDoc.property_address ||
                listingDoc.street_address
              }
            />

            <DetailItem label="City" value={listingDoc.city} />

            <DetailItem
              label="State"
              value={listingDoc.state_code || listingDoc.state}
            />

            <DetailItem
              label="Zip Code"
              value={listingDoc.zip_code || listingDoc.zipCode}
            />

            <DetailItem label="Full Address" value={addressLine} featured />
          </SectionBlock>

          <SectionBlock
            title="Activity Dates"
            description="Important timestamps captured for this listing."
            icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
          >
            <DetailItem
              label="Created"
              value={formatDate(listingDoc.createdAt)}
            />

            <DetailItem
              label="Updated"
              value={formatDate(listingDoc.updatedAt)}
            />

            <DetailItem
              label="Approved"
              value={formatDate(getApprovedAt(listingDoc))}
            />

            <DetailItem
              label="Rejected"
              value={formatDate(getRejectedAt(listingDoc))}
            />

            <DetailItem
              label="Deleted"
              value={formatDate(getDeletedAt(listingDoc))}
            />

            <DetailItem
              label="Live At"
              value={formatDate(listingDoc.live_at || listingDoc.liveAt)}
            />
          </SectionBlock>
        </main>

        <aside className="min-w-0 space-y-6 xl:sticky xl:top-6 xl:self-start">
          <SectionBlock
            title="Seller"
            description="Seller contact details for quick review."
            icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
            columns="compact"
          >
            <DetailItem
              label="Name"
              value={isSellerLoading ? "Loading…" : getPersonName(seller)}
              featured
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

          <section className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-primary)] p-5 text-white shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>

             <div>
  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65">
    Review Snapshot
  </p>

  <h2 className="mt-1 font-serif text-xl font-black">
    Key Listing Data
  </h2>
</div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                <span className="text-sm font-semibold text-white/70">
                  Asking Price
                </span>
                <span className="text-sm font-black">
                  {formatMoney(price)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                <span className="text-sm font-semibold text-white/70">
                  Reserve
                </span>
                <span className="text-sm font-black">
                  {formatMoney(reservePrice)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                <span className="text-sm font-semibold text-white/70">
                  Images
                </span>
                <span className="text-sm font-black">
                  {propertyImages.length}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                <span className="text-sm font-semibold text-white/70">
                  Files
                </span>
                <span className="text-sm font-black">
                  {supportingDocuments.length}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                <span className="text-sm font-semibold text-white/70">
                  Seller
                </span>
                <span className="break-words text-right text-sm font-black">
                  {isSellerLoading ? "Loading…" : getPersonName(seller)}
                </span>
              </div>
            </div>
          </section>

          <ListingDocumentsPanel
            documents={supportingDocuments}
            isLoading={isDocumentsLoading}
          />

          <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>

              <div>
                <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                  Admin Actions
                </h2>

                <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                  Actions remain protected by confirmation modals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {status === "submitted" && (
                <>
                  <Button
                    type="button"
                    variant="primary"
                    isLoading={isApproving}
                    onClick={handleApprove}
                    className="w-full justify-center"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Listing
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => setIsRejectOpen(true)}
                    className="w-full justify-center"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Listing
                  </Button>
                </>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteOpen(true)}
                className="w-full justify-center"
              >
                <Trash2 className="h-4 w-4" />
                Delete Listing
              </Button>
            </div>
          </section>
        </aside>
      </div>

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
        <div>
          <label
            htmlFor="listing-reject-reason"
            className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]"
          >
            Rejection reason
          </label>

          <textarea
            id="listing-reject-reason"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            rows={4}
            placeholder="Enter rejection reason..."
            className="w-full resize-none rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />

          <p className="mt-2 text-xs font-semibold text-[var(--color-text-muted)]">
            Minimum 3 characters are required before rejection can be submitted.
          </p>
        </div>
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