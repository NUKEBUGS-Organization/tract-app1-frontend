import { Routes, Route, Navigate } from "react-router";
import EntryPage from "./pages/EntryPage";
import SellerDashboard from "./pages/seller/SellerDashboard";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import RealtorDashboard from "./pages/realtor/RealtorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/entry" replace />} />
      <Route path="/entry" element={<EntryPage />} />

      <Route path="/seller/dashboard" element={<SellerDashboard />} />
      <Route path="/partner/dashboard" element={<PartnerDashboard />} />
      <Route path="/realtor/dashboard" element={<RealtorDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;