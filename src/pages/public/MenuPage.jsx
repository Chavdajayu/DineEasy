import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UtensilsCrossed, ChevronRight, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMenu } from "@/hooks/useMenu";
import { useCart } from "@/providers/CartProvider";
import { useSession } from "@/providers/SessionProvider";
import { useCafe } from "@/providers/CafeProvider";
import { getOrCreateSession } from "@/lib/firestore";
import MenuItemCard from "@/components/menu-item-card";
import CartDrawer from "@/components/cart-drawer";

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cafeSlug } = useParams();
  const { cafeId, cafeInfo } = useCafe();
  const { items, categories, loading, error } = useMenu(cafeId);
  const { totalItems, addItem, setTableId: setCartTableId } = useCart();
  const { session, setSession } = useSession();
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionLoading, setSessionLoading] = useState(true);

  const tableNumber = searchParams.get("table");
  const tableId = searchParams.get("id");

  useEffect(() => {
    if (tableId) {
      setCartTableId(tableId);
    }
  }, [tableId, setCartTableId]);

  useEffect(() => {
    async function initSession() {
      if (!cafeId || !tableNumber || !tableId) {
        setSessionLoading(false);
        return;
      }
      try {
        const activeSession = await getOrCreateSession(cafeId, tableNumber, tableId);
        setSession(activeSession);
      } catch (err) {
        console.error("Session initialization failed:", err);
      } finally {
        setSessionLoading(false);
      }
    }
    
    // Only init if session is missing or different table
    if (!session || session.tableId !== tableId) {
      initSession();
    } else {
      setSessionLoading(false);
    }
  }, [cafeId, tableNumber, tableId, session, setSession]);

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (sessionLoading || loading) {
    return <MenuSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
          <Info className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
        <p className="text-muted-foreground mb-8 max-w-xs">We couldn't load the menu. Please check your connection and try again.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
          Retry
        </Button>
      </div>
    );
  }

  if (!tableNumber || !tableId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-6">
          <Info className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Missing Table Information</h2>
        <p className="text-muted-foreground mb-8 max-w-xs">Please scan the QR code on your table to view the menu and place orders.</p>
        <Button onClick={() => navigate("/")} variant="outline" className="rounded-full">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-32 max-w-4xl mx-auto">
      <header className="mb-8 sticky top-0 z-30 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Table {tableNumber}</h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-none mt-1">
                {cafeInfo?.name || "DineEasy Café"}
              </p>
            </div>
          </div>
          <CartDrawer onCheckout={() => navigate(`/${cafeSlug}/checkout?table=${tableNumber}&id=${tableId}`)} />
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search our delicious menu..." 
            className="pl-11 h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          <Button
            variant={selectedCategory === "all" ? "default" : "secondary"}
            className="rounded-full px-6 h-10 whitespace-nowrap font-bold"
            onClick={() => setSelectedCategory("all")}
          >
            All Items
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "secondary"}
              className="rounded-full px-6 h-10 whitespace-nowrap font-bold"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <MenuItemCard item={item} onAddToCart={addItem} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No items found matching your search.</p>
        </div>
      )}

      {totalItems > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40 md:left-auto md:right-8 md:bottom-8">
          <Button 
            size="lg" 
            className="w-full md:w-auto rounded-2xl h-16 px-8 shadow-2xl shadow-primary/20 text-lg font-bold flex gap-4 animate-in fade-in slide-in-from-bottom-4"
            onClick={() => navigate(`/${cafeSlug}/checkout?table=${tableNumber}&id=${tableId}`)}
          >
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              {totalItems}
            </div>
            Go to Checkout
            <ChevronRight className="w-5 h-5 ml-auto" />
          </Button>
        </div>
      )}
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-muted" />
      </div>
      <div className="h-12 w-full bg-muted rounded-2xl" />
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 w-24 bg-muted rounded-full flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 w-full bg-muted rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
