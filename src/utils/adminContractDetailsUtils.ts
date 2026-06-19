import { formatDate } from "./adminUtils";

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

export function getId(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value;

  const doc = getDoc(value);

  return doc?._id || doc?.id || "";
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

export function formatMoney(value: any) {
  if (value === undefined || value === null || value === "") return "-";

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return String(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

export function getPersonName(person: any) {
  const doc = getDoc(person);

  return (
    doc?.full_name ||
    doc?.fullName ||
    doc?.name ||
    [doc?.first_name, doc?.last_name].filter(Boolean).join(" ") ||
    "-"
  );
}

export function getEmail(person: any) {
  const doc = getDoc(person);
  return doc?.email || "-";
}

export function getPhone(person: any) {
  const doc = getDoc(person);
  return doc?.phone || doc?.phone_number || doc?.phoneNumber || "-";
}

export function getRole(person: any) {
  const doc = getDoc(person);
  return doc?.role || "-";
}

export function getPropertyId(contract: any) {
  const doc = getDoc(contract);
  return getId(doc?.property_id);
}

export function getSellerId(contract: any, property: any) {
  const contractDoc = getDoc(contract);
  const propertyDoc = getDoc(property);

  return getId(contractDoc?.seller_id) || getId(propertyDoc?.seller_id);
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

  return (
    doc?.pdf_url ||
    doc?.pdfUrl ||
    doc?.contract_pdf_url ||
    doc?.contractPdfUrl ||
    doc?.signed_pdf_url ||
    doc?.signedPdfUrl ||
    doc?.document_url ||
    doc?.documentUrl ||
    doc?.docuseal_pdf_url ||
    doc?.docusealPdfUrl ||
    ""
  );
}

export function getContractPageImages(contract: any) {
  const doc = getDoc(contract);

  const images =
    doc?.page_images ||
    doc?.pageImages ||
    doc?.contract_images ||
    doc?.contractImages ||
    doc?.document_images ||
    doc?.documentImages ||
    [];

  return Array.isArray(images) ? images.filter(Boolean) : [];
}

export function getSellerSignedAt(contract: any) {
  const doc = getDoc(contract);
  return doc?.seller_signed_at || doc?.sellerSignedAt || null;
}

export function getBuyerSignedAt(contract: any) {
  const doc = getDoc(contract);
  return doc?.buyer_signed_at || doc?.buyerSignedAt || null;
}

export function isSellerSigned(contract: any) {
  return Boolean(getSellerSignedAt(contract));
}

export function isBuyerSigned(contract: any) {
  return Boolean(getBuyerSignedAt(contract));
}

export function getPropertyName(property: any) {
  const doc = getDoc(property);

  return (
    doc?.address ||
    doc?.property_address ||
    doc?.street_address ||
    doc?.title ||
    doc?.propertyTitle ||
    "Linked Property"
  );
}

export function getStreetAddress(property: any) {
  const doc = getDoc(property);

  return (
    doc?.address ||
    doc?.property_address ||
    doc?.street_address ||
    doc?.streetAddress ||
    doc?.address_line_1 ||
    doc?.addressLine1 ||
    "-"
  );
}

export function getCity(property: any) {
  const doc = getDoc(property);
  return doc?.city || "-";
}

export function getState(property: any) {
  const doc = getDoc(property);
  return doc?.state_code || doc?.stateCode || doc?.state || "-";
}

export function getZipCode(property: any) {
  const doc = getDoc(property);

  return (
    doc?.zip_code ||
    doc?.zipCode ||
    doc?.postal_code ||
    doc?.postalCode ||
    "-"
  );
}

export function getPropertyStatus(property: any) {
  const doc = getDoc(property);
  return doc?.status || "unknown";
}

export function getPropertyPrice(property: any) {
  const doc = getDoc(property);

  return (
    doc?.market_price ??
    doc?.marketPrice ??
    doc?.asking_price ??
    doc?.askingPrice ??
    doc?.price ??
    null
  );
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
  const sellerSigned = isSellerSigned(contract);
  const buyerSigned = isBuyerSigned(contract);
  const fullySigned = sellerSigned && buyerSigned;

  const steps = [
    {
      title: "Generated",
      description: "Contract document was created",
      helper: contract?.createdAt ? formatDate(contract.createdAt) : "-",
      isComplete: Boolean(contract?.createdAt),
    },
    {
      title: "Seller Signed",
      description: "Seller completed signature",
      helper: sellerSigned ? formatDate(getSellerSignedAt(contract)) : "Pending",
      isComplete: sellerSigned,
    },
    {
      title: "Buyer Signed",
      description: "Buyer completed signature",
      helper: buyerSigned ? formatDate(getBuyerSignedAt(contract)) : "Pending",
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