import { Navigate } from "react-router";

import DashboardLayout from "../layouts/DashboardLayout";

import { useAuthContext } from "../contexts/AuthContext";
import { tokenStorage } from "../redux/auth/tokenStorage";
import { getRoleFromToken } from "../redux/auth/jwtUtils";

const sellerNav = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "List Property", path: "/list-property" },
  { label: "Document Vault", path: "/document-vault" },
  { label: "View Bids", path: "/bids" },
  { label: "Deal Tracker", path: "/deal-tracker" },
];

const partnerNav = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Property Stream", path: "/properties" },
  { label: "Active Deals", path: "/deals" },
  { label: "Score", path: "/score" },
];

const realtorNav = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Profile Setup", path: "/profile" },
  { label: "Properties", path: "/properties" },
  { label: "Deals", path: "/deals" },
];

const adminNav = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "State Firewall", path: "/states" },
  { label: "Users", path: "/users" },
  { label: "Verifications", path: "/verifications" },
  { label: "Deals", path: "/deals" },
  { label: "Chat Flags", path: "/chat-flags" },
];

function normalizeRole(role?: string | null) {
  return role?.toLowerCase().trim() ?? null;
}

function getLayoutConfig(role?: string | null) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "seller") {
    return {
      title: "Seller Portal",
      navItems: sellerNav,
      mode: "light" as const,
    };
  }

  if (
    normalizedRole === "wholesaler" ||
    normalizedRole === "partner" ||
    normalizedRole === "private_partner"
  ) {
    return {
      title: "Partner Pro Mode",
      navItems: partnerNav,
      mode: "dark" as const,
    };
  }

  if (
    normalizedRole === "realtor" ||
    normalizedRole === "licensed" ||
    normalizedRole === "licensed_partner"
  ) {
    return {
      title: "Licensed Partner Portal",
      navItems: realtorNav,
      mode: "light" as const,
    };
  }

  if (normalizedRole === "admin") {
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
  const userRole = role || getRoleFromToken(token);

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