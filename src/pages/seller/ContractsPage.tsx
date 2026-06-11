import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  FileSignature,
  FileText,
  Gavel,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";

import StatusBadge from "../../components/common/StatusBadge";
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

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "gold"
  | "neutral"
  | "dark";

type ModalAction = "seller-sign" | "cancel";

function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

function getListingsFromDashboard(response: any) {
  const payload = getApiPayload(response);

  if (Array.isArray(payload?.listings)) return payload.listings;
  if (Array.isArray(payload?.data?.listings)) return payload.data.listings;
  if (Array.isArray(payload)) return payload;

  return [];
}

function getBidsFromResponse(response: any) {
  const payload = getApiPayload(response);

  if (Array.isArray(payload?.bids)) return payload.bids;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;

  return [];
}

function getContractFromResponse(response: any) {
  const payload = getApiPayload(response);
  return payload?.contract ?? payload;
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
  if (!status) return "Pending";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusVariant(status?: string): BadgeVariant {
  const normalized = String(status || "pending").toLowerCase();

  if (normalized === "signed") return "success";
  if (normalized === "cancelled") return "danger";
  if (normalized === "canceled") return "danger";
  if (normalized === "pending") return "gold";
  if (normalized === "draft") return "neutral";

  return "neutral";
}

function getListingLabel(listing: any) {
  if (!listing) return "No listing selected";

  const address = listing?.address || "Untitled Listing";
  const state = listing?.state_code ? `, ${listing.state_code}` : "";
  const zip = listing?.zip_code ? ` ${listing.zip_code}` : "";

  return `${address}${state}${zip}`;
}

function getBidderName(bid: any) {
  return (
    bid?.bidder_id?.full_name ||
    bid?.bidder_id?.email ||
    bid?.buyer_id?.full_name ||
    bid?.buyer_id?.email ||
    "Selected Buyer"
  );
}

function getBidStatus(bid: any) {
  return String(bid?.status || "").toLowerCase();
}

function getSelectedBid(bids: any[]) {
  return bids.find((bid: any) => getBidStatus(bid) === "selected");
}

function getId(item: any) {
  return item?._id || item?.id || "";
}

function getPopulatedListingLabel(contract: any, fallbackListing: any) {
  const property = contract?.property_id;

  if (property && typeof property === "object") {
    return getListingLabel(property);
  }

  return getListingLabel(fallbackListing);
}

function getPersonName(person: any, fallback: string) {
  if (!person) return fallback;

  if (typeof person === "string") return person;

  return person?.full_name || person?.email || fallback;
}

function isContractCancelled(contract: any) {
  const status = String(contract?.status || "").toLowerCase();
  return status === "cancelled" || status === "canceled";
}

function isContractSigned(contract: any) {
  return String(contract?.status || "").toLowerCase() === "signed";
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
        {value === undefined || value === null || value === "" ? "-" : value}
      </p>
    </div>
  );
}

function SummaryCard({
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

function ConfirmationModal({
  action,
  isLoading,
  onConfirm,
  onCancel,
}: {
  action: ModalAction;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isCancel = action === "cancel";

  const title = isCancel ? "Cancel Contract" : "Sign Contract as Seller";

  const description = isCancel
    ? "This will mark the contract as cancelled. This action should only be used when the deal is no longer moving forward."
    : "This will record the seller signature timestamp on this contract.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              isCancel
                ? "bg-[var(--color-danger)]/10"
                : "bg-[var(--color-primary)]/10"
            }`}
          >
            {isCancel ? (
              <AlertTriangle className="h-6 w-6 text-[var(--color-danger)]" />
            ) : (
              <FileSignature className="h-6 w-6 text-[var(--color-primary)]" />
            )}
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h3 className="font-serif text-xl font-black text-[var(--color-primary)]">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          {description}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 border border-[var(--color-border-light)] bg-white py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isCancel ? "bg-[var(--color-danger)]" : "bg-[var(--color-primary)]"
            }`}
          >
            {isLoading ? "Working..." : isCancel ? "Cancel Contract" : "Sign"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContractsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const listingIdFromUrl = searchParams.get("listingId") || "";
  const contractIdFromUrl = searchParams.get("contractId") || "";

  const [pdfUrl, setPdfUrl] = useState("");
  const [manualContractId, setManualContractId] = useState(contractIdFromUrl);
  const [createdContract, setCreatedContract] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<ModalAction | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    isFetching: isFetchingDashboard,
    refetch: refetchDashboard,
  } = useGetListingsDashboardQuery();

  const listings = getListingsFromDashboard(dashboardData);

  const selectedListing =
    listings.find((listing: any) => getId(listing) === listingIdFromUrl) ||
    listings[0];

  const activeListingId = listingIdFromUrl || getId(selectedListing);

  const activeListing = listings.find(
    (listing: any) => getId(listing) === activeListingId
  );

  const {
    data: bidsData,
    isLoading: isLoadingBids,
    isFetching: isFetchingBids,
    refetch: refetchBids,
  } = useGetListingBidsQuery(activeListingId, {
    skip: !activeListingId,
  });

  const bids = getBidsFromResponse(bidsData);
  const selectedBid = getSelectedBid(bids);

  const activeContractId =
    contractIdFromUrl || getId(createdContract) || manualContractId.trim();

  const {
    data: contractData,
    isLoading: isLoadingContract,
    isFetching: isFetchingContract,
    refetch: refetchContract,
  } = useGetContractByIdQuery(activeContractId, {
    skip: !activeContractId,
  });

  const contractFromApi = getContractFromResponse(contractData);
  const activeContract = getId(contractFromApi)
    ? contractFromApi
    : createdContract;

  const [createContract, { isLoading: isCreatingContract }] =
    useCreateContractMutation();

  const [signContractAsSeller, { isLoading: isSigningSeller }] =
    useSignContractAsSellerMutation();

  const [cancelContract, { isLoading: isCancellingContract }] =
    useCancelContractMutation();

  const selectedBidNet = selectedBid?.net_to_seller;
  const selectedBidPrice = selectedBid?.bid_price;

  const signedBySeller = Boolean(activeContract?.seller_signed_at);
  const signedByBuyer = Boolean(activeContract?.buyer_signed_at);
  const contractCancelled = isContractCancelled(activeContract);
  const contractSigned = isContractSigned(activeContract);

  const canCreateContract = Boolean(activeListingId && selectedBid);
  const canSignSeller = Boolean(
    getId(activeContract) &&
      !signedBySeller &&
      !contractCancelled &&
      !contractSigned
  );
  const canCancelContract = Boolean(getId(activeContract) && !contractCancelled);

  const contractStatus = activeContract?.status || "pending";

  const summary = useMemo(
    () => ({
      totalListings: listings.length,
      bidsForListing: bids.length,
      hasSelectedBid: selectedBid ? "Yes" : "No",
      contractStatus: formatStatus(contractStatus),
    }),
    [listings.length, bids.length, selectedBid, contractStatus]
  );

  function updateSearchParams(next: {
    listingId?: string;
    contractId?: string;
  }) {
    const params: Record<string, string> = {};

    if (next.listingId) {
      params.listingId = next.listingId;
    }

    if (next.contractId) {
      params.contractId = next.contractId;
    }

    setSearchParams(params);
  }

  function handleListingChange(listingId: string) {
    setCreatedContract(null);
    setManualContractId("");
    setApiError(null);
    setApiSuccess(null);

    updateSearchParams({
      listingId,
    });
  }

  function handleUseContractId() {
    const contractId = manualContractId.trim();

    if (!contractId) {
      setApiError("Please enter a contract ID.");
      return;
    }

    setCreatedContract(null);
    setApiError(null);
    setApiSuccess(null);

    updateSearchParams({
      listingId: activeListingId,
      contractId,
    });
  }

  async function handleCreateContract() {
    if (!activeListingId) {
      setApiError("Please select a listing first.");
      return;
    }

    if (!selectedBid) {
      setApiError(
        "This listing does not have a selected bid yet. Select a primary bid from View Bids first."
      );
      return;
    }

    try {
      setApiError(null);
      setApiSuccess(null);

      const body: any = {
        bid_id: getId(selectedBid),
      };

      if (pdfUrl.trim()) {
        body.pdf_url = pdfUrl.trim();
      }

      const response = await createContract({
        listingId: activeListingId,
        body,
      }).unwrap();

      const contract = getContractFromResponse(response);

      setCreatedContract(contract);

      const contractId = getId(contract);

      if (contractId) {
        updateSearchParams({
          listingId: activeListingId,
          contractId,
        });
      }

      setApiSuccess("Contract created/opened successfully.");
    } catch (error: any) {
      setApiError(getErrorMessage(error, "Unable to create contract."));
    }
  }

  async function handleConfirmAction() {
    if (!confirmAction || !getId(activeContract)) {
      setConfirmAction(null);
      return;
    }

    try {
      setApiError(null);
      setApiSuccess(null);

      if (confirmAction === "seller-sign") {
        const response = await signContractAsSeller(getId(activeContract)).unwrap();
        const contract = getContractFromResponse(response);

        setCreatedContract(contract);
        setApiSuccess("Contract signed by seller.");
      }

      if (confirmAction === "cancel") {
        const response = await cancelContract(getId(activeContract)).unwrap();
        const contract = getContractFromResponse(response);

        setCreatedContract(contract);
        setApiSuccess("Contract cancelled.");
      }

      setConfirmAction(null);

      if (activeContractId) {
        await refetchContract();
      }

      await refetchDashboard();
      await refetchBids();
    } catch (error: any) {
      setApiError(getErrorMessage(error, "Unable to update contract."));
      setConfirmAction(null);
    }
  }

  const isWorking =
    isCreatingContract || isSigningSeller || isCancellingContract;

  return (
    <div className="space-y-8">
      {confirmAction && (
        <ConfirmationModal
          action={confirmAction}
          isLoading={isWorking}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Seller Portal
          </p>

          <h1 className="mt-1 flex items-center gap-3 font-serif text-3xl font-black text-[var(--color-primary)]">
            <FileSignature className="h-7 w-7 text-[var(--color-secondary)]" />
            Contracts
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Create a contract from the selected primary bid, track seller and
            buyer signatures, and manage contract status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            refetchDashboard();
            if (activeListingId) refetchBids();
            if (activeContractId) refetchContract();
          }}
          disabled={
            isFetchingDashboard || isFetchingBids || isFetchingContract
          }
          className="inline-flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isFetchingDashboard || isFetchingBids || isFetchingContract
                ? "animate-spin"
                : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {apiError && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          {apiError}
        </div>
      )}

      {apiSuccess && (
        <div className="rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 p-4 text-sm font-semibold text-[var(--color-primary)]">
          {apiSuccess}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Seller Listings"
          value={summary.totalListings}
          icon={FileText}
        />
        <SummaryCard
          label="Bids on Listing"
          value={summary.bidsForListing}
          icon={Gavel}
        />
        <SummaryCard
          label="Selected Bid"
          value={summary.hasSelectedBid}
          icon={CheckCircle2}
        />
        <SummaryCard
          label="Contract Status"
          value={summary.contractStatus}
          icon={ShieldCheck}
        />
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div>
                <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                  Contract Setup
                </h2>

                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                  Choose a listing that already has a selected primary bid.
                </p>
              </div>

              <StatusBadge
                label={formatStatus(contractStatus)}
                variant={getStatusVariant(contractStatus)}
              />
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Select Listing
                </p>

                {isLoadingDashboard ? (
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading listings...
                  </div>
                ) : listings.length > 0 ? (
                  <select
                    value={activeListingId}
                    onChange={(event) => handleListingChange(event.target.value)}
                    className="mt-2 w-full border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-primary)] outline-none focus:border-[var(--color-primary)]"
                  >
                    {listings.map((listing: any) => (
                      <option key={getId(listing)} value={getId(listing)}>
                        {getListingLabel(listing)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-5 text-sm font-semibold text-[var(--color-text-muted)]">
                    No seller listings found.
                  </div>
                )}
              </div>

              {activeListingId && (
                <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                    Active Listing
                  </p>

                  <p className="mt-2 text-sm font-black text-[var(--color-primary)]">
                    {getListingLabel(activeListing)}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link
                      to={`/listings/${activeListingId}`}
                      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]"
                    >
                      View Listing
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>

                    <Link
                      to={`/bids?listingId=${activeListingId}`}
                      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]"
                    >
                      View Bids
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                      Selected Bid
                    </p>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      Contract can only be created from a selected bid.
                    </p>
                  </div>

                  {isLoadingBids && (
                    <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
                  )}
                </div>

                {!activeListingId && (
                  <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                    Select a listing first.
                  </p>
                )}

                {activeListingId && !isLoadingBids && !selectedBid && (
                  <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-[var(--color-secondary)]" />

                      <div>
                        <p className="text-sm font-black text-[var(--color-primary)]">
                          No selected primary bid yet
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                          Go to View Bids and select a primary bid before
                          creating a contract.
                        </p>

                        <Link
                          to={`/bids?listingId=${activeListingId}`}
                          className="mt-3 inline-flex bg-[var(--color-primary)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white"
                        >
                          Select Bid
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {selectedBid && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Detail label="Buyer" value={getBidderName(selectedBid)} />
                    <Detail
                      label="Bid Status"
                      value={formatStatus(selectedBid?.status)}
                    />
                    <Detail
                      label="Bid Price"
                      value={formatMoney(selectedBidPrice)}
                    />
                    <Detail
                      label="Net to Seller"
                      value={formatMoney(selectedBidNet)}
                    />
                    <Detail
                      label="Inspection Period"
                      value={`${selectedBid?.inspection_period ?? "-"} days`}
                    />
                    <Detail
                      label="Due Diligence"
                      value={`${
                        selectedBid?.due_diligence_period ?? "-"
                      } days`}
                    />
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Contract PDF URL
                </p>

                <input
                  value={pdfUrl}
                  onChange={(event) => setPdfUrl(event.target.value)}
                  placeholder="Paste contract PDF URL, if available"
                  className="mt-2 w-full border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                />

                <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                  Your backend currently accepts a PDF URL. There is no contract
                  PDF upload API yet, so this field is optional unless your
                  backend DTO makes it required.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCreateContract}
                disabled={!canCreateContract || isCreatingContract}
                className="inline-flex items-center gap-2 bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[var(--shadow-card)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreatingContract ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSignature className="h-4 w-4" />
                )}
                Create / Open Contract
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Open Existing Contract
            </h2>

            <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
              Because backend has no “list contracts” endpoint yet, you can open
              a contract directly by ID.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
              <input
                value={manualContractId}
                onChange={(event) => setManualContractId(event.target.value)}
                placeholder="Paste contract ID"
                className="border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />

              <button
                type="button"
                onClick={handleUseContractId}
                className="bg-[var(--color-primary)] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white"
              >
                Open Contract
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                  Contract Details
                </h2>

                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Current contract record.
                </p>
              </div>

              {isLoadingContract && (
                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
              )}
            </div>

            {!getId(activeContract) && !isLoadingContract && (
              <div className="rounded-xl border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" />

                <p className="mt-3 text-sm font-bold text-[var(--color-text-main)]">
                  No contract opened yet.
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                  Create a contract from the selected bid or open one by ID.
                </p>
              </div>
            )}

            {getId(activeContract) && (
              <div className="space-y-5">
                <div>
                  <StatusBadge
                    label={formatStatus(activeContract?.status)}
                    variant={getStatusVariant(activeContract?.status)}
                  />
                </div>

                <Detail label="Contract ID" value={getId(activeContract)} />
                <Detail
                  label="Listing"
                  value={getPopulatedListingLabel(
                    activeContract,
                    activeListing
                  )}
                />
                <Detail
                  label="Seller"
                  value={getPersonName(activeContract?.seller_id, "Seller")}
                />
                <Detail
                  label="Buyer"
                  value={getPersonName(activeContract?.buyer_id, "Buyer")}
                />
                <Detail
                  label="Created"
                  value={formatDate(activeContract?.createdAt)}
                />

                {activeContract?.pdf_url && (
                  <a
                    href={activeContract.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[var(--color-secondary)] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary-dark)]"
                  >
                    <FileText className="h-4 w-4" />
                    Open PDF
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Signature Status
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4">
                <UserCheck
                  className={`mt-0.5 h-5 w-5 ${
                    signedBySeller
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                />

                <div>
                  <p className="text-sm font-black text-[var(--color-primary)]">
                    Seller Signature
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {signedBySeller
                      ? `Signed at ${formatDateTime(
                          activeContract?.seller_signed_at
                        )}`
                      : "Not signed yet"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4">
                <UserCheck
                  className={`mt-0.5 h-5 w-5 ${
                    signedByBuyer
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                />

                <div>
                  <p className="text-sm font-black text-[var(--color-primary)]">
                    Buyer Signature
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {signedByBuyer
                      ? `Signed at ${formatDateTime(
                          activeContract?.buyer_signed_at
                        )}`
                      : "Waiting for buyer"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setConfirmAction("seller-sign")}
                disabled={!canSignSeller || isSigningSeller}
                className="flex w-full items-center justify-center gap-2 bg-[var(--color-primary)] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSigningSeller ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSignature className="h-4 w-4" />
                )}
                Sign as Seller
              </button>

              <button
                type="button"
                onClick={() => setConfirmAction("cancel")}
                disabled={!canCancelContract || isCancellingContract}
                className="flex w-full items-center justify-center gap-2 border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancellingContract ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                Cancel Contract
              </button>
            </div>
          </div>

        </aside>
      </section>
    </div>
  );
}