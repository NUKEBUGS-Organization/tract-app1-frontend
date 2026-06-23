import { formatDate, normalizeValue } from "../../../utils/adminUtils";

export type TimelineStepState = "complete" | "active" | "pending" | "danger";

export type ListingTimelineStep = {
  key: string;
  label: string;
  description: string;
  date: string;
  state: TimelineStepState;
};

export function getDoc(value: any) {
  const payload = value?.data ?? value;

  return payload?._doc ?? payload;
}

export function displayAdminValue(value: any) {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();

  if (Array.isArray(value)) {
    if (value.length === 0) return "-";

    return value
      .map((item) =>
        typeof item === "object" ? JSON.stringify(item) : String(item)
      )
      .join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function getApiPayload(response: any) {
  return response?.data ?? response;
}

export function getDocumentsFromResponse(response: any) {
  const payload = getApiPayload(response);

  return Array.isArray(payload) ? payload : [];
}

export function formatMoney(value: any) {
  if (value === undefined || value === null || value === "") return "-";

  const cleanValue =
    typeof value === "string" ? value.replace(/,/g, "") : value;

  const numberValue = Number(cleanValue);

  if (!Number.isFinite(numberValue)) return displayAdminValue(value);

  return numberValue.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatLabel(value: any) {
  if (!value) return "-";

  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatStatusLabel(status: any) {
  if (!status) return "Unknown";

  return formatLabel(status);
}

export function getRelationIdValue(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value;

  const doc = getDoc(value);

  return doc?._id || "";
}

export function getRelationId(value: any) {
  return getRelationIdValue(value) || "-";
}

export function getRelationEmail(value: any) {
  if (!value || typeof value !== "object") return "-";

  const doc = getDoc(value);

  return doc?.email || "-";
}

export function getRelationPhone(value: any) {
  if (!value || typeof value !== "object") return "-";

  const doc = getDoc(value);

  return doc?.phone || "-";
}

export function hasCompletePerson(value: any) {
  if (!value || typeof value !== "object") return false;

  const doc = getDoc(value);

  const hasName = Boolean(doc?.full_name);
  const hasEmail = Boolean(doc?.email);
  const hasPhone = Boolean(doc?.phone);

  return hasName && hasEmail && hasPhone;
}

export function mergePerson(primary: any, fallback: any) {
  if (!primary && !fallback) return null;

  const primaryDoc = typeof primary === "object" ? getDoc(primary) || {} : {};
  const fallbackDoc = typeof fallback === "object" ? getDoc(fallback) || {} : {};

  const primaryId = typeof primary === "string" ? primary : primaryDoc?._id;

  return {
    ...fallbackDoc,
    ...primaryDoc,
    _id: primaryId || fallbackDoc?._id || "",
    full_name: primaryDoc?.full_name || fallbackDoc?.full_name,
    email: primaryDoc?.email || fallbackDoc?.email,
    phone: primaryDoc?.phone || fallbackDoc?.phone,
    role: primaryDoc?.role || fallbackDoc?.role,
  };
}

export function getAddressLine(listing: any) {
  return [
    listing?.address,
    listing?.city,
    listing?.state_code,
    listing?.zip_code,
  ]
    .filter(Boolean)
    .join(", ");
}

export function getDocumentTitle(document: any) {
  if (typeof document === "string") return "Property image";

  return document?.title || "Property image";
}

export function getDocumentUrl(document: any) {
  if (typeof document === "string") return document;

  return document?.url || document?.file_url || "";
}

export function getDocumentMimeType(document: any) {
  if (typeof document === "string") return "";

  return document?.mime_type || "";
}

export function isImageDocument(document: any) {
  const mimeType = getDocumentMimeType(document).toLowerCase();
  const url = getDocumentUrl(document).toLowerCase();

  if (mimeType.startsWith("image/")) return true;

  return /\.(jpg|jpeg|png|webp|gif|bmp|avif|svg)(\?.*)?$/i.test(url);
}

export function getListingImageItems(listing: any, documents: any[]) {
  const pictureUrls = Array.isArray(listing?.picture_urls)
    ? listing.picture_urls
    : [];

  const pictureItems = pictureUrls.map((url: string, index: number) => ({
    title: `Property image ${index + 1}`,
    url,
    file_url: url,
    mime_type: "image/jpeg",
    source: "listing",
  }));

  const documentImages = documents
    .filter((document: any) => isImageDocument(document))
    .filter((document: any) => Boolean(getDocumentUrl(document)));

  const uniqueImages = new Map<string, any>();

  [...pictureItems, ...documentImages].forEach((image) => {
    const url = getDocumentUrl(image);

    if (url && !uniqueImages.has(url)) {
      uniqueImages.set(url, image);
    }
  });

  return Array.from(uniqueImages.values());
}

export function getListingPrice(listing: any) {
  return listing?.market_price ?? listing?.suggested_price ?? null;
}

export function getListingReservePrice(listing: any) {
  return listing?.hidden_reserve ?? null;
}

export function getApprovedAt(listing: any) {
  return listing?.reviewed_at ?? listing?.live_at ?? null;
}

export function getRejectedAt(listing: any) {
  const status = normalizeValue(listing?.status);

  if (status !== "rejected") return null;

  return listing?.reviewed_at ?? listing?.updatedAt ?? null;
}

export function getDeletedAt(listing: any) {
  return listing?.deleted_at ?? null;
}

export function getSubmittedAt(listing: any) {
  return listing?.createdAt ?? null;
}

export function getListingTimelineSteps(listing: any): ListingTimelineStep[] {
  const status = normalizeValue(listing?.status);

  const approvedAt = getApprovedAt(listing);
  const rejectedAt = getRejectedAt(listing);
  const deletedAt = getDeletedAt(listing);
  const submittedAt = getSubmittedAt(listing);

  const isDraft = status === "draft";
  const isSubmitted = status === "submitted";
  const isRejected = status === "rejected";
  const isDeleted = Boolean(deletedAt) || status === "deleted";
  const isLive = status === "live";
  const isPaused = status === "paused";
  const isUnderContract = status === "under_contract";
  const isClosed = status === "closed";
  const isCancelled = status === "cancelled";
  const isWithdrawn = status === "withdrawn";

  const hasMovedBeyondSubmitted =
    isLive ||
    isRejected ||
    isPaused ||
    isUnderContract ||
    isClosed ||
    isCancelled ||
    isWithdrawn ||
    isDeleted;

  let reviewLabel = "Admin Review";
  let reviewDescription = "Waiting for admin decision";
  let reviewDate = "-";
  let reviewState: TimelineStepState = "pending";

  if (isSubmitted) {
    reviewState = "active";
  }

  if (approvedAt || isLive || isPaused || isUnderContract || isClosed) {
    reviewLabel = "Approved";
    reviewDescription = "Listing passed admin review";
    reviewDate = formatDate(approvedAt || listing?.updatedAt);
    reviewState = "complete";
  }

  if (isRejected) {
    reviewLabel = "Rejected";
    reviewDescription = "Listing was rejected by admin";
    reviewDate = formatDate(rejectedAt || listing?.updatedAt);
    reviewState = "danger";
  }

  let finalLabel = "Publish";
  let finalDescription = "Ready to become visible";
  let finalDate = "-";
  let finalState: TimelineStepState = "pending";

  if (isLive) {
    finalLabel = "Live";
    finalDescription = "Listing is visible to buyers";
    finalDate = formatDate(listing?.live_at || listing?.updatedAt);
    finalState = "complete";
  }

  if (isPaused) {
    finalLabel = "Paused";
    finalDescription = "Listing is temporarily paused";
    finalDate = formatDate(listing?.updatedAt);
    finalState = "active";
  }

  if (isUnderContract) {
    finalLabel = "Under Contract";
    finalDescription = "Listing has moved into contract stage";
    finalDate = formatDate(listing?.updatedAt);
    finalState = "complete";
  }

  if (isClosed) {
    finalLabel = "Closed";
    finalDescription = "Deal has been completed";
    finalDate = formatDate(listing?.updatedAt);
    finalState = "complete";
  }

  if (isCancelled) {
    finalLabel = "Cancelled";
    finalDescription = "Listing process was cancelled";
    finalDate = formatDate(listing?.updatedAt);
    finalState = "danger";
  }

  if (isWithdrawn) {
    finalLabel = "Withdrawn";
    finalDescription = "Seller withdrew this listing";
    finalDate = formatDate(listing?.updatedAt);
    finalState = "danger";
  }

  if (isRejected) {
    finalLabel = "Stopped";
    finalDescription = "Listing cannot go live until corrected";
    finalDate = formatDate(rejectedAt || listing?.updatedAt);
    finalState = "danger";
  }

  if (isDeleted) {
    finalLabel = "Deleted";
    finalDescription = "Listing was deleted or marked deleted";
    finalDate = formatDate(deletedAt || listing?.updatedAt);
    finalState = "danger";
  }

  return [
    {
      key: "created",
      label: "Created",
      description: "Seller started the listing",
      date: formatDate(listing?.createdAt),
      state: listing?.createdAt ? "complete" : "pending",
    },
    {
      key: "submitted",
      label: "Submitted",
      description: isDraft
        ? "Listing has not been submitted yet"
        : "Listing entered admin queue",
      date: isDraft ? "-" : formatDate(submittedAt),
      state: isDraft ? "pending" : "complete",
    },
    {
      key: "review",
      label: reviewLabel,
      description: reviewDescription,
      date: reviewDate,
      state: reviewState,
    },
    {
      key: "final",
      label: finalLabel,
      description: hasMovedBeyondSubmitted
        ? finalDescription
        : "Final status will appear after review",
      date: finalDate,
      state: finalState,
    },
  ];
}
