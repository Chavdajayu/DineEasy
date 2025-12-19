import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Clock, Receipt, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrderStatusTracker, OrderStatusBadge } from "@/components/order-status-tracker.jsx";
import { useSession } from "@/lib/session-context";
import { cn } from "@/lib/utils";
import { fetchOrdersBySession } from "@/lib/dataClient";
import { motion } from "framer-motion";

export default function OrderStatusPage() {
  const [, navigate] = useLocation();
  const { sessionId, tableNumber } = useSession();
  const [wsConnected] = useState(false);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["ordersBySession", sessionId],
    queryFn: () => fetchOrdersBySession(sessionId),
    enabled: !!sessionId,
    refetchInterval: 10000,
  });

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getTimeElapsed = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Active Session</h2>
          <p className="text-muted-foreground mb-6">Please scan a table QR code to start ordering</p>
          <Button onClick={() => navigate("/")} data-testid="button-go-home">
            Go to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/menu")} data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold text-lg">Your Orders</h1>
                {tableNumber && (
                  <Badge variant="secondary" className="text-xs">
                    Table {tableNumber}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {wsConnected && (
                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                  Live
                </Badge>
              )}
              <Button variant="ghost" size="icon" onClick={() => refetch()} data-testid="button-refresh">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="h-6 w-32 shimmer rounded" />
                      <div className="h-6 w-20 shimmer rounded" />
                    </div>
                    <div className="h-16 shimmer rounded" />
                    <div className="h-20 shimmer rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Receipt className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Your orders will appear here once placed</p>
            <Button onClick={() => navigate("/menu")} data-testid="button-browse-menu">
              Browse Menu
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className={cn("glass-card overflow-visible", order.status === "received" && "animate-pulse-glow")} data-testid={`order-card-${order.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">Order #{order.id.slice(-6).toUpperCase()}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(order.createdAt)}</span>
                          <span>•</span>
                          <span>{getTimeElapsed(order.createdAt)}</span>
                        </div>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {order.status !== "cancelled" && <OrderStatusTracker status={order.status} compact />}

                    <Separator />

                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{item.quantity}x</span>
                            <span>{item.menuItemName}</span>
                          </div>
                          <span>${parseFloat(item.totalPrice).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-primary">${parseFloat(order.total).toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment</span>
                      <Badge
                        variant="outline"
                        className={cn(order.paymentStatus === "paid" ? "bg-success/10 text-success border-success/30" : "bg-warning/10 text-warning border-warning/30")}
                      >
                        {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
