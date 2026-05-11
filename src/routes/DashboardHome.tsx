import { Navigate } from "react-router";

import SellerDashboard from "../pages/seller/SellerDashboard";
import PartnerDashboard from "../pages/partner/PartnerDashboard";
import RealtorDashboard from "../pages/realtor/RealtorDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

import { useAuthContext } from "../contexts/AuthContext";
import { tokenStorage } from "../redux/auth/tokenStorage";
import { getRoleFromToken } from "../redux/auth/jwtUtils";

function normalizeRole(role?: string | null) {
  return role?.toLowerCase().trim() ?? null;
}

export default function DashboardHome() {
  const { role, accessToken } = useAuthContext();

  const token = accessToken || tokenStorage.getAccessToken();
  const userRole = normalizeRole(role || getRoleFromToken(token));

  if (userRole === "seller") {
    return <SellerDashboard />;
  }

  if (
    userRole === "wholesaler" ||
    userRole === "partner" ||
    userRole === "private_partner"
  ) {
    return <PartnerDashboard />;
  }

  if (
    userRole === "realtor" ||
    userRole === "licensed" ||
    userRole === "licensed_partner"
  ) {
    return <RealtorDashboard />;
  }

  if (userRole === "admin") {
    return <AdminDashboard />;
  }

  return <Navigate to="/unauthorized" replace />;
}