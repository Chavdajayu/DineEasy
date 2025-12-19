import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart-context.jsx";
import { SessionProvider } from "@/lib/session-context.jsx";
import NotFound from "@/pages/not-found.jsx";
import HomePage from "@/pages/home.jsx";
import MenuPage from "@/pages/menu.jsx";
import CheckoutPage from "@/pages/checkout.jsx";
import OrderStatusPage from "@/pages/order-status.jsx";
import AdminLoginPage from "@/pages/admin/login.jsx";
import AdminDashboardPage from "@/pages/admin/dashboard.jsx";
import AdminOrdersPage from "@/pages/admin/orders.jsx";
import AdminTablesPage from "@/pages/admin/tables.jsx";
import { useEffect } from "react";
import { initSeeds } from "@/lib/dataClient";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/menu" component={MenuPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/order-status" component={OrderStatusPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/admin/orders" component={AdminOrdersPage} />
      <Route path="/admin/tables" component={AdminTablesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    initSeeds();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SessionProvider>
          <CartProvider>
            <Toaster />
            <Router />
          </CartProvider>
        </SessionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
