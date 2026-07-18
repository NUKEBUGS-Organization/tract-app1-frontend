import { useEffect, useMemo, useState } from "react";
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

import { PageSkeleton } from "../../components/common/Skeleton";

import {
  useGetListingBidsQuery,
  useGetListingsDashboardQuery,
} from "../../services/listingService";

import {
  useCancelContractMutation,
  useCreateContractMutation,
  useGetContractByIdQuery,
  useGetContractsByListingQuery,
} from "../../services/contractService";

import DocuSealSignButton from "./contracts/DocuSealSignButton";

import { useGetMyDealsQuery } from "../../services/dealService";

function getDashboardPayload(response: any) {
  return response?.data ?? response ?? {};
}

function getListingsFromDashboard(response: any) {
  const payload = getDashboardPayload(response);
  return Array.isArray(payload?.listings) ? payload.listings : [];
}



function getContractFromResponse(response: any) {
  let payload = response?.data?.data ?? response?.data ?? response;

  if (payload?.contract?._doc) {
    return payload.contract._doc;
  }

  if (payload?.contract) {
    return payload.contract;
  }

  if (payload?._doc) {
    return payload._doc;
  }

  return payload;
}


// function isCancelledStatus(status?: string | null) {
//   const normalized = String(status || "").toLowerCase();

//   return normalized === "cancelled" || normalized === "canceled";
// }

function getArrayPayload(value: any) {
  const payload = value?.data ?? value;

  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object") return Object.values(payload);

  return [];
}

function getId(item: any) {
  if (!item) return "";
  if (typeof item === "string") return item;

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

function isTerminalDealStatus(status?: string | null) {
  const normalized = String(status || "").toLowerCase();

  return [
    "cancelled",
    "canceled",
    "closed",
    "backup_activated",
  ].includes(normalized);
}

function getDealContractId(deal: any) {
  return getId(deal?.contract_id) || deal?.contract_id || "";
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

function getCountdownParts(deadlineValue?: string, now = Date.now()) {
  if (!deadlineValue) {
    return {
      expired: false,
      totalMs: 0,
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
      compact: "-",
    };
  }

  const deadline = new Date(deadlineValue).getTime();

  if (Number.isNaN(deadline)) {
    return {
      expired: false,
      totalMs: 0,
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
      compact: "-",
    };
  }

  const diff = deadline - now;
  const safeDiff = Math.max(diff, 0);

  const days = Math.floor(safeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safeDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safeDiff / (1000 * 60)) % 60);
  const seconds = Math.floor((safeDiff / 1000) % 60);

  return {
    expired: diff <= 0,
    totalMs: safeDiff,
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    compact:
      diff <= 0
        ? "Deadline passed"
        : days > 0
          ? `${days}d ${hours}h ${minutes}m remaining`
          : `${hours}h ${minutes}m ${seconds}s remaining`,
  };
}

function getDeadlineProgress(
  startValue?: string,
  deadlineValue?: string,
  now = Date.now()
) {
  if (!startValue || !deadlineValue) return 0;

  const start = new Date(startValue).getTime();
  const deadline = new Date(deadlineValue).getTime();

  if (Number.isNaN(start) || Number.isNaN(deadline) || deadline <= start) {
    return 0;
  }

  const total = deadline - start;
  const elapsed = now - start;

  return Math.min(Math.max((elapsed / total) * 100, 0), 100);
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
    normalized === "signed" || normalized === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : normalized === "cancelled" || normalized === "canceled"
        ? "border-red-200 bg-red-50 text-red-700"
        : normalized === "pending"
          ? "border-yellow-200 bg-yellow-50 text-yellow-700"
          : normalized === "proceeding_to_closing"
            ? "border-blue-200 bg-blue-50 text-blue-700"
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

function CountdownBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-center backdrop-blur">
      <p className="font-serif text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
        {label}
      </p>
    </div>
  );
}

function MarketingCountdownBanner({
  title,
  deadline,
  startAt,
  proofUploaded,
  proceedToClosingAt,
  now,
}: {
  title: string;
  deadline?: string;
  startAt?: string;
  proofUploaded?: boolean;
  proceedToClosingAt?: string;
  now: number;
}) {
  const countdown = getCountdownParts(deadline, now);
  const progress = getDeadlineProgress(startAt, deadline, now);

  const statusLabel = proofUploaded
    ? "Proof Uploaded"
    : proceedToClosingAt
      ? "Moved To Closing"
      : countdown.expired
        ? "Deadline Passed"
        : "Active Countdown";

  const statusClass = proofUploaded
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : proceedToClosingAt
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : countdown.expired
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-yellow-200 bg-yellow-50 text-yellow-700";

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)] shadow-[var(--shadow-card)]">
      <div className="relative p-6 md:p-7">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/2 h-32 w-32 rounded-full bg-[var(--color-secondary)]/20 blur-2xl" />

        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white">
              <Clock3 className="h-4 w-4 text-[var(--color-secondary)]" />
              {title}
            </div>

            <h2 className="mt-4 font-serif text-3xl font-black text-white md:text-4xl">
              {countdown.expired ? "Deadline Reached" : countdown.compact}
            </h2>

            <p className="mt-3 text-sm font-semibold leading-6 text-white/75">
              Deadline:{" "}
              <span className="text-white">{formatDateTime(deadline)}</span>
            </p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                  Window Progress
                </p>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                  {Math.round(progress)}%
                </p>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-[var(--color-secondary)] transition-all duration-1000"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[460px]">
            <CountdownBox label="Days" value={countdown.days} />
            <CountdownBox label="Hours" value={countdown.hours} />
            <CountdownBox label="Minutes" value={countdown.minutes} />
            <CountdownBox label="Seconds" value={countdown.seconds} />
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${statusClass}`}
          >
            {statusLabel}
          </span>

          {!proofUploaded && !proceedToClosingAt && !countdown.expired && (
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white">
              Waiting For Buyer Proof
            </span>
          )}
        </div>
      </div>
    </section>
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
        <h3 className="font-black text-[var(--color-primary)]">{title}</h3>

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
  const [now, setNow] = useState(() => Date.now());

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
    currentData: bidsCurrentData = [],
    isLoading: isLoadingBids,
    isFetching: isFetchingBids,
    refetch: refetchBids,
  } = useGetListingBidsQuery(activeListingId, {
    skip: !activeListingId,
  });

  const safeBidsData = activeListingId
    ? bidsCurrentData ?? bidsData
    : [];

  const {
    data: fetchedContractData,
    currentData: fetchedContractCurrentData,
    isLoading: isLoadingContract,
    isFetching: isFetchingContract,
    refetch: refetchContract,
  } = useGetContractByIdQuery(contractIdFromUrl, {
    skip: !contractIdFromUrl,
    refetchOnMountOrArgChange: true,
  });

  const fetchedContract = contractIdFromUrl
    ? getContractFromResponse(fetchedContractCurrentData ?? fetchedContractData)
    : null;

  const {
    data: contractsByListingData = [],
    currentData: contractsByListingCurrentData = [],
    isLoading: isLoadingContractsByListing,
    isFetching: isFetchingContractsByListing,
    refetch: refetchContractsByListing,
  } = useGetContractsByListingQuery(activeListingId, {
    skip: !activeListingId || Boolean(contractIdFromUrl),
  });

  const safeContractsByListingData =
    !activeListingId || contractIdFromUrl
      ? []
      : contractsByListingCurrentData ?? contractsByListingData;

  const {
    data: myDealsData = [],
    isLoading: isLoadingDeals,
    isFetching: isFetchingDeals,
    refetch: refetchDeals,
  } = useGetMyDealsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const contractsByListing = getArrayPayload(safeContractsByListingData).map(
    (contract: any) => getContractFromResponse(contract)
  );

  const latestContractByListing =
    contractsByListing.length > 0 ? contractsByListing[0] : null;

  const [createContract, { isLoading: isCreatingContract }] =
    useCreateContractMutation();

  const [isDocuSealRefreshing, setIsDocuSealRefreshing] = useState(false);

  const [cancelContract, { isLoading: isCancellingContract }] =
    useCancelContractMutation();

  const bids = Array.isArray(safeBidsData) ? safeBidsData : [];
  const selectedBid = getSelectedBid(bids);

  const contract =
    (contractIdFromUrl ? fetchedContract : null) ||
    localContract ||
    latestContractByListing;

  const contractId = getId(contract);

  const deals = getArrayPayload(myDealsData);

  const activeDeal =
    contractId && activeListingId && deals.length > 0
      ? deals.find((deal: any) => {
        const dealContractId = getDealContractId(deal);
        const dealListingId = getId(deal?.listing_id) || deal?.listing_id || "";
        const contractListingId =
          getId(deal?.contract_id?.property_id) ||
          deal?.contract_id?.property_id ||
          "";

        return (
          dealContractId === contractId &&
          (dealListingId === activeListingId ||
            contractListingId === activeListingId)
        );
      })
      : null;

  const activeDealId = getId(activeDeal);

  const contractStatus = String(contract?.status || "").toLowerCase();

  const isPending = contractStatus === "pending";
  const isSigned = contractStatus === "signed";
  const isCancelled =
    contractStatus === "cancelled" || contractStatus === "canceled";

  const sellerSigned = Boolean(contract?.seller_signed_at);
  const buyerSigned = Boolean(contract?.buyer_signed_at);

  const marketingDeadline = activeDeal?.marketing_deadline;
  const marketLaunchDeadline = activeDeal?.market_launch_deadline;
  const marketingProofUrl = activeDeal?.marketing_proof_url;
  const marketLaunchProofUrl = activeDeal?.market_launch_proof_url;
  const proceedToClosingAt = activeDeal?.proceed_to_closing_at;
 const dealStatus = activeDeal?.status;
const isDealTerminal = isTerminalDealStatus(dealStatus);
const isFlowStopped = isCancelled || isDealTerminal;

const hasMarketingTracking = Boolean(marketingDeadline || marketLaunchDeadline);
const hasProofUploaded = Boolean(marketingProofUrl || marketLaunchProofUrl);

const activeDeadline = isFlowStopped
  ? undefined
  : marketingDeadline || marketLaunchDeadline;

  const activeDeadlineTitle = marketingDeadline
    ? "72-Hour Marketing Clock"
    : marketLaunchDeadline
      ? "Market Launch Clock"
      : "Deal Clock";

  const activeDeadlineStartAt =
    activeDeal?.createdAt ||
    contract?.buyer_signed_at ||
    contract?.updatedAt ||
    contract?.createdAt;

  const activeCountdown = getCountdownParts(activeDeadline, now);

const showMarketingCountdown = Boolean(
  activeDeal &&
  activeDeadline &&
  !isFlowStopped &&
  !hasProofUploaded &&
  !proceedToClosingAt
);

const liveDeadlineValue = isFlowStopped
  ? "Cancelled"
  : hasProofUploaded
    ? "Proof Uploaded"
    : proceedToClosingAt
      ? "Moved To Closing"
      : activeDeadline
        ? activeCountdown.compact
        : "-";

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
    isLoadingContractsByListing ||
    isFetchingContractsByListing ||
    isLoadingDeals ||
    isFetchingDeals ||
    isCreatingContract ||
    isCancellingContract ||
    isDocuSealRefreshing;

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
          ? activeDeal
            ? `Both parties signed. Deal created with ID: ${activeDealId}.`
            : "Both parties signed. Waiting for deal record to load."
          : "This becomes complete when both seller and buyer have signed.",
        done: isSigned,
        current: Boolean(contract && sellerSigned && buyerSigned && !isSigned),
        locked: false,
      },
      {
        title: "Marketing & Buyer Matching",
        description: marketingDeadline
          ? marketingProofUrl
            ? `Marketing proof uploaded. Deadline was ${formatDateTime(
              marketingDeadline
            )}.`
            : `72-hour marketing tracking is active. ${activeCountdown.compact}. Deadline: ${formatDateTime(
              marketingDeadline
            )}.`
          : marketLaunchDeadline
            ? marketLaunchProofUrl
              ? `Market launch proof uploaded. Deadline was ${formatDateTime(
                marketLaunchDeadline
              )}.`
              : `Market launch tracking is active. ${activeCountdown.compact}. Deadline: ${formatDateTime(
                marketLaunchDeadline
              )}.`
            : isSigned
              ? "Deal is signed, but deadline is not loaded yet. Refresh after deal is created."
              : "This starts after both parties sign and the deal is created.",
        done: hasProofUploaded,
        current: Boolean(
          isSigned &&
          activeDeal &&
          hasMarketingTracking &&
          !hasProofUploaded &&
          !proceedToClosingAt
        ),
        locked: !activeDeal,
      },
      {
        title: "Inspection, Title & Escrow",
        description: proceedToClosingAt
          ? `Deal moved to closing at ${formatDateTime(proceedToClosingAt)}.`
          : hasProofUploaded
            ? "Proof is uploaded. Buyer can now proceed to closing."
            : "Inspection countdown, title, escrow, and closing progress.",
        done: Boolean(proceedToClosingAt),
        current: Boolean(activeDeal && hasProofUploaded && !proceedToClosingAt),
        locked: !activeDeal || !hasProofUploaded,
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
      activeDeal,
      activeDealId,
      marketingDeadline,
      marketLaunchDeadline,
      marketingProofUrl,
      marketLaunchProofUrl,
      proceedToClosingAt,
      hasMarketingTracking,
      hasProofUploaded,
      activeCountdown.compact,
    ]
  );

useEffect(() => {
  if (isFlowStopped || !showMarketingCountdown) return;

  const timer = window.setInterval(() => {
    setNow(Date.now());
  }, 1000);

  return () => {
    window.clearInterval(timer);
  };
}, [isFlowStopped, showMarketingCountdown]);

  useEffect(() => {
    if (!activeListingId) return;
    if (contractIdFromUrl) return;
    if (!latestContractByListing?._id) return;

    setSearchParams({
      listingId: activeListingId,
      contractId: latestContractByListing._id,
    });
  }, [
    activeListingId,
    contractIdFromUrl,
    latestContractByListing?._id,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!isSigned) return;

    refetchDeals();
  }, [isSigned, refetchDeals]);

  async function handleRefresh() {
    setApiError(null);

    await refetchDashboard();

    if (activeListingId) {
      await refetchBids();
    }

    if (contractIdFromUrl) {
      await refetchContract();
    } else if (activeListingId) {
      await refetchContractsByListing();
    }

    await refetchDeals();
  }

  function handleListingChange(listingId: string) {
    setLocalContract(null);
    setApiError(null);

    setSearchParams(
      {
        listingId,
      },
      {
        replace: true,
      }
    );
  }

  async function handleCreateOrLoadContract() {
    if (!activeListingId || !selectedBid) return;

    try {
      setApiError(null);

      // const created = await createContract({
      //   listingId: activeListingId,
      //   body: {
      //     bid_id: getId(selectedBid),
      //     pdf_url: "https://example.com/dummy-contract.pdf",
      //   },
      // }).unwrap();

      const createdResponse = await createContract({
        listingId: activeListingId,
        body: {
          bid_id: getId(selectedBid),
        },
      }).unwrap();

      const created = getContractFromResponse(createdResponse);

      setLocalContract(created);

      const createdContractId = getId(created);

      setSearchParams({
        listingId: activeListingId,
        contractId: createdContractId,
      });

      await refetchContractsByListing();
      await refetchDeals();
    } catch (error: any) {
      setApiError(
        getErrorMessage(error, "Unable to create contract from selected bid.")
      );
    }
  }


  async function handleDocuSealReturn() {
    try {
      setIsDocuSealRefreshing(true);
      setApiError(null);
      setLocalContract(null);

      await refetchContract();
      await refetchContractsByListing();
      await refetchDeals();

      if (activeListingId && contractId) {
        setSearchParams({
          listingId: activeListingId,
          contractId,
        });
      }
    } finally {
      setIsDocuSealRefreshing(false);
    }
  }


async function handleCancelContract() {
  if (!contractId) return;

  try {
    setApiError(null);

    const updatedResponse = await cancelContract(contractId).unwrap();
    const updated = getContractFromResponse(updatedResponse);

    setLocalContract(updated);

    await refetchContract();
    await refetchDeals();
    await refetchDashboard();

    if (activeListingId) {
      await refetchBids();
      await refetchContractsByListing();
    }
  } catch (error: any) {
    setApiError(getErrorMessage(error, "Unable to cancel contract."));
  }
}

  const showInitialSkeleton =
    isLoadingDashboard ||
    isLoadingDeals ||
    (Boolean(activeListingId) && isLoadingBids) ||
    (Boolean(contractIdFromUrl) && isLoadingContract) ||
    (Boolean(activeListingId) &&
      !contractIdFromUrl &&
      isLoadingContractsByListing);

  if (showInitialSkeleton) {
    return <PageSkeleton />;
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
            Track the selected partner, contract signatures, marketing deadline,
            and deal progress.
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

      {isFlowStopped && (
  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
    This contract/deal is cancelled. Deal tracker timer and actions are disabled.
  </div>
)}

      {showMarketingCountdown && (
        <MarketingCountdownBanner
          title={activeDeadlineTitle}
          deadline={activeDeadline}
          startAt={activeDeadlineStartAt}
          proofUploaded={hasProofUploaded}
          proceedToClosingAt={proceedToClosingAt}
          now={now}
        />
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
          title="Live Deadline"
          value={liveDeadlineValue}
          icon={Clock3}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard
          title="Signatures"
          value={`${sellerSigned ? "Seller ✓" : "Seller -"} / ${buyerSigned ? "Buyer ✓" : "Buyer -"
            }`}
          icon={FileSignature}
        />

        <StatCard
          title="Deal Status"
          value={activeDeal ? formatStatus(dealStatus) : "No Deal Yet"}
          icon={Handshake}
        />

        <StatCard
          title="Deal ID"
          value={activeDealId || "-"}
          icon={FileText}
        />

        <StatCard
          title="Proof Status"
          value={hasProofUploaded ? "Uploaded" : "Pending"}
          icon={ShieldCheck}
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
                  ? "Contract loaded."
                  : "Select a primary bid before creating a contract."}
            </p>
          </div>

          <StatusPill
  status={isFlowStopped ? "cancelled" : activeDeal?.status || contract?.status || "not_started"}
/>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {isBusy && !contract && (
              <div className="flex items-center justify-center rounded-2xl border border-[var(--color-border-light)] bg-white py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
              </div>
            )}

            {!isBusy &&
              trackerSteps.map((step) => (
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

            {activeDeal && (
              <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Deal Panel
                </p>

                <h3 className="mt-2 font-serif text-xl font-black text-[var(--color-primary)]">
                  {formatStatus(activeDeal?.status)}
                </h3>

                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                      Deal ID
                    </p>
                    <p className="mt-1 break-all font-bold text-[var(--color-primary)]">
                      {activeDealId}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                      Deadline
                    </p>
                    <p className="mt-1 font-bold text-[var(--color-text-main)]">
                      {activeDeadline ? formatDateTime(activeDeadline) : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                      Remaining
                    </p>
                    <p className="mt-1 font-bold text-[var(--color-text-main)]">
                      {activeDeadline ? activeCountdown.compact : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                      Chat
                    </p>
                    <p className="mt-1 font-bold text-[var(--color-text-main)]">
                      {activeDeal?.chat_unlocked ? "Unlocked" : "Locked"}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
              <DocuSealSignButton
                contractId={contractId}
                label="Sign As Seller"
                loadingLabel="Opening DocuSeal..."
                disabled={!contractId || isDocuSealRefreshing}
                onError={(message) => {
                  if (message) setApiError(message);
                }}
                onSigningOpened={() => {
                  setApiError(null);
                }}
                onReturnFromSigning={handleDocuSealReturn}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[var(--color-primary)]/90 disabled:cursor-not-allowed disabled:opacity-60"
              />
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

            {contract &&
              isSigned &&
              activeDeal &&
              hasMarketingTracking &&
              !hasProofUploaded && (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-700">
                  72-hour marketing tracking is active. Waiting for buyer to
                  upload proof.
                </div>
              )}

          {activeDeal?.chat_unlocked && !isFlowStopped && (
  <Link
    to="/chat"
    className="flex w-full items-center justify-center gap-2 bg-[var(--color-primary)] px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:scale-[1.01]"
  >
    Open Deal Chat
  </Link>
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