import { Navigate, Route, Routes } from "react-router";
import EntryPage from "../pages/auth/SignUp";
import SignInPage from "../pages/auth/SignIn";
import VerifyPage from "../pages/auth/Verify";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
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
      <Route path="/" element={<Navigate to="/auth/signup" replace />} />
      <Route path="/auth/signup" element={<EntryPage />} />
      <Route path="/auth/signin" element={<SignInPage />} />
      <Route path="/auth/verify" element={<VerifyPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

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
    </Routes>
  );
}

export default AppRoutes;