import { formatDate, formatMoney } from "./adminUtils";

export function getDoc(value: any) {
  const payload = value?.data?.data ?? value?.data ?? value;

  return payload?._doc ?? payload;
}

export function getId(value: any) {
  if (!value) return "";

  if (typeof value === "string") return value;

  const doc = getDoc(value);

  return doc?._id || "";
}

export function formatLabel(value: any) {
  if (!value) return "-";

  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function hasReadableValue(value: any) {
  return value !== undefined && value !== null && value !== "" && value !== "-";
}

export function getPersonName(person: any) {
  const doc = getDoc(person);

  return doc?.full_name || "-";
}

export function getEmail(person: any) {
  const doc = getDoc(person);

  return doc?.email || "-";
}

export function getPhone(person: any) {
  const doc = getDoc(person);

  return doc?.phone || "-";
}

export function getRole(person: any) {
  const doc = getDoc(person);

  return doc?.role || "-";
}

export function getPropertyId(contract: any) {
  const doc = getDoc(contract);

  return getId(doc?.property_id);
}

export function getSellerId(contract: any) {
  const doc = getDoc(contract);

  return getId(doc?.seller_id);
}

export function getBuyerId(contract: any) {
  const doc = getDoc(contract);

  return getId(doc?.buyer_id);
}

export function getBidId(contract: any) {
  const doc = getDoc(contract);

  return getId(doc?.bid_id);
}

export function getContractStatus(contract: any) {
  const doc = getDoc(contract);

  return doc?.status || "unknown";
}

export function getPdfUrl(contract: any) {
  const doc = getDoc(contract);

  return doc?.pdf_url || "";
}

export function getContractPageImages(contract: any) {
  const doc = getDoc(contract);
  const images = doc?.page_images || [];

  return Array.isArray(images) ? images.filter(Boolean) : [];
}

export function getSellerSignedAt(contract: any) {
  const doc = getDoc(contract);

  return doc?.seller_signed_at || null;
}

export function getBuyerSignedAt(contract: any) {
  const doc = getDoc(contract);

  return doc?.buyer_signed_at || null;
}

export function isSellerSigned(contract: any) {
  return Boolean(getSellerSignedAt(contract));
}

export function isBuyerSigned(contract: any) {
  return Boolean(getBuyerSignedAt(contract));
}

export function getPropertyName(property: any) {
  const doc = getDoc(property);

  return doc?.address || "Linked Property";
}

export function getStreetAddress(property: any) {
  const doc = getDoc(property);

  return doc?.address || "-";
}

export function getCity(property: any) {
  const doc = getDoc(property);

  return doc?.city || "-";
}

export function getState(property: any) {
  const doc = getDoc(property);

  return doc?.state_code || "-";
}

export function getZipCode(property: any) {
  const doc = getDoc(property);

  return doc?.zip_code || "-";
}

export function getPropertyStatus(property: any) {
  const doc = getDoc(property);

  return doc?.status || "unknown";
}

export function getPropertyPrice(property: any) {
  const doc = getDoc(property);

  return doc?.market_price ?? null;
}

export function getFullAddress(property: any) {
  const parts = [
    getStreetAddress(property),
    getCity(property),
    getState(property),
    getZipCode(property),
  ].filter((part) => hasReadableValue(part));

  return parts.length > 0 ? parts.join(", ") : "-";
}

export function getSigningLabel(contract: any) {
  const sellerSigned = isSellerSigned(contract);
  const buyerSigned = isBuyerSigned(contract);

  if (sellerSigned && buyerSigned) return "Fully Signed";
  if (sellerSigned || buyerSigned) return "Partially Signed";

  return "Awaiting Signatures";
}

export function getSigningVariant(contract: any) {
  const sellerSigned = isSellerSigned(contract);
  const buyerSigned = isBuyerSigned(contract);

  if (sellerSigned && buyerSigned) return "success";
  if (sellerSigned || buyerSigned) return "warning";

  return "neutral";
}

export function getSigningProgress(contract: any) {
  const doc = getDoc(contract);

  const sellerSigned = isSellerSigned(doc);
  const buyerSigned = isBuyerSigned(doc);
  const fullySigned = sellerSigned && buyerSigned;

  const sellerSignedAt = getSellerSignedAt(doc);
  const buyerSignedAt = getBuyerSignedAt(doc);

  const steps = [
    {
      title: "Generated",
      description: "Contract document was created",
      helper: doc?.createdAt ? formatDate(doc.createdAt) : "-",
      isComplete: Boolean(doc?.createdAt),
    },
    {
      title: "Seller Signed",
      description: "Seller completed signature",
      helper: sellerSigned ? formatDate(sellerSignedAt) : "Pending",
      isComplete: sellerSigned,
    },
    {
      title: "Buyer Signed",
      description: "Buyer completed signature",
      helper: buyerSigned ? formatDate(buyerSignedAt) : "Pending",
      isComplete: buyerSigned,
    },
    {
      title: "Fully Signed",
      description: "Both parties completed signing",
      helper: fullySigned ? "Contract is complete" : "Waiting",
      isComplete: fullySigned,
    },
  ];

  const completedCount = steps.filter((step) => step.isComplete).length;
  const progress =
    completedCount === 0 ? 0 : (completedCount / steps.length) * 100;

  return {
    steps,
    completedCount,
    totalSteps: steps.length,
    progress,
  };
}

export { formatMoney };

