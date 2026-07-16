
import { Navigate, Route, Routes, useParams } from "react-router";

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
import ProfilePage from "../pages/profile";

import UnauthorizedPage from "../pages/common/UnauthorizedPage";
import PlaceholderPage from "../pages/common/PlaceholderPage";
import SupportPage from "../pages/common/SupportPage";

// Seller pages
import ListPropertyPage from "../pages/seller/ListPropertyPage";
import MyListingsPage from "../pages/seller/MyListingsPage";
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
import MyContractsPage from "../pages/partner/MyContractsPage";
import PropertyDetailPage from "../pages/partner/PropertyDetailPage";
import SubmitBidPage from "../pages/partner/submit-bid";
import ProofOfActivityPage from "../pages/partner/ProofOfActivityPage";

// Realtor pages
import RealtorActiveDealsPage from "../pages/realtor/ActiveDealsPage";
import RealtorMyOffersPage from "../pages/realtor/MyOffersPage";
import RealtorSubmitOfferPage from "../pages/realtor/SubmitOfferPage";

// Common chat pages
import ChatRoomsPage from "../pages/chat";
import ChatRoomPage from "../pages/chat/ChatRoomPage";

// Admin pages
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminUserDetailsPage from "../pages/admin/AdminUserDetailsPage";
import AdminVerificationPage from "../pages/admin/AdminVerificationPage";
import AdminVerificationDetailsPage from "../pages/admin/AdminVerificationDetailsPage";

import AdminListingsPage from "../pages/admin/AdminListingsPage";
import AdminListingDetailsPage from "../pages/admin/AdminListingDetailsPage";

import AdminBidsPage from "../pages/admin/AdminBidsPage";
import AdminBidDetailsPage from "../pages/admin/AdminBidDetailsPage";

import AdminContractsPage from "../pages/admin/AdminContractsPage";
import AdminContractDetailsPage from "../pages/admin/AdminContractDetailsPage";

import AdminDealsPage from "../pages/admin/AdminDealsPage";
import AdminDealDetailsPage from "../pages/admin/AdminDealDetailsPage";

import AdminChatFlagsPage from "../pages/admin/AdminChatFlagsPage";
import AdminChatRoomsPage from "../pages/admin/AdminChatRoomsPage";
import AdminRoomMessagesPage from "../pages/admin/AdminRoomMessagesPage";

import {
  ADMIN_ROLES,
  ALL_APP_ROLES,
  PARTNER_ROLES,
  REALTOR_ROLES,
  SELLER_ROLES,
} from "../constants/roles";

/*
 * Temporary redirects for old listing URLs.
 * Remove these after all links in seller/admin pages use /properties.
 */
function OldListingDetailsRedirect() {
  const { id = "" } = useParams();

  return <Navigate to={`/properties/${id}`} replace />;
}

function OldListingEditRedirect() {
  const { id = "" } = useParams();

  return <Navigate to={`/properties/${id}/edit`} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* =====================================================
          PUBLIC AUTH ROUTES
      ====================================================== */}

      <Route element={<PublicRoute />}>
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/verify" element={<VerifyPage />} />

        <Route
          path="/auth/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/auth/reset-password"
          element={<ResetPasswordPage />}
        />
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* =====================================================
          PROTECTED APPLICATION ROUTES
      ====================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardRouter />}>
          {/* =================================================
              COMMON DASHBOARD
          ================================================== */}

          <Route
            path="/dashboard"
            element={
              <RoleRoute allowedRoles={ALL_APP_ROLES}>
                <DashboardHome />
              </RoleRoute>
            }
          />

          {/* =================================================
              COMMON PROFILE / SUPPORT
          ================================================== */}

          <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={ALL_APP_ROLES}>
                <ProfilePage />
              </RoleRoute>
            }
          />

          <Route
            path="/support"
            element={
              <RoleRoute allowedRoles={ALL_APP_ROLES}>
                <SupportPage />
              </RoleRoute>
            }
          />

          {/* =================================================
              KYC
              Admin reviews KYC, so admin does not need the
              user KYC submission screen.
          ================================================== */}

          <Route
            path="/kyc"
            element={
              <RoleRoute
                allowedRoles={[
                  ...SELLER_ROLES,
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                ]}
              >
                <KycPage />
              </RoleRoute>
            }
          />

          {/* =================================================
              PARTNER-ONLY PROOF OF ACTIVITY
          ================================================== */}

          <Route
            path="/proof-of-activity"
            element={
              <RoleRoute allowedRoles={PARTNER_ROLES}>
                <ProofOfActivityPage />
              </RoleRoute>
            }
          />

          {/* =================================================
              SHARED PROPERTIES / LISTINGS ROUTES
          ================================================== */}

          <Route
            path="/properties"
            element={
              <RoleRoute
                allowedRoles={[
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                  ...ADMIN_ROLES,
                ]}
                roleContent={{
                  partner: <PropertyStreamPage />,
                  realtor: <PropertyStreamPage />,
                  admin: <AdminListingsPage />,
                }}
              />
            }
          />

          <Route
            path="/properties/:id"
            element={
              <RoleRoute
                allowedRoles={[
                  ...SELLER_ROLES,
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                  ...ADMIN_ROLES,
                ]}
                roleContent={{
                  seller: <ListingDetailsPage />,
                  partner: <PropertyDetailPage />,
                  realtor: <PropertyDetailPage />,
                  admin: <AdminListingDetailsPage />,
                }}
              />
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
            path="/properties/:id/offer"
            element={
              <RoleRoute allowedRoles={REALTOR_ROLES}>
                <RealtorSubmitOfferPage />
              </RoleRoute>
            }
          />

          {/* =================================================
              SELLER-ONLY LISTING ACTIONS
          ================================================== */}

          <Route
            path="/list-property"
            element={
              <RoleRoute allowedRoles={SELLER_ROLES}>
                <ListPropertyPage />
              </RoleRoute>
            }
          />

          <Route
            path="/my-listings"
            element={
              <RoleRoute allowedRoles={SELLER_ROLES}>
                <MyListingsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/properties/:id/edit"
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

          {/* =================================================
              SHARED BIDS ROUTES
          ================================================== */}

          <Route
            path="/bids"
            element={
              <RoleRoute
                allowedRoles={[
                  ...SELLER_ROLES,
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                  ...ADMIN_ROLES,
                ]}
                roleContent={{
                  seller: <ViewBidsPage />,
                  partner: <MyBidsPage />,
                  realtor: <RealtorMyOffersPage />,
                  admin: <AdminBidsPage />,
                }}
              />
            }
          />

          <Route
            path="/bids/:id"
            element={
              <RoleRoute
                allowedRoles={[
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                  ...ADMIN_ROLES,
                ]}
                roleContent={{
                  partner: (
                    <PlaceholderPage
                      title="Bid Details"
                      description="Wholesaler bid details."
                    />
                  ),

                  realtor: (
                    <PlaceholderPage
                      title="Bid Details"
                      description="Realtor bid details."
                    />
                  ),

                  admin: <AdminBidDetailsPage />,
                }}
              />
            }
          />

          <Route
            path="/my-bids"
            element={
              <RoleRoute
                allowedRoles={[...PARTNER_ROLES, ...REALTOR_ROLES]}
                roleContent={{
                  partner: <MyBidsPage />,
                  realtor: <RealtorMyOffersPage />,
                }}
              />
            }
          />

          {/* =================================================
              SHARED CONTRACTS ROUTES
          ================================================== */}

          <Route
            path="/contracts"
            element={
              <RoleRoute
                allowedRoles={[
                  ...SELLER_ROLES,
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                  ...ADMIN_ROLES,
                ]}
                roleContent={{
                  seller: <ContractsPage />,
                  partner: <MyContractsPage />,
                  realtor: (
                    <PlaceholderPage
                      title="Contracts"
                      description="Realtor contracts will render here."
                    />
                  ),
                  admin: <AdminContractsPage />,
                }}
              />
            }
          />

          <Route
            path="/contracts/:id"
            element={
              <RoleRoute
                allowedRoles={[
                  ...SELLER_ROLES,
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                  ...ADMIN_ROLES,
                ]}
                roleContent={{
                  seller: (
                    <PlaceholderPage
                      title="Contract Details"
                      description="Seller contract details."
                    />
                  ),

                  partner: (
                    <PlaceholderPage
                      title="Contract Details"
                      description="Wholesaler contract details."
                    />
                  ),

                  realtor: (
                    <PlaceholderPage
                      title="Contract Details"
                      description="Realtor contract details."
                    />
                  ),

                  admin: <AdminContractDetailsPage />,
                }}
              />
            }
          />

          <Route
            path="/my-contracts"
            element={
              <RoleRoute allowedRoles={PARTNER_ROLES}>
                <MyContractsPage />
              </RoleRoute>
            }
          />

          {/* =================================================
              SHARED DEALS ROUTES
          ================================================== */}

          <Route
            path="/deals"
            element={
              <RoleRoute
                allowedRoles={[
                  ...SELLER_ROLES,
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                  ...ADMIN_ROLES,
                ]}
                roleContent={{
                  seller: <DealTrackerPage />,
                  partner: <ActiveDealsPage />,
                  realtor: <RealtorActiveDealsPage />,
                  admin: <AdminDealsPage />,
                }}
              />
            }
          />

          <Route
            path="/deals/:id"
            element={
              <RoleRoute
                allowedRoles={[
                  ...SELLER_ROLES,
                  ...PARTNER_ROLES,
                  ...REALTOR_ROLES,
                  ...ADMIN_ROLES,
                ]}
                roleContent={{
                  seller: (
                    <PlaceholderPage
                      title="Deal Details"
                      description="Seller deal details."
                    />
                  ),

                  partner: (
                    <PlaceholderPage
                      title="Deal Details"
                      description="Wholesaler deal details."
                    />
                  ),

                  realtor: (
                    <PlaceholderPage
                      title="Deal Details"
                      description="Realtor deal details."
                    />
                  ),

                  admin: <AdminDealDetailsPage />,
                }}
              />
            }
          />

          <Route
            path="/realtor/deals"
            element={
              <RoleRoute allowedRoles={REALTOR_ROLES}>
                <RealtorActiveDealsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/realtor/my-offers"
            element={
              <RoleRoute allowedRoles={REALTOR_ROLES}>
                <RealtorMyOffersPage />
              </RoleRoute>
            }
          />

          {/* =================================================
              SHARED CHAT ROUTES
          ================================================== */}

          <Route
            path="/chat"
            element={
              <RoleRoute
                allowedRoles={ALL_APP_ROLES}
                roleContent={{
                  seller: <ChatRoomsPage />,
                  partner: <ChatRoomsPage />,
                  realtor: <ChatRoomsPage />,
                  admin: <AdminChatRoomsPage />,
                }}
              />
            }
          />

          <Route
            path="/chat/:roomId"
            element={
              <RoleRoute
                allowedRoles={ALL_APP_ROLES}
                roleContent={{
                  seller: <ChatRoomPage />,
                  partner: <ChatRoomPage />,
                  realtor: <ChatRoomPage />,
                  admin: <AdminRoomMessagesPage />,
                }}
              />
            }
          />

          {/* =================================================
              PARTNER-ONLY ROUTES
          ================================================== */}

          <Route
            path="/score"
            element={
              <RoleRoute allowedRoles={PARTNER_ROLES}>
                <PlaceholderPage
                  title="Score"
                  description="Wholesaler score and performance metrics."
                />
              </RoleRoute>
            }
          />

          {/* =================================================
              ADMIN-ONLY ROUTES
          ================================================== */}

          <Route
            path="/users"
            element={
              <RoleRoute allowedRoles={ADMIN_ROLES}>
                <AdminUsersPage />
              </RoleRoute>
            }
          />

          <Route
            path="/users/:id"
            element={
              <RoleRoute allowedRoles={ADMIN_ROLES}>
                <AdminUserDetailsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/verifications"
            element={
              <RoleRoute allowedRoles={ADMIN_ROLES}>
                <AdminVerificationPage />
              </RoleRoute>
            }
          />

          <Route
            path="/verifications/:id"
            element={
              <RoleRoute allowedRoles={ADMIN_ROLES}>
                <AdminVerificationDetailsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/chat-flags"
            element={
              <RoleRoute allowedRoles={ADMIN_ROLES}>
                <AdminChatFlagsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/states"
            element={
              <RoleRoute allowedRoles={ADMIN_ROLES}>
                <PlaceholderPage
                  title="State Firewall"
                  description="Backend API is not ready yet."
                />
              </RoleRoute>
            }
          />

          <Route
            path="/scores"
            element={
              <RoleRoute allowedRoles={ADMIN_ROLES}>
                <PlaceholderPage
                  title="Scores"
                  description="Backend API is not ready yet."
                />
              </RoleRoute>
            }
          />

          <Route
            path="/financials"
            element={
              <RoleRoute allowedRoles={ADMIN_ROLES}>
                <PlaceholderPage
                  title="Financials"
                  description="Backend API is not ready yet."
                />
              </RoleRoute>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <RoleRoute allowedRoles={ADMIN_ROLES}>
                <PlaceholderPage
                  title="Audit Logs"
                  description="Backend API is not ready yet."
                />
              </RoleRoute>
            }
          />

          {/* =================================================
              TEMPORARY OLD SELLER URL REDIRECTS
          ================================================== */}

          <Route
            path="/listings/:id"
            element={
              <RoleRoute allowedRoles={SELLER_ROLES}>
                <OldListingDetailsRedirect />
              </RoleRoute>
            }
          />

          <Route
            path="/listings/:id/edit"
            element={
              <RoleRoute allowedRoles={SELLER_ROLES}>
                <OldListingEditRedirect />
              </RoleRoute>
            }
          />

          <Route
            path="/deal-tracker"
            element={
              <RoleRoute allowedRoles={SELLER_ROLES}>
                <Navigate to="/deals" replace />
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