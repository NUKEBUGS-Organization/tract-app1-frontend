/**
 * Normalize Mongo / API entity ids to a comparable string.
 * Handles plain strings, populated refs `{ _id }`, and extended JSON `{ $oid }`.
 */
export function toIdString(id: unknown): string {
  if (id == null) return "";

  if (typeof id === "string") {
    const trimmed = id.trim();
    if (!trimmed || trimmed === "[object Object]") return "";
    return trimmed;
  }

  if (typeof id === "number" || typeof id === "bigint") {
    return String(id);
  }

  if (typeof id !== "object") return "";

  const obj = id as Record<string, unknown>;

  if ("_id" in obj && obj._id !== id) {
    const nested = toIdString(obj._id);
    if (nested) return nested;
  }

  if (typeof obj.$oid === "string" && obj.$oid.trim()) {
    return obj.$oid.trim();
  }

  if (typeof (obj as { toHexString?: () => string }).toHexString === "function") {
    try {
      return (obj as { toHexString: () => string }).toHexString();
    } catch {
      // fall through
    }
  }

  if (typeof (obj as { toString?: () => string }).toString === "function") {
    try {
      const asString = (obj as { toString: () => string }).toString();
      if (asString && asString !== "[object Object]") return asString;
    } catch {
      // fall through
    }
  }

  return "";
}

export function idsEqual(a: unknown, b: unknown): boolean {
  const left = toIdString(a);
  const right = toIdString(b);
  return left.length > 0 && left === right;
}

/** Entity id helper for list/detail pages. Always returns a string. */
export function getEntityId(item: unknown): string {
  if (!item) return "";
  if (typeof item === "string") return toIdString(item);
  return toIdString(item);
}

/**
 * Resolve the active listing id for seller pages.
 * Never trust a URL listingId that is not in the seller's own listings list
 * (that causes 403 ownership errors while the UI still shows another listing).
 */
export function resolveOwnedListingId(
  listings: unknown[],
  listingIdFromUrl: string,
): string {
  const ownedIds = listings.map((listing) => getEntityId(listing)).filter(Boolean);
  const fromUrl = toIdString(listingIdFromUrl);

  if (fromUrl && ownedIds.includes(fromUrl)) {
    return fromUrl;
  }

  return ownedIds[0] || "";
}
