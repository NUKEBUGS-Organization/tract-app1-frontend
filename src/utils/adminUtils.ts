// src/utils/adminUtils.ts

export function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

export function getApiDoc(response: any) {
  const payload = getApiPayload(response);

  // Needed only because current single detail APIs sometimes return Mongoose document:
  // { "$__": ..., "$isNew": false, "_doc": {...} }
  return payload?._doc ?? payload;
}

export function getApiList(response: any) {
  if (!response) return [];

  // Some RTK endpoints may return the list directly.
  if (Array.isArray(response)) return response;

  // Raw backend shape:
  // { success, data: { data: [...], pagination: {...} } }
  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  // RTK/unwrapped shape:
  // { data: [...], pagination: {...} }
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

export function getApiPagination(response: any) {
  const pagination =
    response?.data?.pagination ??
    response?.pagination ??
    {};

  return {
    page: pagination.page ?? 1,
    limit: pagination.limit ?? 20,
    total: pagination.total ?? 0,
    totalPages: pagination.totalPages ?? 1,
  };
}

export function getMongoId(item: any) {
  const data = getApiDoc(item);

  return data?._id ?? "";
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

  return data?.fullName || data?.full_name || "-";
}

export function getListingTitle(listing: any) {
  const data = getApiDoc(listing);

  return data?.address || "Listing";
}

export function getBidAmount(bid: any) {
  const data = getApiDoc(bid);

  return data?.bid_price ?? null;
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
    normalizedStatus === "verified" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "live" ||
    normalizedStatus === "signed" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "closed" ||
    normalizedStatus === "active" ||
    normalizedStatus === "selected"
  ) {
    return "success";
  }

  if (
    normalizedStatus === "rejected" ||
    normalizedStatus === "cancelled" ||
    normalizedStatus === "canceled" ||
    normalizedStatus === "banned" ||
    normalizedStatus === "deleted"
  ) {
    return "danger";
  }

  return "warning";
}