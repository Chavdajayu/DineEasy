import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useTables } from "@/hooks/useTables";
import { useCafe } from "@/providers/CafeProvider";
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  UtensilsCrossed,
  Database,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { seedDatabase } from "../../../scripts/seedData";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { cafeId, cafeSlug } = useCafe();
  const { orders, loading: ordersLoading, error: ordersError } = useOrders(cafeId);
  const { tables, loading: tablesLoading, error: tablesError } = useTables(cafeId);
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    if (!cafeId) {
      toast({
        title: "Error",
        description: "No cafe context found. Please ensure you are logged in for a specific cafe.",
        variant: "destructive",
      });
      return;
    }

    setSeeding(true);
    try {
      await seedDatabase(cafeId);
      toast({
        title: "Success",
        description: "Mock data seeded successfully for this cafe!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to seed data: " + err.message,
        variant: "destructive",
      });
    } finally {
      setSeeding(false);
    }
  };

  const activeOrders = orders.filter(o => o.status !== "served" && o.status !== "cancelled");
  const pendingOrders = orders.filter(o => o.status === "pending");
  const todayOrders = orders.filter(o => {
    const today = new Date();
    return o.createdAt.toDateString() === today.toDateString();
  });
  
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const occupiedTables = tables.filter(t => t.status === "occupied").length;

  if (ordersLoading || tablesLoading) return <DashboardSkeleton />;

  if (ordersError || tablesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
          <TrendingUp className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mb-8 max-w-xs">We couldn't retrieve the latest data. Please check your connection.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <Button 
          onClick={handleSeed} 
          disabled={seeding}
          variant="outline"
          className="rounded-2xl h-12 px-6 font-bold border-primary/20 hover:bg-primary/5"
        >
          {seeding ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Database className="w-4 h-4 mr-2" />
          )}
          Seed Mock Data
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<ShoppingBag className="w-5 h-5 text-blue-400" />}
          label="Active Orders"
          value={activeOrders.length}
          trend="+4 since last hour"
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          label="Today's Revenue"
          value={`₹${Number(todayRevenue || 0).toFixed(0)}`}
          trend="+12% vs yesterday"
        />
        <StatCard 
          icon={<Users className="w-5 h-5 text-purple-400" />}
          label="Occupied Tables"
          value={`${occupiedTables}/${tables.length}`}
          trend="Peak time: 1:00 PM"
        />
        <StatCard 
          icon={<Clock className="w-5 h-5 text-orange-400" />}
          label="Pending Orders"
          value={pendingOrders.length}
          trend="Avg wait: 12m"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 p-8 rounded-[2.5rem] border-none bg-card/50 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Button variant="ghost" className="font-bold text-primary rounded-xl" asChild>
              <Link to={`/${cafeSlug}/admin/orders`}>View All <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>

          <div className="space-y-6">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-lg font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {order.tableNumber}
                  </div>
                  <div>
                    <p className="font-bold">Table {order.tableNumber}</p>
                    <p className="text-xs text-muted-foreground">{format(order.createdAt, "h:mm a")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{Number(order.total || 0).toFixed(2)}</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    order.status === "pending" ? "text-orange-400" : 
                    order.status === "cooking" ? "text-blue-400" : 
                    "text-emerald-400"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">No orders yet today.</div>
            )}
          </div>
        </Card>

        {/* Quick Stats/Actions */}
        <div className="space-y-8">
          <Card className="p-8 rounded-[2.5rem] border-none bg-primary text-primary-foreground shadow-2xl shadow-primary/20 overflow-hidden relative group">
            <UtensilsCrossed className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            <h3 className="text-xl font-bold mb-2">Peak Hours</h3>
            <p className="text-primary-foreground/80 text-sm mb-6 leading-relaxed">Most orders usually come between 12 PM and 3 PM.</p>
            <Button variant="secondary" className="w-full rounded-2xl font-bold h-12">View Analytics</Button>
          </Card>

          <Card className="p-8 rounded-[2.5rem] border-none bg-card/50 backdrop-blur-xl">
            <h3 className="text-xl font-bold mb-6">Staff Note</h3>
            <div className="p-4 rounded-2xl bg-muted/30 text-sm italic text-muted-foreground border-l-4 border-primary">
              "Remember to check table 4's QR code, it might be damaged."
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }) {
  return (
    <Card className="p-6 rounded-[2rem] border-none bg-card/50 backdrop-blur-xl group hover:bg-card transition-colors">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center transition-transform group-hover:scale-110">
          {icon}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </div>
      <p className="text-[10px] font-bold text-muted-foreground/60">{trend}</p>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-xl" />
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-[2rem]" />)}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 h-96 bg-muted rounded-[2.5rem]" />
        <div className="h-96 bg-muted rounded-[2.5rem]" />
      </div>
    </div>
  );
}
