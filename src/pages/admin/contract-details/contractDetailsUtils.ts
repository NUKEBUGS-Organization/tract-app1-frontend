export function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

export function getDoc(value: any) {
  return value?.data?._doc ?? value?._doc ?? value?.data ?? value;
}

export function getRelationIdValue(value: any) {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  const doc = getDoc(value);

  return doc?._id || doc?.id || "";
}

export function getRelationId(value: any) {
  return getRelationIdValue(value) || "-";
}

export function getRelationEmail(value: any) {
  if (!value || typeof value !== "object") {
    return "-";
  }

  const doc = getDoc(value);

  return doc?.email || "-";
}

export function getRelationPhone(value: any) {
  if (!value || typeof value !== "object") {
    return "-";
  }

  const doc = getDoc(value);

  return (
    doc?.phone ||
    "-"
  );
}

function hasPersonName(value: any) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const doc = getDoc(value);

  return Boolean(doc?.full_name || doc?.fullName || doc?.name);
}

function hasPersonEmail(value: any) {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Boolean(getDoc(value)?.email);
}

function hasPersonPhone(value: any) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const doc = getDoc(value);

  return Boolean(
    doc?.phone 
  );
}

export function hasCompletePerson(value: any) {
  return (
    hasPersonName(value) &&
    hasPersonEmail(value) &&
    hasPersonPhone(value)
  );
}

export function mergePerson(primary: any, fallback: any) {
  if (!primary && !fallback) {
    return null;
  }

  if (typeof primary === "string") {
    return fallback || primary;
  }

  const primaryDoc = getDoc(primary) || {};
  const fallbackDoc = getDoc(fallback) || {};

  return {
    ...fallbackDoc,
    ...primaryDoc,

    _id:
      primaryDoc?._id ||
      primaryDoc?.id ||
      fallbackDoc?._id ||
      fallbackDoc?.id,

    id:
      primaryDoc?.id ||
      primaryDoc?._id ||
      fallbackDoc?.id ||
      fallbackDoc?._id,

    full_name:
      primaryDoc?.full_name ||
      fallbackDoc?.full_name ,
    

    email: primaryDoc?.email || fallbackDoc?.email,

    phone:
      primaryDoc?.phone ||
      fallbackDoc?.phone 
  };
}

function mergeRelation(apiValue: any, stateValue: any) {
  if (apiValue && typeof apiValue === "object") {
    return apiValue;
  }

  return stateValue ?? apiValue;
}

export function mergeContractData(
  apiResponse: any,
  stateResponse: any
) {
  const apiContract = getDoc(getApiPayload(apiResponse));
  const stateContract = getDoc(getApiPayload(stateResponse));

  if (!apiContract && !stateContract) {
    return null;
  }

  if (!apiContract) {
    return stateContract;
  }

  if (!stateContract) {
    return apiContract;
  }

  return {
    ...stateContract,
    ...apiContract,

    property_id: mergeRelation(
      apiContract?.property_id,
      stateContract?.property_id
    ),

    listing_id: mergeRelation(
      apiContract?.listing_id,
      stateContract?.listing_id
    ),

    seller_id: mergeRelation(
      apiContract?.seller_id,
      stateContract?.seller_id
    ),

    buyer_id: mergeRelation(
      apiContract?.buyer_id,
      stateContract?.buyer_id
    ),

    bid_id: mergeRelation(
      apiContract?.bid_id,
      stateContract?.bid_id
    ),

    deal_id: mergeRelation(
      apiContract?.deal_id,
      stateContract?.deal_id
    ),
  };
}

export function getContractPropertyRelation(contract: any) {
  return (
    contract?.property_id ||
    contract?.listing_id ||
    contract?.property ||
    contract?.listing ||
    null
  );
}

export function getContractProperty(contract: any) {
  return getDoc(getContractPropertyRelation(contract));
}

export function getPropertyAddress(property: any) {
  if (!property || typeof property !== "object") {
    return "-";
  }

  const doc = getDoc(property);

  const address = [
    doc?.address ||
      doc?.property_address ||
      doc?.street_address,
    doc?.city,
    doc?.state_code || doc?.state,
    doc?.zip_code || doc?.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return address || "-";
}

export function getContractPdfUrl(contract: any) {
  return (
    contract?.pdf_url ||
    contract?.pdfUrl ||
    contract?.contract_pdf_url ||
    contract?.contractPdfUrl ||
    contract?.document_url ||
    contract?.documentUrl ||
    ""
  );
}

export function getSellerSignedAt(contract: any) {
  return (
    contract?.seller_signed_at ||
    contract?.sellerSignedAt ||
    null
  );
}

export function getBuyerSignedAt(contract: any) {
  return (
    contract?.buyer_signed_at ||
    contract?.buyerSignedAt ||
    null
  );
}

export function isSellerSigned(contract: any) {
  return Boolean(
    getSellerSignedAt(contract) ||
      contract?.seller_signed ||
      contract?.sellerSigned
  );
}

export function isBuyerSigned(contract: any) {
  return Boolean(
    getBuyerSignedAt(contract) ||
      contract?.buyer_signed ||
      contract?.buyerSigned
  );
}

export function getContractAmount(contract: any) {
  const bid = getDoc(contract?.bid_id);

  return (
    contract?.purchase_price ??
    contract?.purchasePrice ??
    contract?.offer_price ??
    contract?.offerPrice ??
    contract?.bid_amount ??
    contract?.bidAmount ??
    bid?.amount ??
    bid?.bid_amount ??
    bid?.bidAmount ??
    bid?.offer_price ??
    bid?.offerPrice ??
    null
  );
}

export function formatCurrency(value: any) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "-";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return String(value);
  }

  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
