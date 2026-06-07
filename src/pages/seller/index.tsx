import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  Edit3,
  FileText,
  Gavel,
  Handshake,
  Home,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import StatusBadge from "../../components/common/StatusBadge";
import WithdrawListingModal from "../../components/common/WithdrawListingModal";
import {
  useDeleteListingMutation,
  useGetListingsDashboardQuery,
} from "../../services/listingService";

type StatusBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "gold"
  | "neutral"
  | "dark";

interface StatCardProps {
  label: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
}

const LISTINGS_PER_PAGE = 4;

function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

function getListingsFromResponse(response: any) {
  const payload = getApiPayload(response);

  if (Array.isArray(payload?.listings)) {
    return payload.listings;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
}

function getSummaryFromResponse(response: any) {
  const payload = getApiPayload(response);
  return payload?.summary ?? {};
}

function getErrorMessage(error: any, fallback: string) {
  const message = error?.data?.message || error?.data?.error || error?.error;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return message || fallback;
}

function formatMoney(value: any) {
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

function getDaysSince(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const diff = Date.now() - date.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

  return `${days}d`;
}

function getListingProgress(status?: string) {
  const normalizedStatus = String(status || "draft").toLowerCase();

  if (normalizedStatus === "closed") return 100;
  if (normalizedStatus === "under_contract") return 85;
  if (normalizedStatus === "live") return 65;
  if (normalizedStatus === "submitted") return 50;
  if (normalizedStatus === "review") return 50;
  if (normalizedStatus === "draft") return 25;

  return 35;
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

function StatCard({ label, value, note, icon: Icon }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex items-start justify-between">
        <p className="max-w-[150px] text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          {label}
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/8">
          <Icon className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
      </div>

      <div className="font-serif text-4xl font-black text-[var(--color-primary)]">
        {value}
      </div>

      <p className="mt-2 text-xs font-semibold text-[var(--color-primary)]/70">
        {note}
      </p>

      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-500 group-hover:w-full" />
    </div>
  );
}

export default function SellerDashboard() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedWithdrawListing, setSelectedWithdrawListing] =
    useState<any>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isFetching, refetch } =
    useGetListingsDashboardQuery();

  const [deleteListing] = useDeleteListingMutation();

  const listings = getListingsFromResponse(data);
  const summary = getSummaryFromResponse(data);

  const totalListings = summary?.total_listings ?? listings.length;
  const draftListings =
    summary?.draft ??
    listings.filter((listing: any) => listing?.status === "draft").length;
  const liveListings =
    summary?.live ??
    listings.filter((listing: any) => listing?.status === "live").length;
  const underContractListings =
    summary?.under_contract ??
    listings.filter((listing: any) => listing?.status === "under_contract")
      .length;

  const totalBids = listings.reduce((sum: number, listing: any) => {
    return sum + getBidCount(listing);
  }, 0);

  const totalPages = Math.max(1, Math.ceil(listings.length / LISTINGS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * LISTINGS_PER_PAGE;
  const endIndex = startIndex + LISTINGS_PER_PAGE;
  const visibleListings = listings.slice(startIndex, endIndex);

  const journeySteps = [
    {
      id: "kyc",
      icon: UserCheck,
      label: "Identity Verified",
      desc: "Complete KYC verification before full platform access.",
      done: true,
      link: "/kyc",
      linkLabel: "View",
    },
    {
      id: "listing",
      icon: Home,
      label: "Property Listed",
      desc: "Create at least one property listing.",
      done: totalListings > 0,
      link: "/list-property",
      linkLabel: totalListings > 0 ? "Add More" : "Start",
    },
    {
      id: "docs",
      icon: FileText,
      label: "Documents Uploaded",
      desc: "Upload survey and tax bill in Document Vault.",
      done: liveListings > 0 || underContractListings > 0,
      link: "/document-vault",
      linkLabel: "Upload",
    },
    {
      id: "bids",
      icon: Gavel,
      label: "Bids Received",
      desc: "Review incoming partner bids.",
      done: totalBids > 0,
      link: "/bids",
      linkLabel: "View Bids",
    },
    {
      id: "contract",
      icon: Handshake,
      label: "Deal In Progress",
      desc: "Track selected partner and deal progress.",
      done: underContractListings > 0,
      link: "/deal-tracker",
      linkLabel: "Track",
    },
  ];

  const completedSteps = journeySteps.filter((step) => step.done).length;
  const progressPct = Math.round((completedSteps / journeySteps.length) * 100);

  const handlePreviousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  };

  const handleWithdrawListing = async () => {
    const listing = selectedWithdrawListing;
    const id = String(listing?._id || "");

    if (!id) {
      setApiError("Listing ID is missing.");
      return;
    }

    if (!canWithdrawListing(listing)) {
      setApiError(
        "This listing cannot be withdrawn because bids already exist or it is already in deal flow."
      );
      setSelectedWithdrawListing(null);
      return;
    }

    try {
      setApiError(null);
      setDeletingListingId(id);

      await deleteListing(id).unwrap();

      setSelectedWithdrawListing(null);
      await refetch();
    } catch (error: any) {
      setApiError(
        getErrorMessage(
          error,
          "Unable to withdraw listing. Bids may already exist for this listing."
        )
      );
    } finally {
      setDeletingListingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-8 py-6 text-center shadow-[var(--shadow-card)]">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-primary)]" />

          <p className="mt-3 text-sm font-semibold text-[var(--color-primary)]">
            Loading seller dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-[var(--color-primary)] p-8 shadow-[var(--shadow-card)]">
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-3 py-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-secondary)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
                Seller Workspace
              </span>
            </div>

            <h1 className="font-serif text-3xl font-black text-white lg:text-4xl">
              Your Seller Dashboard
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
              Manage your listings, upload documents, review bids, and track
              deal progress in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/list-property"
              className="inline-flex items-center gap-2 bg-[var(--color-secondary)] px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              New Listing
            </Link>

            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/15"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {apiError && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          {apiError}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Listings"
          value={totalListings}
          note={`${draftListings} draft, ${liveListings} live`}
          icon={Home}
        />

        <StatCard
          label="Bids Received"
          value={totalBids}
          note="Across all seller listings"
          icon={Gavel}
        />

        <StatCard
          label="Under Contract"
          value={underContractListings}
          note="Listings currently in deal flow"
          icon={Handshake}
        />

        <StatCard
          label="Total Market Value"
          value={formatMoney(
            listings.reduce(
              (sum: number, listing: any) =>
                sum + (Number(listing?.market_price) || 0),
              0
            )
          )}
          note="Based on submitted listing prices"
          icon={DollarSign}
        />
      </section>

      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Seller Journey
            </h2>

            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {completedSteps} of {journeySteps.length} steps complete
            </p>
          </div>

          <div className="hidden w-36 sm:block">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border-light)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <p className="mt-1 text-right text-[10px] font-bold text-[var(--color-text-muted)]">
              {progressPct}% done
            </p>
          </div>
        </div>

        <div className="relative space-y-0">
          <div className="absolute left-[19px] top-5 h-[calc(100%-40px)] w-0.5 bg-[var(--color-border-light)]" />

          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            const isNext =
              !step.done &&
              journeySteps.slice(0, index).every((item) => item.done);

            return (
              <div
                key={step.id}
                className={`group relative flex items-start gap-4 py-4 ${
                  index < journeySteps.length - 1
                    ? "border-b border-[var(--color-border-light)]"
                    : ""
                }`}
              >
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    step.done
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                      : isNext
                        ? "border-[var(--color-secondary)] bg-white shadow-[0_0_0_4px_rgba(212,175,55,0.12)]"
                        : "border-[var(--color-border-light)] bg-white"
                  }`}
                >
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : isNext ? (
                    <Icon className="h-4 w-4 text-[var(--color-secondary)]" />
                  ) : (
                    <Circle className="h-4 w-4 text-[var(--color-border-light)]" />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-black ${
                        step.done
                          ? "text-[var(--color-primary)]"
                          : isNext
                            ? "text-[var(--color-text-main)]"
                            : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {step.label}

                      {step.done && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--color-primary)]">
                          Done
                        </span>
                      )}

                      {isNext && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-secondary)]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#7a5d00]">
                          Next
                        </span>
                      )}
                    </p>

                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      {step.desc}
                    </p>
                  </div>

                  {(step.done || isNext) && (
                    <Link
                      to={step.link}
                      className="shrink-0 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] hover:underline"
                    >
                      {step.linkLabel} →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
                My Listings
              </h2>

              {listings.length > 0 && (
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, listings.length)} of {listings.length}{" "}
                  listings
                </p>
              )}
            </div>

            <Link
              to="/list-property"
              className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)] underline decoration-[var(--color-secondary)]/40 underline-offset-8"
            >
              + Add Listing
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
            {listings.length === 0 ? (
              <div className="p-8 text-center">
                <Home className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" />

                <p className="mt-3 text-sm font-semibold text-[var(--color-text-main)]">
                  No listings found.
                </p>

                <Link
                  to="/list-property"
                  className="mt-4 inline-flex bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white"
                >
                  Create Listing
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="bg-[var(--color-bg-soft)]">
                      <tr>
                        {[
                          "Property",
                          "Status",
                          "Price",
                          "Bids",
                          "Created",
                          "Progress",
                          "Actions",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {visibleListings.map((listing: any) => {
                        const id = String(listing?._id || "");
                        const progress = getListingProgress(listing?.status);
                        const bidCount = getBidCount(listing);

                        return (
                          <tr
                            key={id}
                            className="border-t border-[var(--color-border-light)] transition hover:bg-[var(--color-bg-soft)]/50"
                          >
                            <td className="px-5 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-bg-soft)] text-xl">
                                  🏡
                                </div>

                                <div>
                                  <Link
                                    to={`/listings/${id}`}
                                    className="text-sm font-black text-[var(--color-primary)] hover:underline"
                                  >
                                    {getListingLabel(listing)}
                                  </Link>

                                  <p className="text-xs text-[var(--color-text-muted)]">
                                    {listing?.property_type || "-"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <StatusBadge
                                label={formatStatus(listing?.status)}
                                variant={getStatusVariant(listing?.status)}
                              />
                            </td>

                            <td className="px-5 py-5 text-sm font-bold text-[var(--color-text-main)]">
                              {formatMoney(listing?.market_price)}
                            </td>

                            <td className="px-5 py-5 text-sm font-bold text-[var(--color-text-main)]">
                              {bidCount}
                            </td>

                            <td className="px-5 py-5 text-xs text-[var(--color-text-muted)]">
                              {getDaysSince(listing?.createdAt)}
                            </td>

                            <td className="px-5 py-5">
                              <div className="w-24">
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border-light)]">
                                  <div
                                    className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>

                                <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                  {progress}%
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex flex-wrap justify-end gap-3">
                                <Link
                                  to={`/listings/${id}`}
                                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]"
                                >
                                  View
                                  <ArrowUpRight className="h-3 w-3" />
                                </Link>

                                {isDraftListing(listing) && (
                                  <Link
                                    to={`/listings/${id}/edit`}
                                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary)]"
                                  >
                                    Edit
                                    <Edit3 className="h-3 w-3" />
                                  </Link>
                                )}

                                <Link
                                  to={`/document-vault?listingId=${id}`}
                                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                                >
                                  Docs
                                  <FileText className="h-3 w-3" />
                                </Link>

                                {canWithdrawListing(listing) && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedWithdrawListing(listing)
                                    }
                                    disabled={deletingListingId === id}
                                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {deletingListingId === id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                    Withdraw
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                    Page {safeCurrentPage} of {totalPages}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePreviousPage}
                      disabled={safeCurrentPage === 1}
                      className="inline-flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary)] transition hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={safeCurrentPage === totalPages}
                      className="inline-flex items-center gap-2 bg-[var(--color-primary)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <aside>
          <h2 className="mb-5 font-serif text-2xl font-black text-[var(--color-primary)]">
            Quick Actions
          </h2>

          <div className="space-y-3">
            <Link
              to="/list-property"
              className="flex items-center justify-between rounded-xl border border-[var(--color-border-light)] bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-[var(--color-primary)]" />

                <span className="text-sm font-bold text-[var(--color-text-main)]">
                  Create New Listing
                </span>
              </div>

              <ArrowUpRight className="h-4 w-4 text-[var(--color-text-muted)]" />
            </Link>

            <Link
              to="/document-vault"
              className="flex items-center justify-between rounded-xl border border-[var(--color-border-light)] bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[var(--color-primary)]" />

                <span className="text-sm font-bold text-[var(--color-text-main)]">
                  Document Vault
                </span>
              </div>

              <ArrowUpRight className="h-4 w-4 text-[var(--color-text-muted)]" />
            </Link>

            <Link
              to="/bids"
              className="flex items-center justify-between rounded-xl border border-[var(--color-border-light)] bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-[var(--color-primary)]" />

                <span className="text-sm font-bold text-[var(--color-text-main)]">
                  View Bids
                </span>
              </div>

              <ArrowUpRight className="h-4 w-4 text-[var(--color-text-muted)]" />
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-[var(--color-primary)]" />

              <div>
                <h3 className="text-sm font-black text-[var(--color-primary)]">
                  Seller Protection
                </h3>

                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                  Draft listings can be edited. Once a listing moves forward in
                  the deal process, editing is restricted.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <WithdrawListingModal
        isOpen={Boolean(selectedWithdrawListing)}
        isLoading={Boolean(
          selectedWithdrawListing &&
            deletingListingId === String(selectedWithdrawListing?._id || "")
        )}
        listingTitle={
          selectedWithdrawListing ? getListingLabel(selectedWithdrawListing) : ""
        }
        onCancel={() => setSelectedWithdrawListing(null)}
        onConfirm={handleWithdrawListing}
      />
    </div>
  );
}