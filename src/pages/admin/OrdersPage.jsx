import { useOrders } from "@/hooks/useOrders";
import { useCafe } from "@/providers/CafeProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  ChevronRight,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function OrdersPage() {
  const { cafeId } = useCafe();
  const { orders, loading, error, updateStatus } = useOrders(cafeId);
  const [filter, setFilter] = useState("all");

  const filteredOrders = orders.filter(o => 
    filter === "all" ? true : o.status === filter
  );

  const stats = {
    pending: orders.filter(o => o.status === "pending").length,
    cooking: orders.filter(o => o.status === "cooking").length,
    ready: orders.filter(o => o.status === "ready").length,
  };

  if (loading) return <OrdersSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Orders</h2>
        <p className="text-muted-foreground mb-8 max-w-xs">There was a problem connecting to the database. Please check your permissions.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Orders</h1>
          <p className="text-muted-foreground">Manage active customer orders and status updates.</p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="All" count={orders.length} />
          <FilterButton active={filter === "pending"} onClick={() => setFilter("pending")} label="Pending" count={stats.pending} color="text-orange-400" />
          <FilterButton active={filter === "cooking"} onClick={() => setFilter("cooking")} label="Cooking" count={stats.cooking} color="text-blue-400" />
          <FilterButton active={filter === "ready"} onClick={() => setFilter("ready")} label="Ready" count={stats.ready} color="text-emerald-400" />
        </div>
      </header>

      <div className="grid gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="p-0 overflow-hidden border-none bg-card/50 backdrop-blur-xl rounded-[2.5rem]">
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[2rem] bg-muted/50 flex items-center justify-center text-2xl font-bold text-primary">
                  {order.tableNumber}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-xl">Table {order.tableNumber}</h3>
                    <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border-none ${
                      order.status === "pending" ? "bg-orange-400/10 text-orange-400" :
                      order.status === "cooking" ? "bg-blue-400/10 text-blue-400" :
                      "bg-emerald-400/10 text-emerald-400"
                    }`}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {format(order.createdAt, "h:mm a")} • {order.items.length} items
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="mr-4 text-right">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Total</p>
                  <p className="font-bold text-xl">₹{Number(order.total || 0).toFixed(2)}</p>
                </div>

                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <Button 
                      className="rounded-2xl h-12 px-6 font-bold bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                      onClick={() => updateStatus(order.id, "cooking")}
                    >
                      <ChefHat className="w-4 h-4 mr-2" />
                      Start Cooking
                    </Button>
                  )}
                  {order.status === "cooking" && (
                    <Button 
                      className="rounded-2xl h-12 px-6 font-bold bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                      onClick={() => updateStatus(order.id, "ready")}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Ready
                    </Button>
                  )}
                  {order.status === "ready" && (
                    <Button 
                      className="rounded-2xl h-12 px-6 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                      onClick={() => updateStatus(order.id, "served")}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Mark Served
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-8 pb-8">
              <div className="bg-muted/30 rounded-[1.5rem] p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-xs font-bold text-primary">
                      {item.quantity}x
                    </div>
                    <div className="text-sm">
                      <p className="font-bold leading-none mb-1">{item.name}</p>
                      {item.selectedAddons?.length > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          {item.selectedAddons.map(a => a.name).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-20 bg-card/30 rounded-[2.5rem] border border-dashed border-border/50">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No {filter !== "all" ? filter : ""} orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label, count, color = "text-foreground" }) {
  return (
    <Button
      variant={active ? "default" : "secondary"}
      className={`rounded-full px-6 h-10 font-bold whitespace-nowrap transition-all ${
        active ? "shadow-lg shadow-primary/20" : "bg-card/50"
      }`}
      onClick={onClick}
    >
      <span className={active ? "text-primary-foreground" : color}>{label}</span>
      <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${
        active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}>
        {count}
      </span>
    </Button>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-muted rounded-xl" />
          <div className="h-4 w-64 bg-muted rounded-lg" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-24 bg-muted rounded-full" />)}
        </div>
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted rounded-[2.5rem]" />)}
      </div>
    </div>
  );
}
