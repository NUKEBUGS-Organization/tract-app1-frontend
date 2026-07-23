import { Navigate } from "react-router";

import SellerDashboard from "../pages/seller";
import PartnerDashboard from "../pages/partner";
import RealtorDashboard from "../pages/realtor";
import AdminDashboard from "../pages/admin";

import { useAuthContext } from "../contexts/AuthContext";
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

  const userRole = normalizeRole(role || getRoleFromToken(accessToken));

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