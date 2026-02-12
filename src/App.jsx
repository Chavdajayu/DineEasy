import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { SessionProvider } from "@/providers/SessionProvider";
import { CafeProvider } from "@/providers/CafeProvider";
import AdminLayout from "@/components/layout/AdminLayout";
import PublicLayout from "@/components/layout/PublicLayout";

// Public Pages
import LandingPage from "@/pages/public/LandingPage";
import MenuPage from "@/pages/public/MenuPage";
import CheckoutPage from "@/pages/checkout/CheckoutPage";
import OrderSuccessPage from "@/pages/public/OrderSuccessPage";
import OrderStatusPage from "@/pages/public/OrderStatusPage";

// Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import OrdersPage from "@/pages/admin/OrdersPage";
import TablesPage from "@/pages/admin/TablesPage";
import MenuManagementPage from "@/pages/admin/MenuManagementPage";

// Owner Pages
import OwnerLogin from "@/pages/owner/OwnerLogin";
import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import SetupOwner from "@/pages/owner/SetupOwner";

import { Toaster } from "@/components/ui/toaster";

const CafeScope = () => (
  <CafeProvider>
    <SessionProvider>
      <CartProvider>
        <Outlet />
      </CartProvider>
    </SessionProvider>
  </CafeProvider>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Global Routes */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/login" element={<AdminLogin />} />
          
          {/* Owner Routes */}
          <Route path="/owner-login" element={<OwnerLogin />} />
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/setup-owner" element={<SetupOwner />} />

          {/* Cafe Scoped Routes */}
          <Route path="/:cafeSlug" element={<CafeScope />}>
            {/* Public Cafe Routes */}
            <Route path="menu" element={<PublicLayout><MenuPage /></PublicLayout>} />
            <Route path="checkout" element={<PublicLayout><CheckoutPage /></PublicLayout>} />
            <Route path="order-success" element={<PublicLayout><OrderSuccessPage /></PublicLayout>} />
            <Route path="orders" element={<PublicLayout><OrderStatusPage /></PublicLayout>} />

            {/* Protected Admin Routes */}
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="tables" element={<TablesPage />} />
              <Route path="menu" element={<MenuManagementPage />} />
            </Route>

            {/* Fallback for cafe scope */}
            <Route path="*" element={<Navigate to="menu" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
