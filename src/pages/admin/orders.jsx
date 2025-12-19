import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  ClipboardList,
  QrCode,
  LogOut,
  RefreshCw,
  Filter,
  Clock,
  ChefHat,
  Flame,
  Bell,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { OrderStatusBadge } from "@/components/order-status-tracker.jsx";
import { useSession } from "@/lib/session-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { updateOrderStatus, subscribeToOrders } from "@/lib/dataClient";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Orders", url: "/admin/orders", icon: ClipboardList },
  { title: "Tables", url: "/admin/tables", icon: QrCode },
];

const statusFlow = ["received", "preparing", "cooking", "ready", "served"];

const statusActions = {
  received: { next: "preparing", label: "Start Preparing", icon: ChefHat },
  preparing: { next: "cooking", label: "Start Cooking", icon: Flame },
  cooking: { next: "ready", label: "Mark Ready", icon: Bell },
  ready: { next: "served", label: "Mark Served", icon: UtensilsCrossed },
  served: { next: "served", label: "Completed", icon: UtensilsCrossed },
  cancelled: { next: "cancelled", label: "Cancelled", icon: X },
};

function AdminSidebar() {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const { setIsAdmin, clearSession } = useSession();

  const handleLogout = () => {
    setIsAdmin(false);
    clearSession();
    navigate("/admin/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold">DineFlow</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                    <a href={item.url} onClick={(e) => { e.preventDefault(); navigate(item.url); }}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout} data-testid="button-logout">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminOrdersPage() {
  const [, navigate] = useLocation();
  const { isAdmin } = useSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }

    const unsubscribe = subscribeToOrders((newOrders) => {
      setOrders(newOrders);
      setWsConnected(true);
    });

    return () => unsubscribe();
  }, [isAdmin, navigate]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast({ title: "Order status updated" });
    },
    onError: (error) => {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    },
  });

  const filteredOrders = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getTimeElapsed = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  if (!isAdmin) return null;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between gap-4 p-4 border-b border-border">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="font-bold text-lg">Orders</h1>
                <p className="text-sm text-muted-foreground">
                  {orders.filter((o) => !["served", "cancelled"].includes(o.status)).length} active orders
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {wsConnected && (
                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                  Live
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2" data-testid="button-filter">
                    <Filter className="w-4 h-4" />
                    {statusFilter === "all" ? "All" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Orders</DropdownMenuItem>
                  {statusFlow.map((status) => (
                    <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" data-testid="button-refresh">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </header>

          <ScrollArea className="flex-1">
            <main className="p-6">
              {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ClipboardList className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No orders</h3>
                  <p className="text-muted-foreground">
                    {statusFilter === "all" ? "Orders will appear here" : `No ${statusFilter} orders`}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.map((order, index) => {
                      const action = statusActions[order.status];
                      const canProgress = order.status !== "served" && order.status !== "cancelled";

                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          layout
                        >
                          <Card
                            className={cn("glass-card overflow-visible", order.status === "received" && "animate-pulse-glow")}
                            data-testid={`order-card-${order.id}`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <span className="font-bold text-primary text-lg">T{order.tableNumber}</span>
                                  </div>
                                  <div>
                                    <CardTitle className="text-base">#{order.id.slice(-6).toUpperCase()}</CardTitle>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      {formatTime(order.createdAt)} • {getTimeElapsed(order.createdAt)}
                                    </div>
                                  </div>
                                </div>
                                <OrderStatusBadge status={order.status} />
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                              <Separator />
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <div className="flex items-start gap-2 flex-1 min-w-0">
                                      <span className="text-muted-foreground shrink-0">{item.quantity}x</span>
                                      <div className="min-w-0">
                                        <span className="truncate block">{item.menuItemName}</span>
                                        {(item.spiceLevel && item.spiceLevel > 0) || item.specialInstructions ? (
                                          <p className="text-xs text-muted-foreground truncate">
                                            {item.spiceLevel && item.spiceLevel > 0 && `Spice: ${item.spiceLevel}`}
                                            {item.spiceLevel && item.spiceLevel > 0 && item.specialInstructions && " • "}
                                            {item.specialInstructions}
                                          </p>
                                        ) : null}
                                      </div>
                                    </div>
                                    <span className="shrink-0 ml-2">${parseFloat(item.totalPrice).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>

                              {order.specialInstructions && (
                                <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
                                  <p className="text-xs text-warning">Note: {order.specialInstructions}</p>
                                </div>
                              )}

                              <Separator />

                              <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span className="text-primary">${parseFloat(order.total).toFixed(2)}</span>
                              </div>

                              {canProgress && (
                                <Button
                                  className="w-full gap-2"
                                  onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: action.next })}
                                  disabled={updateStatusMutation.isPending}
                                  data-testid={`button-progress-${order.id}`}
                                >
                                  <action.icon className="w-4 h-4" />
                                  {action.label}
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </main>
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}
