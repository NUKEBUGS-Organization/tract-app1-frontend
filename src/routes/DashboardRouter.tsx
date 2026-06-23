import { Navigate } from "react-router";

import DashboardLayout from "../layouts/DashboardLayout";

import { useAuthContext } from "../contexts/AuthContext";
import { tokenStorage } from "../redux/auth/tokenStorage";
import { getRoleFromToken } from "../redux/auth/jwtUtils";
import { useThemeMode } from "../hooks/useThemeMode";

import {
  ADMIN_ROLES,
  PARTNER_ROLES,
  REALTOR_ROLES,
  SELLER_ROLES,
  isAllowedRole,
  normalizeRole,
} from "../constants/roles";

const sellerNav = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "List Property", path: "/list-property" },
  { label: "My Listings", path: "/my-listings" },
  { label: "Document Vault", path: "/document-vault" },
  { label: "View Bids", path: "/bids" },
  { label: "Contracts", path: "/contracts" },
  { label: "Deal Tracker", path: "/deals" },
  { label: "Chat", path: "/chat" },
];

const partnerNav = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Property Stream", path: "/properties" },
  { label: "My Bids", path: "/my-bids" },
  { label: "Contracts", path: "/my-contracts" },
  { label: "Deal Tracker", path: "/deals" },
  { label: "Chat", path: "/chat" },
];

const realtorNav = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Properties", path: "/properties" },
  { label: "My Offers", path: "/realtor/my-offers" },
  { label: "Active Deals", path: "/realtor/deals" },
  { label: "Chat", path: "/chat" },
];

const adminNav = [
  { label: "Dashboard", path: "/dashboard" },

  // Admin-only screens
  { label: "Users", path: "/users" },
  { label: "Verifications", path: "/verifications" },

  // Shared feature routes
  { label: "Listings", path: "/properties" },
  { label: "Bids", path: "/bids" },
  { label: "Contracts", path: "/contracts" },
  { label: "Deals", path: "/deals" },
  { label: "Chat Rooms", path: "/chat" },

  // Admin-only screens
  { label: "Chat Flags", path: "/chat-flags" },
  // { label: "State Firewall", path: "/states" },
  // { label: "Scores", path: "/scores" },
  // { label: "Financials", path: "/financials" },
  // { label: "Audit Logs", path: "/audit-logs" },
];

export default function DashboardRouter() {
  const { role, accessToken } = useAuthContext();

  const token = accessToken || tokenStorage.getAccessToken();
  const userRole = normalizeRole(role || getRoleFromToken(token));

  const isPartner = isAllowedRole(userRole, PARTNER_ROLES);
  const isRealtor = isAllowedRole(userRole, REALTOR_ROLES);
  const showToggle = isPartner || isRealtor;

  const { mode, toggleMode } = useThemeMode(showToggle ? (isPartner ? "partner" : "partner") : "other");

  if (isAllowedRole(userRole, SELLER_ROLES)) {
    return (
      <DashboardLayout
        title="Seller Portal"
        navItems={sellerNav}
        mode="light"
      />
    );
  }

  if (isPartner) {
    return (
      <DashboardLayout
        title="Partner Pro Mode"
        navItems={partnerNav}
        mode={mode}
        onToggleTheme={toggleMode}
        showThemeToggle
      />
    );
  }

  if (isRealtor) {
    return (
      <DashboardLayout
        title="Licensed Partner Portal"
        navItems={realtorNav}
        mode={mode}
        onToggleTheme={toggleMode}
        showThemeToggle
      />
    );
  }

  if (isAllowedRole(userRole, ADMIN_ROLES)) {
    return (
      <DashboardLayout
        title="Admin Portal"
        navItems={adminNav}
        mode="light"
      />
    );
  }

  return <Navigate to="/unauthorized" replace />;
}
