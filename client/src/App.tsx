import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart-context";
import { SessionProvider } from "@/lib/session-context";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import MenuPage from "@/pages/menu";
import CheckoutPage from "@/pages/checkout";
import OrderStatusPage from "@/pages/order-status";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminOrdersPage from "@/pages/admin/orders";
import AdminTablesPage from "@/pages/admin/tables";

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
