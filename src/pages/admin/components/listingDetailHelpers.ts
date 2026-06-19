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
  return (
    value?.data?.data?._doc ??
    value?.data?._doc ??
    value?._doc ??
    value?.data?.data ??
    value?.data ??
    value
  );
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
  return response?.data?.data ?? response?.data ?? response;
}

export function getDocumentsFromResponse(response: any) {
  const payload = getApiPayload(response);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.documents)) return payload.documents;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
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

  return doc?._id || doc?.id || "";
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

  return (
    doc?.phone ||
    doc?.phone_number ||
    doc?.phoneNumber ||
    doc?.mobile ||
    doc?.mobile_number ||
    "-"
  );
}

export function hasCompletePerson(value: any) {
  if (!value || typeof value !== "object") return false;

  const doc = getDoc(value);

  const hasName = Boolean(doc?.full_name || doc?.fullName || doc?.name);
  const hasEmail = Boolean(doc?.email);

  const hasPhone = Boolean(
    doc?.phone ||
      doc?.phone_number ||
      doc?.phoneNumber ||
      doc?.mobile ||
      doc?.mobile_number
  );

  return hasName && hasEmail && hasPhone;
}

export function mergePerson(primary: any, fallback: any) {
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

export function getAddressLine(listing: any) {
  return [
    listing.address || listing.property_address || listing.street_address,
    listing.city,
    listing.state_code || listing.state,
    listing.zip_code || listing.zipCode,
  ]
    .filter(Boolean)
    .join(", ");
}

export function getDocumentTitle(document: any) {
  if (typeof document === "string") return "Property image";

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

export function getDocumentUrl(document: any) {
  if (typeof document === "string") return document;

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

export function getDocumentMimeType(document: any) {
  if (typeof document === "string") return "";

  return (
    document.mime_type ||
    document.mimeType ||
    document.file_type ||
    document.fileType ||
    ""
  );
}

export function isImageDocument(document: any) {
  const mimeType = getDocumentMimeType(document).toLowerCase();
  const title = getDocumentTitle(document).toLowerCase();
  const url = getDocumentUrl(document).toLowerCase();

  if (mimeType.startsWith("image/")) return true;

  return /\.(jpg|jpeg|png|webp|gif|bmp|avif|svg)(\?.*)?$/i.test(title || url);
}

export function getListingImageItems(listing: any, documents: any[]) {
  const pictureUrls = Array.isArray(listing?.picture_urls)
    ? listing.picture_urls
    : Array.isArray(listing?.pictureUrls)
    ? listing.pictureUrls
    : [];

  const pictureItems = pictureUrls.map((url: string, index: number) => ({
    title: `Property image ${index + 1}`,
    url,
    file_url: url,
    mime_type: "image/jpeg",
    source: "listing",
  }));

  const documentImages = documents.filter(
    (document: any) => isImageDocument(document) && Boolean(getDocumentUrl(document))
  );

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
  return (
    listing?.asking_price ??
    listing?.askingPrice ??
    listing?.market_price ??
    listing?.marketPrice ??
    listing?.suggested_price ??
    listing?.suggestedPrice ??
    listing?.price ??
    listing?.list_price ??
    listing?.listPrice
  );
}

export function getListingReservePrice(listing: any) {
  return (
    listing?.hidden_reserve ??
    listing?.hiddenReserve ??
    listing?.reserve_price ??
    listing?.reservePrice
  );
}

export function getApprovedAt(listing: any) {
  return (
    listing?.approved_at ??
    listing?.approvedAt ??
    listing?.reviewed_at ??
    listing?.reviewedAt ??
    listing?.live_at ??
    listing?.liveAt
  );
}

export function getRejectedAt(listing: any) {
  return listing?.rejected_at ?? listing?.rejectedAt;
}

export function getDeletedAt(listing: any) {
  return listing?.deleted_at ?? listing?.deletedAt;
}

export function getSubmittedAt(listing: any) {
  return listing?.submitted_at ?? listing?.submittedAt ?? listing?.createdAt;
}

export function getListingTimelineSteps(listing: any): ListingTimelineStep[] {
  const status = normalizeValue(listing?.status);

  const approvedAt = getApprovedAt(listing);
  const rejectedAt = getRejectedAt(listing);
  const deletedAt = getDeletedAt(listing);
  const submittedAt = getSubmittedAt(listing);

  const isDraft = status === "draft";
  const isSubmitted = ["submitted", "pending"].includes(status);
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
    finalDate = formatDate(approvedAt || listing?.live_at || listing?.updatedAt);
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