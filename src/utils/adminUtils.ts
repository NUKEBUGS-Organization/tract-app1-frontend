// src/utils/adminUtils.ts

export function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

export function getApiDoc(response: any) {
  const payload = getApiPayload(response);

  return payload?._doc ?? payload;
}

export function getApiList(response: any) {
  if (!response) return [];

  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;

  if (Array.isArray(response?.data?.data)) return response.data.data;

  if (Array.isArray(response?.data?.data?.data)) {
    return response.data.data.data;
  }

  // Only support numeric object lists:
  // { "0": {...}, "1": {...} }
  function getNumericObjectList(value: any) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return [];
    }

    const keys = Object.keys(value);
    const values = Object.values(value);

    const looksLikeNumericObjectList =
      keys.length > 0 &&
      keys.every((key) => /^\d+$/.test(key)) &&
      values.every((item) => item && typeof item === "object");

    return looksLikeNumericObjectList ? values : [];
  }

  const directObjectList = getNumericObjectList(response);
  if (directObjectList.length > 0) return directObjectList;

  const dataObjectList = getNumericObjectList(response?.data);
  if (dataObjectList.length > 0) return dataObjectList;

  const nestedDataObjectList = getNumericObjectList(response?.data?.data);
  if (nestedDataObjectList.length > 0) return nestedDataObjectList;

  return [];
}

export function getApiPagination(response: any) {
  const pagination =
    response?.pagination ??
    response?.data?.pagination ??
    response?.data?.data?.pagination ??
    {};

  return {
    page: pagination.page ?? 1,
    limit: pagination.limit ?? 20,
    total: pagination.total ?? 0,
    totalPages:
      pagination.totalPages ??
      pagination.total_pages ??
      pagination.totalPagesCount ??
      1,
    hasNext: pagination.has_next ?? pagination.hasNext ?? false,
  };
}

export function getMongoId(item: any) {
  const data = getApiDoc(item);

  return data?._id ?? data?.id ?? "";
}

export function normalizeValue(value?: string | null) {
  return value?.toString().toLowerCase().trim() ?? "";
}

export function displayValue(value: any) {
  return value === undefined || value === null || value === "" ? "-" : value;
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString();
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString();
}

export function getPersonName(user: any) {
  const data = getApiDoc(user);

  return data?.full_name || data?.fullName || data?.name || data?.email || "-";
}

export function getListingTitle(listing: any) {
  const data = getApiDoc(listing);

  return (
    data?.title ||
    data?.property_address ||
    data?.address ||
    data?.street_address ||
    data?.propertyAddress ||
    "Listing"
  );
}

export function getBidAmount(bid: any) {
  const data = getApiDoc(bid);

  return (
    data?.bid_price ??
    data?.amount ??
    data?.bidPrice ??
    data?.offer_price ??
    data?.offerPrice ??
    data?.purchase_price ??
    data?.purchasePrice ??
    data?.price ??
    null
  );
}

export function formatMoney(value: any) {
  if (value === undefined || value === null || value === "") return "-";

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return displayValue(value);

  return numberValue.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function getStatusVariant(status?: string | null) {
  const normalizedStatus = normalizeValue(status);

  if (
    normalizedStatus.includes("verified") ||
    normalizedStatus.includes("approved") ||
    normalizedStatus.includes("accepted") ||
    normalizedStatus.includes("live") ||
    normalizedStatus.includes("signed") ||
    normalizedStatus.includes("completed") ||
    normalizedStatus.includes("closed") ||
    normalizedStatus.includes("active") ||
    normalizedStatus.includes("selected")
  ) {
    return "success";
  }

  if (
    normalizedStatus.includes("rejected") ||
    normalizedStatus.includes("cancelled") ||
    normalizedStatus.includes("canceled") ||
    normalizedStatus.includes("banned") ||
    normalizedStatus.includes("deleted")
  ) {
    return "danger";
  }

  return "warning";
}

