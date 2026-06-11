
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock3,
  FileSignature,
  FileText,
  Handshake,
  Loader2,
  RefreshCw,
  ShieldCheck,
  
} from "lucide-react";

import {
  useGetListingBidsQuery,
  useGetListingsDashboardQuery,
} from "../../services/listingService";

import {
  useCancelContractMutation,
  useCreateContractMutation,
  useGetContractByIdQuery,
  useSignContractAsSellerMutation,
} from "../../services/contractService";

function getDashboardPayload(response: any) {
  return response?.data ?? response ?? {};
}

function getListingsFromDashboard(response: any) {
  const payload = getDashboardPayload(response);
  return Array.isArray(payload?.listings) ? payload.listings : [];
}

function getId(item: any) {
  return item?._id || item?.id || "";
}

function getListingLabel(listing: any) {
  if (!listing) return "No listing selected";

  const address = listing?.address || "Untitled Listing";
  const state = listing?.state_code ? `, ${listing.state_code}` : "";
  const zip = listing?.zip_code ? ` ${listing.zip_code}` : "";

  return `${address}${state}${zip}`;
}

function getSelectedBid(bids: any[]) {
  return bids.find(
    (bid) => String(bid?.status || "").toLowerCase() === "selected"
  );
}

function getBidderName(bid: any, contract?: any) {
  return (
    bid?.bidder_id?.full_name ||
    bid?.bidder_id?.email ||
    contract?.buyer_id?.full_name ||
    contract?.buyer_id?.email ||
    "Selected Partner"
  );
}

function formatMoney(value: any) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return "-";

  return numberValue.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatDateTime(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status?: string) {
  if (!status) return "Not Started";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getErrorMessage(error: any, fallback: string) {
  const message = error?.data?.message || error?.data?.error || error?.error;

  if (Array.isArray(message)) return message.join(", ");

  return message || fallback;
}

function StatusPill({ status }: { status?: string }) {
  const normalized = String(status || "not_started").toLowerCase();

  const className =
    normalized === "signed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : normalized === "cancelled" || normalized === "canceled"
        ? "border-red-200 bg-red-50 text-red-700"
        : normalized === "pending"
          ? "border-yellow-200 bg-yellow-50 text-yellow-700"
          : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${className}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {title}
        </p>
        <Icon className="h-5 w-5 text-[var(--color-primary)]" />
      </div>

      <p className="break-words font-serif text-xl font-black text-[var(--color-primary)]">
        {value}
      </p>
    </div>
  );
}

function TrackerStep({
  title,
  description,
  done,
  current,

}: {
  title: string;
  description: string;
  done?: boolean;
  current?: boolean;
  locked?: boolean;
}) {
  return (
    <div className="relative flex gap-4 rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${done
            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
            : current
              ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
              : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
          }`}
      >
        {done ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : current ? (
          <Clock3 className="h-5 w-5" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-black text-[var(--color-primary)]">{title}</h3>

        </div>

        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function DealTrackerPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const listingIdFromUrl = searchParams.get("listingId") || "";
  const contractIdFromUrl = searchParams.get("contractId") || "";

  const [localContract, setLocalContract] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    isFetching: isFetchingDashboard,
    refetch: refetchDashboard,
  } = useGetListingsDashboardQuery();

  const listings = getListingsFromDashboard(dashboardData);

  const selectedListing =
    listings.find((listing: any) => getId(listing) === listingIdFromUrl) ||
    listings.find((listing: any) =>
      ["under_contract", "live"].includes(String(listing?.status).toLowerCase())
    ) ||
    listings[0];

  const activeListingId = listingIdFromUrl || getId(selectedListing);

  const activeListing =
    listings.find((listing: any) => getId(listing) === activeListingId) ||
    selectedListing;

  const {
    data: bidsData = [],
    isLoading: isLoadingBids,
    isFetching: isFetchingBids,
    refetch: refetchBids,
  } = useGetListingBidsQuery(activeListingId, {
    skip: !activeListingId,
  });

  const {
    data: fetchedContract,
    isLoading: isLoadingContract,
    isFetching: isFetchingContract,
    refetch: refetchContract,
  } = useGetContractByIdQuery(contractIdFromUrl, {
    skip: !contractIdFromUrl,
  });

  const [createContract, { isLoading: isCreatingContract }] =
    useCreateContractMutation();

  const [signContractAsSeller, { isLoading: isSigningSeller }] =
    useSignContractAsSellerMutation();

  const [cancelContract, { isLoading: isCancellingContract }] =
    useCancelContractMutation();

  const bids = Array.isArray(bidsData) ? bidsData : [];
  const selectedBid = getSelectedBid(bids);

  const contract = localContract || fetchedContract;
  const contractId = getId(contract);

  const contractStatus = String(contract?.status || "").toLowerCase();

  const isPending = contractStatus === "pending";
  const isSigned = contractStatus === "signed";
  const isCancelled =
    contractStatus === "cancelled" || contractStatus === "canceled";

  const sellerSigned = Boolean(contract?.seller_signed_at);
  const buyerSigned = Boolean(contract?.buyer_signed_at);

  const partnerName = getBidderName(selectedBid, contract);

  const dealTitle =
    getListingLabel(activeListing) ||
    getListingLabel(contract?.property_id) ||
    "Deal Tracker";

  const isBusy =
    isLoadingDashboard ||
    isFetchingDashboard ||
    isLoadingBids ||
    isFetchingBids ||
    isLoadingContract ||
    isFetchingContract ||
    isCreatingContract ||
    isSigningSeller ||
    isCancellingContract;

  const trackerSteps = useMemo(
    () => [
      {
        title: "Partner Selected",
        description: selectedBid
          ? `${partnerName} is selected as the primary partner for this listing.`
          : "Seller must select one primary bid before contract creation.",
        done: Boolean(selectedBid || contract),
        current: !selectedBid && !contract,
        locked: false,
      },
      {
        title: "Contract Created",
        description: contract
          ? `Contract created. Contract ID: ${contractId}`
          : "Create a contract from the selected bid.",
        done: Boolean(contract),
        current: Boolean(selectedBid && !contract),
        locked: false,
      },
      {
        title: "Seller Signed",
        description: sellerSigned
          ? `Seller signed at ${formatDateTime(contract?.seller_signed_at)}.`
          : "Seller signature is still pending.",
        done: sellerSigned,
        current: Boolean(contract && !sellerSigned && !isCancelled),
        locked: false,
      },
      {
        title: "Buyer Signed",
        description: buyerSigned
          ? `Buyer signed at ${formatDateTime(contract?.buyer_signed_at)}.`
          : "Buyer signature is pending. This requires buyer-side login/action.",
        done: buyerSigned,
        current: Boolean(contract && sellerSigned && !buyerSigned && !isCancelled),
        locked: false,
      },
      {
        title: "Partnership Secured",
        description: isSigned
          ? "Both parties signed. Deal is officially secured."
          : "This becomes complete when both seller and buyer have signed.",
        done: isSigned,
        current: Boolean(contract && sellerSigned && buyerSigned && !isSigned),
        locked: false,
      },
      {
        title: "Marketing & Buyer Matching",
        description:
          "72-hour marketing proof tracking.",
        done: false,
        current: false,
        locked: true,
      },
      {
        title: "Inspection, Title & Escrow",
        description:
          "Inspection countdown, title, escrow, and closing progress.",
        done: false,
        current: false,
        locked: true,
      },
    ],
    [
      selectedBid,
      contract,
      contractId,
      partnerName,
      sellerSigned,
      buyerSigned,
      isSigned,
      isCancelled,
    ]
  );

  async function handleRefresh() {
    setApiError(null);

    await refetchDashboard();

    if (activeListingId) {
      await refetchBids();
    }

    if (contractIdFromUrl) {
      await refetchContract();
    }
  }

  async function handleListingChange(listingId: string) {
    setLocalContract(null);
    setApiError(null);

    setSearchParams({
      listingId,
    });
  }

  async function handleCreateOrLoadContract() {
    if (!activeListingId || !selectedBid) return;

    try {
      setApiError(null);

      const created = await createContract({
        listingId: activeListingId,
        body: {
          bid_id: getId(selectedBid),
          pdf_url: "https://example.com/dummy-contract.pdf",
        },
      }).unwrap();

      setLocalContract(created);

      setSearchParams({
        listingId: activeListingId,
        contractId: getId(created),
      });
    } catch (error: any) {
      setApiError(
        getErrorMessage(error, "Unable to create contract from selected bid.")
      );
    }
  }

  async function handleSellerSign() {
    if (!contractId) {
      setApiError("Contract ID is missing. Please refresh the page or load a valid contract.");
      return;
    }

    try {
      setApiError(null);

      const updated = await signContractAsSeller(contractId).unwrap();
      setLocalContract(updated);

      setSearchParams({
        listingId: activeListingId,
        contractId,
      });
    } catch (error: any) {
      setApiError(getErrorMessage(error, "Unable to sign contract as seller."));
    }
  }


  async function handleCancelContract() {
    if (!contractId) return;

    try {
      setApiError(null);

      const updated = await cancelContract(contractId).unwrap();
      setLocalContract(updated);
    } catch (error: any) {
      setApiError(getErrorMessage(error, "Unable to cancel contract."));
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Seller Portal
          </p>

          <h1 className="mt-1 font-serif text-3xl font-black text-[var(--color-primary)]">
            Deal Tracker
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Track the selected partner, contract signatures, and deal progress.

          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isBusy}
          className="flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] transition hover:border-[var(--color-secondary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isBusy ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {apiError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {apiError}
        </div>
      )}

      {isCancelled && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          This contract is cancelled. Deal tracker actions are disabled for this
          deal.
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Select Listing
        </label>

        <select
          value={activeListingId}
          onChange={(event) => handleListingChange(event.target.value)}
          className="mt-3 w-full border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm font-bold text-[var(--color-primary)] outline-none focus:border-[var(--color-secondary)]"
        >
          {listings.length === 0 && <option value="">No listings found</option>}

          {listings.map((listing: any) => (
            <option key={getId(listing)} value={getId(listing)}>
              {getListingLabel(listing)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard
          title="Contract Status"
          value={contract ? formatStatus(contract?.status) : "Not Created"}
          icon={FileText}
        />

        <StatCard
          title="Selected Partner"
          value={selectedBid || contract ? partnerName : "-"}
          icon={Handshake}
        />

        <StatCard
          title="Net To Seller"
          value={
            selectedBid
              ? formatMoney(selectedBid?.net_to_seller)
              : contract
                ? "Contract Loaded"
                : "-"
          }
          icon={ShieldCheck}
        />

        <StatCard
          title="Signatures"
          value={`${sellerSigned ? "Seller ✓" : "Seller -"} / ${buyerSigned ? "Buyer ✓" : "Buyer -"
            }`}
          icon={FileSignature}
        />
      </div>

      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border-light)] p-6">
          <div>
            <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
              {dealTitle}
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {selectedBid
                ? `Selected partner: ${partnerName} · Bid: ${formatMoney(
                  selectedBid?.bid_price
                )} · Net: ${formatMoney(selectedBid?.net_to_seller)}`
                : contract
                  ? "Contract loaded from backend."
                  : "Select a primary bid before creating a contract."}
            </p>
          </div>

          <StatusPill status={contract?.status || "not_started"} />
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {isBusy && !contract && (
              <div className="flex items-center justify-center rounded-2xl border border-[var(--color-border-light)] bg-white py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
              </div>
            )}

            {!isBusy && trackerSteps.map((step) => (
              <TrackerStep
                key={step.title}
                title={step.title}
                description={step.description}
                done={step.done}
                current={step.current}
                locked={step.locked}
              />
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Contract Panel
              </p>

              <h3 className="mt-2 font-serif text-2xl font-black text-[var(--color-primary)]">
                {!selectedBid && !contract
                  ? "Selection Required"
                  : !contract
                    ? "Ready To Create"
                    : isCancelled
                      ? "Cancelled"
                      : isSigned
                        ? "Partnership Secured"
                        : isPending
                          ? "Signature Pending"
                          : formatStatus(contract?.status)}
              </h3>

              {contract && (
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                      Contract ID
                    </p>
                    <p className="mt-1 break-all font-bold text-[var(--color-primary)]">
                      {contractId}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                      Seller Signed
                    </p>
                    <p className="mt-1 font-bold text-[var(--color-text-main)]">
                      {formatDateTime(contract?.seller_signed_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                      Buyer Signed
                    </p>
                    <p className="mt-1 font-bold text-[var(--color-text-main)]">
                      {formatDateTime(contract?.buyer_signed_at)}
                    </p>
                  </div>

                  {contract?.pdf_url && (
                    <a
                      href={contract.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]"
                    >
                      View Contract PDF
                    </a>
                  )}
                </div>
              )}
            </div>

            {!selectedBid && !contract && (
              <Link
                to={activeListingId ? `/bids?listingId=${activeListingId}` : "/bids"}
                className="flex w-full items-center justify-center gap-2 bg-[var(--color-primary)] px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:scale-[1.01]"
              >
                <AlertTriangle className="h-4 w-4" />
                Select Primary Bid
              </Link>
            )}

            {selectedBid && !contract && (
              <button
                type="button"
                onClick={handleCreateOrLoadContract}
                disabled={isCreatingContract}
                className="flex w-full items-center justify-center gap-2 bg-[var(--color-primary)] px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingContract ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSignature className="h-4 w-4" />
                )}
                Create Contract
              </button>
            )}

            {contract && !sellerSigned && !isCancelled && (
              <button
                type="button"
                onClick={handleSellerSign}
                disabled={isSigningSeller}
                className="flex w-full items-center justify-center gap-2 bg-[var(--color-secondary)] px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSigningSeller ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Sign As Seller
              </button>
            )}

            {contract && sellerSigned && !buyerSigned && !isCancelled && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-700">
                Seller signature is complete. Waiting for buyer signature.
              </div>
            )}

            {contract && isSigned && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                Both parties signed. Partnership is secured.
              </div>
            )}

            {contract && !isCancelled && !isSigned && (
              <button
                type="button"
                onClick={handleCancelContract}
                disabled={isCancellingContract}
                className="flex w-full items-center justify-center gap-2 border border-red-500 bg-white px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel Contract
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}