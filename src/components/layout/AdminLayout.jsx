import { Navigate, Outlet, Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCafe } from "@/providers/CafeProvider";
import { useState, useEffect } from "react";
import { getCafeByAdminUid } from "@/lib/firestore";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Table2, 
  LogOut, 
  UtensilsCrossed 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const { user, loading: authLoading, logout } = useAuth();
  const { cafeInfo, cafeSlug, loading: cafeLoading } = useCafe();
  const location = useLocation();
  const [adminCafe, setAdminCafe] = useState(null);
  const [resolvingCafe, setResolvingCafe] = useState(true);

  useEffect(() => {
    async function resolveAdminCafe() {
      if (user) {
        const cafe = await getCafeByAdminUid(user.uid);
        setAdminCafe(cafe);
      }
      setResolvingCafe(false);
    }
    resolveAdminCafe();
  }, [user]);

  if (authLoading || cafeLoading || resolvingCafe) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // 1. If not logged in, redirect to the central login page
  if (!user) return <Navigate to="/login" replace />;

  // 2. Security: If user is logged in but has no cafe linked
  if (!adminCafe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">This account is not linked to any cafe.</p>
        <Button onClick={() => logout()}>Logout</Button>
      </div>
    );
  }

  // 3. Security: If admin tries to access another cafe's slug manually, redirect to their own cafe
  if (adminCafe.slug !== cafeSlug) {
    return <Navigate to={`/${adminCafe.slug}/admin/dashboard`} replace />;
  }

  // 4. Validation: Cafe must be active
  if (!adminCafe.active) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Cafe Restricted</h1>
        <p className="text-muted-foreground mb-6">This cafe has been temporarily disabled by the platform owner.</p>
        <Button onClick={() => logout()}>Logout</Button>
      </div>
    );
  }

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", path: `/${cafeSlug}/admin/dashboard` },
    { icon: <ShoppingBag className="w-5 h-5" />, label: "Orders", path: `/${cafeSlug}/admin/orders` },
    { icon: <Table2 className="w-5 h-5" />, label: "Tables", path: `/${cafeSlug}/admin/tables` },
    { icon: <UtensilsCrossed className="w-5 h-5" />, label: "Menu", path: `/${cafeSlug}/admin/menu` },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/30 backdrop-blur-xl flex flex-col hidden md:flex">
        <div className="p-8">
          <Link to={`/${cafeSlug}/admin`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight block">{cafeInfo?.name || "DineEasy"}</span>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold ${
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start rounded-2xl h-12 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 font-bold"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/50 bg-background/50 backdrop-blur-lg flex items-center justify-between px-8 md:hidden">
           <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            <span className="font-bold tracking-tight">DineEasy</span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
        
        {/* Mobile Nav */}
        <nav className="md:hidden h-16 border-t border-border/50 bg-background/80 backdrop-blur-lg flex items-center justify-around px-4 sticky bottom-0">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-2 rounded-xl transition-all ${
                location.pathname === item.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.icon}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
