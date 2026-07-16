import type { StatusBadgeVariant } from "../../../components/common/StatusBadge";
import { normalizeValue } from "../../../utils/adminUtils";
import {
  REALTOR_SCORE_EVENTS,
  US_STATE_NAMES,
  WHOLESALER_SCORE_EVENTS,
} from "./adminUserDetails.constants";

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

export function formatLabel(value: string) {
  if (!value || value === "-") return "-";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getScorePayload(value: any) {
  return value?.data?.data ?? value?.data ?? value ?? {};
}

export function getScoreUser(scoreResponse: any) {
  const payload = getScorePayload(scoreResponse);

  return getDoc(payload?.user);
}

export function getScoreHistory(scoreResponse: any) {
  const payload = getScorePayload(scoreResponse);

  return Array.isArray(payload?.history) ? payload.history : [];
}

export function getLastPenalty(scoreResponse: any) {
  const payload = getScorePayload(scoreResponse);

  return payload?.last_penalty ?? null;
}

export function hasReadableValue(value: any) {
  return value !== undefined && value !== null && value !== "" && value !== "-";
}

export function getEmail(user: any) {
  const doc = getDoc(user);

  return doc?.email || "-";
}

export function getPhone(user: any) {
  const doc = getDoc(user);

  return doc?.phone || doc?.phone_number || doc?.phoneNumber || "-";
}

export function getRawRole(user: any) {
  const doc = getDoc(user);

  return doc?.role || "-";
}

export function getKycStatus(user: any) {
  const doc = getDoc(user);

  return doc?.kyc_status || doc?.kycStatus || "-";
}

export function getBanReason(user: any) {
  const doc = getDoc(user);

  return doc?.ban_reason || doc?.banReason || "-";
}

export function getCreatedAt(user: any) {
  const doc = getDoc(user);

  return doc?.createdAt;
}

export function getUpdatedAt(user: any) {
  const doc = getDoc(user);

  return doc?.updatedAt;
}

export function getAddressObject(user: any) {
  const doc = getDoc(user);

  if (doc?.address && typeof doc.address === "object") return doc.address;
  if (doc?.location && typeof doc.location === "object") return doc.location;
  if (doc?.profile && typeof doc.profile === "object") return doc.profile;

  return doc;
}

export function getStreetAddress(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);

  if (typeof doc?.address === "string") return doc.address;

  return (
    addressDoc?.street_address ||
    addressDoc?.streetAddress ||
    addressDoc?.address_line_1 ||
    addressDoc?.addressLine1 ||
    addressDoc?.address ||
    doc?.street_address ||
    doc?.streetAddress ||
    doc?.address_line_1 ||
    doc?.addressLine1 ||
    "-"
  );
}

export function getAddressLine2(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);

  return (
    addressDoc?.address_line_2 ||
    addressDoc?.addressLine2 ||
    addressDoc?.apartment ||
    addressDoc?.unit ||
    doc?.address_line_2 ||
    doc?.addressLine2 ||
    doc?.apartment ||
    doc?.unit ||
    "-"
  );
}

export function getCity(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);

  return addressDoc?.city || doc?.city || "-";
}

export function getRawState(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);

  return (
    addressDoc?.state ||
    addressDoc?.state_name ||
    addressDoc?.stateName ||
    addressDoc?.state_code ||
    addressDoc?.stateCode ||
    doc?.state ||
    doc?.state_name ||
    doc?.stateName ||
    doc?.state_code ||
    doc?.stateCode ||
    ""
  );
}

export function getState(user: any) {
  const rawState = getRawState(user);

  if (!rawState) return "-";

  const upperState = rawState.toString().trim().toUpperCase();

  return US_STATE_NAMES[upperState] || rawState;
}

export function getZipCode(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);

  return (
    addressDoc?.zip_code ||
    addressDoc?.zipCode ||
    addressDoc?.postal_code ||
    addressDoc?.postalCode ||
    doc?.zip_code ||
    doc?.zipCode ||
    doc?.postal_code ||
    doc?.postalCode ||
    "-"
  );
}

export function getCountry(user: any) {
  const doc = getDoc(user);
  const addressDoc = getAddressObject(user);

  return addressDoc?.country || doc?.country || "-";
}

export function getFullAddress(user: any) {
  const parts = [
    getStreetAddress(user),
    getAddressLine2(user),
    getCity(user),
    getState(user),
    getZipCode(user),
    getCountry(user),
  ].filter((part) => hasReadableValue(part));

  return parts.length > 0 ? parts.join(", ") : "-";
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function getPartnerScoreInfo(user: any, scoreUser: any) {
  const role = normalizeValue(getRawRole(user));

  if (role === "wholesaler") {
    return {
      applies: true,
      label: "Reliability Score",
      value: scoreUser?.reliability_score ?? user?.reliability_score ?? 100,
      description:
        "Reliability score is used for wholesaler/private partner performance.",
    };
  }

  if (role === "realtor") {
    return {
      applies: true,
      label: "Professional Score",
      value: scoreUser?.professional_score ?? user?.professional_score ?? 100,
      description:
        "Professional score is used for realtor/licensed partner performance.",
    };
  }

  return {
    applies: false,
    label: "Partner Score",
    value: "N/A",
    description:
      "Score deductions currently apply only to wholesalers and realtors.",
  };
}

export function getScoreVariant(score: any): StatusBadgeVariant {
  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) return "neutral";
  if (numericScore >= 80) return "success";
  if (numericScore >= 50) return "warning";

  return "danger";
}

export function getRestrictionVariant(status: string): StatusBadgeVariant {
  const normalizedStatus = normalizeValue(status);

  if (normalizedStatus === "normal") return "success";
  if (normalizedStatus === "delayed_access") return "warning";

  if (
    normalizedStatus === "banned" ||
    normalizedStatus === "reinstatement_required"
  ) {
    return "danger";
  }

  return "neutral";
}

export function formatDelta(delta: any) {
  const numericDelta = Number(delta);

  if (Number.isNaN(numericDelta)) return "-";

  return numericDelta > 0 ? `+${numericDelta}` : `${numericDelta}`;
}

export function getEventCreatedAt(event: any) {
  const doc = getDoc(event);

  return doc?.createdAt || doc?.created_at;
}

export function getScoreEventOptions(user: any) {
  const role = normalizeValue(getRawRole(user));

  if (role === "wholesaler") return WHOLESALER_SCORE_EVENTS;
  if (role === "realtor") return REALTOR_SCORE_EVENTS;

  return [];
}