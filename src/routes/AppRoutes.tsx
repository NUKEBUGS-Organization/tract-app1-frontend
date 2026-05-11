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

import UnauthorizedPage from "../pages/common/UnauthorizedPage";
import PlaceholderPage from "../pages/common/PlaceholderPage";

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

      {/* Protected app layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardRouter />}>
          {/* Common dashboard route. Same route for all roles. UI changes by role. */}
          <Route
            path="/dashboard"
            element={
              <RoleRoute
                allowedRoles={[
                  "seller",
                  "wholesaler",
                  "partner",
                  "private_partner",
                  "realtor",
                  "licensed",
                  "licensed_partner",
                  "admin",
                ]}
              >
                <DashboardHome />
              </RoleRoute>
            }
          />

          {/* Seller-only routes */}
          <Route
            path="/list-property"
            element={
              <RoleRoute allowedRoles={["seller"]}>
                <PlaceholderPage
                  title="List Property"
                  description="Seller can list and manage property submissions here."
                />
              </RoleRoute>
            }
          />

          <Route
            path="/document-vault"
            element={
              <RoleRoute allowedRoles={["seller"]}>
                <PlaceholderPage
                  title="Document Vault"
                  description="Seller document upload and verification area."
                />
              </RoleRoute>
            }
          />

          <Route
            path="/bids"
            element={
              <RoleRoute allowedRoles={["seller"]}>
                <PlaceholderPage
                  title="View Bids"
                  description="Seller can view incoming bids here."
                />
              </RoleRoute>
            }
          />

          <Route
            path="/deal-tracker"
            element={
              <RoleRoute allowedRoles={["seller"]}>
                <PlaceholderPage
                  title="Deal Tracker"
                  description="Seller deal progress and status tracking."
                />
              </RoleRoute>
            }
          />

          {/* Partner/Realtor/Admin shared routes */}
          <Route
            path="/properties"
            element={
              <RoleRoute
                allowedRoles={[
                  "wholesaler",
                  "partner",
                  "private_partner",
                  "realtor",
                  "licensed",
                  "licensed_partner",
                  "admin",
                ]}
              >
                <PlaceholderPage
                  title="Properties"
                  description="Role-based property view will render here."
                />
              </RoleRoute>
            }
          />

          <Route
            path="/deals"
            element={
              <RoleRoute
                allowedRoles={[
                  "wholesaler",
                  "partner",
                  "private_partner",
                  "realtor",
                  "licensed",
                  "licensed_partner",
                  "admin",
                ]}
              >
                <PlaceholderPage
                  title="Deals"
                  description="Role-based deals view will render here."
                />
              </RoleRoute>
            }
          />

          {/* Partner-only routes */}
          <Route
            path="/score"
            element={
              <RoleRoute
                allowedRoles={["wholesaler", "partner", "private_partner"]}
              >
                <PlaceholderPage
                  title="Score"
                  description="Wholesaler score and performance metrics."
                />
              </RoleRoute>
            }
          />

          {/* Realtor-only routes */}
          <Route
            path="/profile"
            element={
              <RoleRoute
                allowedRoles={["realtor", "licensed", "licensed_partner"]}
              >
                <PlaceholderPage
                  title="Profile Setup"
                  description="Realtor profile setup and verification flow."
                />
              </RoleRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/states"
            element={
              <RoleRoute allowedRoles={["admin"]}>
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
              <RoleRoute allowedRoles={["admin"]}>
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
              <RoleRoute allowedRoles={["admin"]}>
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
              <RoleRoute allowedRoles={["admin"]}>
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