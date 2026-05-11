import { Navigate, Route, Routes } from "react-router";

import ProtectedRoute from "../features/auth/ProtectedRoute";
import RoleProtectedRoute from "../features/auth/RoleProtectedRoute";

import SignUp from "../pages/auth/SignUp";
import SignInPage from "../pages/auth/SignIn";
import VerifyPage from "../pages/auth/Verify";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
import ResetPasswordPage from "../pages/auth/ResetPassword";

import SellerDashboard from "../pages/seller/SellerDashboard";
import PartnerDashboard from "../pages/partner/PartnerDashboard";
import RealtorDashboard from "../pages/realtor/RealtorDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

import DashboardLayout from "../layouts/DashboardLayout";
import UnauthorizedPage from "../pages/common/UnauthorizedPage";

const sellerNav = [
  { label: "Dashboard", path: "/seller/dashboard" },
  { label: "List Property", path: "/seller/list-property" },
  { label: "Document Vault", path: "/seller/document-vault" },
  { label: "View Bids", path: "/seller/bids" },
  { label: "Deal Tracker", path: "/seller/deal-tracker" },
];

const partnerNav = [
  { label: "Dashboard", path: "/partner/dashboard" },
  { label: "Property Stream", path: "/partner/properties" },
  { label: "Active Deals", path: "/partner/deals" },
  { label: "Score", path: "/partner/score" },
];

const realtorNav = [
  { label: "Dashboard", path: "/realtor/dashboard" },
  { label: "Profile Setup", path: "/realtor/profile" },
  { label: "Properties", path: "/realtor/properties" },
  { label: "Deals", path: "/realtor/deals" },
];

const adminNav = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "State Firewall", path: "/admin/states" },
  { label: "Users", path: "/admin/users" },
  { label: "Verifications", path: "/admin/verifications" },
  { label: "Deals", path: "/admin/deals" },
  { label: "Chat Flags", path: "/admin/chat-flags" },
];

function AppRoutes() {
  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/auth/signup" replace />} />

      {/* Public Auth Routes */}
      <Route path="/auth/signup" element={<SignUp />} />
      <Route path="/auth/signin" element={<SignInPage />} />
      <Route path="/auth/verify" element={<VerifyPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleProtectedRoute allowedRoles={["seller"]} />}>
          <Route
            element={
              <DashboardLayout
                title="Seller Portal"
                navItems={sellerNav}
                mode="light"
              />
            }
          >
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
          </Route>
        </Route>

        <Route
          element={
            <RoleProtectedRoute
              allowedRoles={["partner", "private_partner", "wholesaler"]}
            />
          }
        >
          <Route
            element={
              <DashboardLayout
                title="Partner Pro Mode"
                navItems={partnerNav}
                mode="dark"
              />
            }
          >
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
          </Route>
        </Route>

        <Route
          element={
            <RoleProtectedRoute
              allowedRoles={["licensed", "licensed_partner", "realtor"]}
            />
          }
        >
          <Route
            element={
              <DashboardLayout
                title="Licensed Partner Portal"
                navItems={realtorNav}
                mode="light"
              />
            }
          >
            <Route path="/realtor/dashboard" element={<RealtorDashboard />} />
          </Route>
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
          <Route
            element={
              <DashboardLayout
                title="Admin Portal"
                navItems={adminNav}
                mode="light"
              />
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/auth/signup" replace />} />
    </Routes>
  );
}

export default AppRoutes;