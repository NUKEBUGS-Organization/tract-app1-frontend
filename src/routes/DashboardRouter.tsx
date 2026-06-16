import { Navigate } from "react-router";

import DashboardLayout from "../layouts/DashboardLayout";

import { useAuthContext } from "../contexts/AuthContext";
import { tokenStorage } from "../redux/auth/tokenStorage";
import { getRoleFromToken } from "../redux/auth/jwtUtils";

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
  { label: "Document Vault", path: "/document-vault" },
  { label: "View Bids", path: "/bids" },
  { label: "Contracts", path: "/contracts" },
  { label: "Deal Tracker", path: "/deals" },
  { label: "Chat", path: "/chat" },
];

const partnerNav = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Property Stream", path: "/properties" },
  { label: "My Bids", path: "/bids" },
  { label: "Contracts", path: "/contracts" },
  { label: "Active Deals", path: "/deals" },
  { label: "Chat", path: "/chat" },
  { label: "Score", path: "/score" },
];

const realtorNav = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Properties", path: "/properties" },
  { label: "Bids", path: "/bids" },
  { label: "Contracts", path: "/contracts" },
  { label: "Deals", path: "/deals" },
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
  { label: "State Firewall", path: "/states" },
  { label: "Scores", path: "/scores" },
  { label: "Financials", path: "/financials" },
  { label: "Audit Logs", path: "/audit-logs" },
];

function getLayoutConfig(role?: string | null) {
  const userRole = normalizeRole(role);

  if (isAllowedRole(userRole, SELLER_ROLES)) {
    return {
      title: "Seller Portal",
      navItems: sellerNav,
      mode: "light" as const,
    };
  }

  if (isAllowedRole(userRole, PARTNER_ROLES)) {
    return {
      title: "Partner Pro Mode",
      navItems: partnerNav,
      mode: "dark" as const,
    };
  }

  if (isAllowedRole(userRole, REALTOR_ROLES)) {
    return {
      title: "Licensed Partner Portal",
      navItems: realtorNav,
      mode: "light" as const,
    };
  }

  if (isAllowedRole(userRole, ADMIN_ROLES)) {
    return {
      title: "Admin Portal",
      navItems: adminNav,
      mode: "light" as const,
    };
  }

  return null;
}

export default function DashboardRouter() {
  const { role, accessToken } = useAuthContext();

  const token = accessToken || tokenStorage.getAccessToken();
  const userRole = normalizeRole(role || getRoleFromToken(token));

  const layoutConfig = getLayoutConfig(userRole);

  if (!layoutConfig) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <DashboardLayout
      title={layoutConfig.title}
      navItems={layoutConfig.navItems}
      mode={layoutConfig.mode}
    />
  );
}