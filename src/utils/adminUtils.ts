export function getApiList(response: any) {
  if (!response) return [];

  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;

  if (Array.isArray(response?.data?.data)) return response.data.data;

  // For object-shaped lists:
  // { "0": {...}, "1": {...} }
  if (response && typeof response === "object") {
    const values = Object.values(response);

    const looksLikeObjectList =
      values.length > 0 &&
      values.every((item) => item && typeof item === "object");

    if (looksLikeObjectList) {
      return values;
    }
  }

  if (response?.data && typeof response.data === "object") {
    const values = Object.values(response.data);

    const looksLikeObjectList =
      values.length > 0 &&
      values.every((item) => item && typeof item === "object");

    if (looksLikeObjectList) {
      return values;
    }
  }

  return [];
}

export function getApiPagination(response: any) {
  const pagination = response?.pagination ?? {};

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
  const data = item?.data ?? item?._doc ?? item;

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
  const data = user?.data ?? user?._doc ?? user;

  return data?.full_name || data?.fullName || data?.name || data?.email || "-";
}

export function getListingTitle(listing: any) {
  const data = listing?.data ?? listing?._doc ?? listing;

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
  const data = bid?.data ?? bid?._doc ?? bid;

  return (
    data?.amount ??
    data?.bid_price ??
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
    normalizedStatus.includes("active")
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