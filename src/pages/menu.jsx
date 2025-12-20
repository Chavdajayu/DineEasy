import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Search, Filter, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MenuItemCard, MenuItemCardSkeleton } from "@/components/menu-item-card.jsx";
import { CartDrawer } from "@/components/cart-drawer.jsx";
import { useCart } from "@/lib/cart-context";
import { useSession, generateSessionId } from "@/lib/session-context";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { fetchCategories, fetchMenuItems, fetchAddons } from "@/lib/dataClient";

export default function MenuPage() {
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const { tableNumber, setTableInfo } = useSession();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const urlTableNumber = params.get("table");
    const urlTableId = params.get("id");
    if (urlTableNumber && urlTableId) {
      const tableNum = parseInt(urlTableNumber, 10);
      if (!isNaN(tableNum) && tableNum !== tableNumber) {
        setTableInfo(tableNum, urlTableId, generateSessionId());
      }
    }
  }, [searchParams, tableNumber, setTableInfo]);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ["menuItems"],
    queryFn: fetchMenuItems,
  });

  const { data: addons = [] } = useQuery({
    queryKey: ["addons"],
    queryFn: fetchAddons,
  });

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    let matchesFilter = true;
    if (filterType === "vegetarian") matchesFilter = item.isVegetarian;
    else if (filterType === "vegan") matchesFilter = item.isVegan;
    else if (filterType === "spicy") matchesFilter = item.isSpicy;
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const handleAddToCart = (cartItem) => {
    addItem(cartItem);
    toast({
      title: "Added to cart",
      description: `${cartItem.quantity}x ${cartItem.menuItem.name}`,
    });
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const getAddonsForItem = (itemId) => {
    return addons.filter((addon) => addon.menuItemId === itemId);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div> */}
            <div className="rounded-2xl bg-[#121212] from-primary to-primary/60 flex items-center justify-center mx-auto shadow-lg shadow-primary/20 w-12 h-12 ">
            <img src="/favicon.png" alt="DineEase Logo" className="w-full h-full" />
          </div>

              <div>
                <h1 className="font-bold text-lg">DineEase</h1>
                {tableNumber && (
                  <Badge variant="secondary" className="text-xs" data-testid="badge-table-number">
                    Table {tableNumber}
                  </Badge>
                )}
              </div>
            </div>
            <CartDrawer onCheckout={handleCheckout} />
          </div>

          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" data-testid="button-filter">
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterType("all")}>All Items</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("vegetarian")}>Vegetarian</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("vegan")}>Vegan</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("spicy")}>Spicy</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="sticky top-[129px] z-30 bg-background/95 backdrop-blur border-b border-border/50">
        <ScrollArea className="w-full">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="shrink-0"
                data-testid="button-category-all"
              >
                All
              </Button>
              {categoriesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 w-20 shimmer rounded-md shrink-0" />
                ))
              ) : (
                categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="shrink-0"
                    data-testid={`button-category-${category.id}`}
                  >
                    {category.name}
                  </Button>
                ))
              )}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {filterType !== "all" && (
        <div className="container mx-auto px-4 pt-4">
          <Badge variant="secondary" className="gap-1">
            Filter: {filterType}
            <button onClick={() => setFilterType("all")} className="ml-1 hover:text-foreground">
              ×
            </button>
          </Badge>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        {menuLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <MenuItemCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No items found</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              {searchQuery ? `No menu items match "${searchQuery}"` : "No menu items available in this category"}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} addons={getAddonsForItem(item.id)} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </main>

      <div className="h-24" />
    </div>
  );
}
