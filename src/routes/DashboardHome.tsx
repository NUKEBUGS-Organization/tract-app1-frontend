import { Navigate } from "react-router";

import SellerDashboard from "../pages/seller/SellerDashboard";
import PartnerDashboard from "../pages/partner/PartnerDashboard";
import RealtorDashboard from "../pages/realtor/RealtorDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

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

export default function DashboardHome() {
  const { role, accessToken } = useAuthContext();

  const token = accessToken || tokenStorage.getAccessToken();
  const userRole = normalizeRole(role || getRoleFromToken(token));

  if (isAllowedRole(userRole, SELLER_ROLES)) {
    return <SellerDashboard />;
  }

  if (isAllowedRole(userRole, PARTNER_ROLES)) {
    return <PartnerDashboard />;
  }

  if (isAllowedRole(userRole, REALTOR_ROLES)) {
    return <RealtorDashboard />;
  }

  if (isAllowedRole(userRole, ADMIN_ROLES)) {
    return <AdminDashboard />;
  }

  return <Navigate to="/unauthorized" replace />;
}