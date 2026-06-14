import { Navigate, Route, Routes } from "react-router";

import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import DashboardRouter from "./DashboardRouter";
import DashboardHome from "./DashboardHome";

import SignUp from "../pages/auth/SignUp";
import SignInPage from "../pages/auth/SignIn";
import VerifyPage from "../pages/auth/Verify";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
import ResetPasswordPage from "../pages/auth/ResetPassword";

import KycPage from "../pages/kyc";

import UnauthorizedPage from "../pages/common/UnauthorizedPage";
import PlaceholderPage from "../pages/common/PlaceholderPage";

// Seller pages
import ListPropertyPage from "../pages/seller/ListPropertyPage";
import DocumentVaultPage from "../pages/seller/DocumentVaultPage";
import ViewBidsPage from "../pages/seller/ViewBidsPage";
import DealTrackerPage from "../pages/seller/DealTrackerPage";
import ListingDetailsPage from "../pages/seller/ListingDetailsPage";
import EditListingPage from "../pages/seller/EditListingPage";
import ContractsPage from "../pages/seller/ContractsPage";

// Partner pages
import PropertyStreamPage from "../pages/partner/PropertyStreamPage";
import ActiveDealsPage from "../pages/partner/ActiveDealsPage";
import MyBidsPage from "../pages/partner/MyBidsPage";
import ScorePage from "../pages/partner/ScorePage";
import PropertyDetailPage from "../pages/partner/PropertyDetailPage";
import SubmitBidPage from "../pages/partner/submit-bid";
import ProofOfActivityPage from "../pages/partner/ProofOfActivityPage";
import ProfilePage from "../pages/profile";

import ChatRoomsPage from "../pages/chat";
import ChatRoomPage from "../pages/chat/ChatRoomPage";

import {
  ADMIN_ROLES,
  ALL_APP_ROLES,
  PARTNER_ROLES,
  REALTOR_ROLES,
  SELLER_ROLES,
} from "../constants/roles";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public auth routes */}
      <Route element={<PublicRoute />}>
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/verify" element={<VerifyPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardRouter />}>
          {/* Common dashboard route for all roles */}
          <Route
            path="/dashboard"
            element={
              <RoleRoute allowedRoles={ALL_APP_ROLES}>
                <DashboardHome />
              </RoleRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={ALL_APP_ROLES}>
                <ProfilePage />
              </RoleRoute>
            }
          />
          {/* KYC route for app users */}
          <Route
            path="/kyc"
            element={
              <RoleRoute
                allowedRoles={[
                  ...ADMIN_ROLES,
                  ...SELLER_ROLES,
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                ]}
              >
                <KycPage />
              </RoleRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <RoleRoute
                allowedRoles={[
                  ...SELLER_ROLES,
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                ]}
              >
                <ChatRoomsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/chat/:roomId"
            element={
              <RoleRoute
                allowedRoles={[
                  ...SELLER_ROLES,
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                ]}
              >
                <ChatRoomPage />
              </RoleRoute>
            }
          />
          <Route
            path="/proof-of-activity"
            element={
              <RoleRoute allowedRoles={PARTNER_ROLES}>
                <ProofOfActivityPage />
              </RoleRoute>
            }
          />


          {/* Seller-only routes */}
          <Route
            path="/list-property"
            element={
              <RoleRoute allowedRoles={SELLER_ROLES}>
                <ListPropertyPage />
              </RoleRoute>
            }
          />
          <Route
            path="/listings/:id"
            element={
              <RoleRoute allowedRoles={SELLER_ROLES}>
                <ListingDetailsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/listings/:id/edit"
            element={
              <RoleRoute allowedRoles={SELLER_ROLES}>
                <EditListingPage />
              </RoleRoute>
            }
          />

          <Route
            path="/document-vault"
            element={
              <RoleRoute allowedRoles={SELLER_ROLES}>
                <DocumentVaultPage />
              </RoleRoute>
            }
          />

          <Route
            path="/bids"
            element={
              <RoleRoute allowedRoles={SELLER_ROLES}>
                <ViewBidsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/contracts"
            element={
              <RoleRoute allowedRoles={SELLER_ROLES}>
                <ContractsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/deal-tracker"
            element={
              <RoleRoute allowedRoles={SELLER_ROLES}>
                <DealTrackerPage />
              </RoleRoute>
            }
          />


          {/* Partner/Realtor/Admin shared routes */}
          <Route
            path="/properties"
            element={
              <RoleRoute
                allowedRoles={[
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                  ...ADMIN_ROLES,
                ]}
              >
                <PropertyStreamPage />
              </RoleRoute>
            }
          />

          <Route
            path="/properties/:id"
            element={
              <RoleRoute
                allowedRoles={[
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                  ...ADMIN_ROLES,
                ]}
              >
                <PropertyDetailPage />
              </RoleRoute>
            }
          />

          <Route
            path="/properties/:id/bid"
            element={
              <RoleRoute allowedRoles={PARTNER_ROLES}>
                <SubmitBidPage />
              </RoleRoute>
            }
          />

          <Route
            path="/my-bids"
            element={
              <RoleRoute
                allowedRoles={[
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                  ...ADMIN_ROLES,
                ]}
              >
                <MyBidsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/deals"
            element={
              <RoleRoute
                allowedRoles={[
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                  ...ADMIN_ROLES,
                ]}
              >
                <ActiveDealsPage />
              </RoleRoute>
            }
          />

          {/* Partner-only routes */}
          <Route
            path="/score"
            element={
              <RoleRoute allowedRoles={PARTNER_ROLES}>
                <ScorePage />
              </RoleRoute>
            }
          />

          {/* Realtor-only routes */}
          {/* <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={REALTOR_ROLES}>
                <PlaceholderPage
                  title="Profile Setup"
                  description="Realtor profile setup and verification flow."
                />
              </RoleRoute>
            }
          /> */}

          {/* Admin-only routes */}
          <Route
            path="/states"
            element={
              <RoleRoute allowedRoles={ADMIN_ROLES}>
                <PlaceholderPage
                  title="State Firewall"
                  description="Admin can manage state-level access rules here."
                />
              </RoleRoute>
            }
          />

          <Route
            path="/users"
            element={
              <RoleRoute allowedRoles={ADMIN_ROLES}>
                <PlaceholderPage
                  title="Users"
                  description="Admin user management screen."
                />
              </RoleRoute>
            }
          />

          <Route
            path="/verifications"
            element={
              <RoleRoute allowedRoles={ADMIN_ROLES}>
                <PlaceholderPage
                  title="Verifications"
                  description="Admin verification review screen."
                />
              </RoleRoute>
            }
          />

          <Route
            path="/chat-flags"
            element={
              <RoleRoute allowedRoles={ADMIN_ROLES}>
                <PlaceholderPage
                  title="Chat Flags"
                  description="Admin can review flagged chat activity here."
                />
              </RoleRoute>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;