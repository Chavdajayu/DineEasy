import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  ClipboardList,
  QrCode,
  LogOut,
  ChevronRight,
  DollarSign,
  Users,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { subscribeToOrders, fetchTables } from "@/lib/dataClient";
import { motion } from "framer-motion";

const navItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Orders", url: "/admin/orders", icon: ClipboardList },
  { title: "Tables", url: "/admin/tables", icon: QrCode },
];

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
            <h2 className="font-bold">DineEase</h2>
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

export default function AdminDashboardPage() {
  const [, navigate] = useLocation();
  const { isAdmin } = useSession();
  const [orders, setOrders] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);

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

  const { data: tables = [] } = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
  });

  const activeOrders = orders.filter((o) => !["served", "cancelled"].includes(o.status));
  const todayRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + parseFloat(o.total), 0);
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const pendingOrders = orders.filter((o) => o.status === "received").length;

  const stats = [
    { title: "Active Orders", value: activeOrders.length, icon: ClipboardList, color: "text-primary" },
    { title: "Today's Revenue", value: `$${todayRevenue.toFixed(2)}`, icon: DollarSign, color: "text-success" },
    { title: "Occupied Tables", value: `${occupiedTables}/${tables.length}`, icon: Users, color: "text-warning" },
    { title: "Pending", value: pendingOrders, icon: Clock, color: "text-orange-400" },
  ];

  const recentOrders = orders.slice(0, 5);

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
                <h1 className="font-bold text-lg">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Overview of your restaurant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {wsConnected && (
                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                  Live Updates
                </Badge>
              )}
              <Button variant="ghost" size="icon" data-testid="button-refresh">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className={cn("text-2xl font-bold mt-1", stat.color)} data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, "-")}`}>
                            {stat.value}
                          </p>
                        </div>
                        <div className={cn("w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center", stat.color)}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")} className="gap-1" data-testid="button-view-all-orders">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/30" data-testid={`order-row-${order.id}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">T{order.tableNumber}</span>
                          </div>
                          <div>
                            <p className="font-medium">Order #{order.id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">{order.items.length} items • ${parseFloat(order.total).toFixed(2)}</p>
                          </div>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
