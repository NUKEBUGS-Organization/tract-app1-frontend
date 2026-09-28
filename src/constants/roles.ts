// Backend auth/API roles (canonical). Legacy aliases below are UI/route-only.
export const BACKEND_ROLES = {
  SELLER: "seller",
  WHOLESALER: "wholesaler",
  REALTOR: "realtor",
  ADMIN: "admin",
} as const;

//src\constants\roles.ts
export const ROLES = {
  SELLER: "seller",
  WHOLESALER: "wholesaler",
  PARTNER: "partner",
  PRIVATE_PARTNER: "private_partner",
  REALTOR: "realtor",
  LICENSED: "licensed",
  LICENSED_PARTNER: "licensed_partner",
  ADMIN: "admin",
} as const;

export const SELLER_ROLES: string[] = [ROLES.SELLER];

export const PARTNER_ROLES: string[] = [
  ROLES.WHOLESALER,
  ROLES.PARTNER,
  ROLES.PRIVATE_PARTNER,
];

export const REALTOR_ROLES: string[] = [
  ROLES.REALTOR,
  ROLES.LICENSED,
  ROLES.LICENSED_PARTNER,
];

export const ADMIN_ROLES: string[] = [ROLES.ADMIN];

export const ALL_APP_ROLES: string[] = [
  ...SELLER_ROLES,
  ...PARTNER_ROLES,
  ...REALTOR_ROLES,
  ...ADMIN_ROLES,
];

export function normalizeRole(role?: string | null) {
  return role?.toLowerCase().trim() ?? "";
}

export function isAllowedRole(
  userRole?: string | null,
  allowedRoles: string[] = []
) {
  const normalizedUserRole = normalizeRole(userRole);

  if (!normalizedUserRole) {
    return false;
  }

  const normalizedAllowedRoles = allowedRoles.map((role) =>
    normalizeRole(role)
  );

  return normalizedAllowedRoles.includes(normalizedUserRole);
}