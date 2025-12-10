import { useState } from "react";
import { Plus, Leaf, Flame, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MenuItem, Addon, CartItem } from "@shared/schema";
import { OrderCustomizationModal } from "./order-customization-modal";
import { motion } from "framer-motion";

interface MenuItemCardProps {
  item: MenuItem;
  addons?: Addon[];
  onAddToCart: (cartItem: CartItem) => void;
}

export function MenuItemCard({ item, addons = [], onAddToCart }: MenuItemCardProps) {
  const [showCustomization, setShowCustomization] = useState(false);

  const handleQuickAdd = () => {
    const basePrice = parseFloat(item.price);
    const cartItem: CartItem = {
      menuItem: item,
      quantity: 1,
      spiceLevel: 0,
      selectedAddons: [],
      specialInstructions: "",
      totalPrice: basePrice,
    };
    onAddToCart(cartItem);
  };

  const handleCustomizedAdd = (cartItem: CartItem) => {
    onAddToCart(cartItem);
    setShowCustomization(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn(
          "glass-card overflow-visible transition-all duration-300",
          !item.isAvailable && "opacity-50"
        )}>
          <CardContent className="p-0">
            <div className="flex gap-4 p-4">
              {/* Item Image */}
              <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <span className="text-3xl text-primary/40">
                      <Flame className="w-8 h-8" />
                    </span>
                  </div>
                )}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">Unavailable</span>
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                  <span className="font-bold text-primary shrink-0">${parseFloat(item.price).toFixed(2)}</span>
                </div>

                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {item.isVegetarian && (
                    <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      <Leaf className="w-3 h-3 mr-1" />
                      Veg
                    </Badge>
                  )}
                  {item.isVegan && (
                    <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                      <Leaf className="w-3 h-3 mr-1" />
                      Vegan
                    </Badge>
                  )}
                  {item.isSpicy && (
                    <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-400 border-red-500/20">
                      <Flame className="w-3 h-3 mr-1" />
                      Spicy
                    </Badge>
                  )}
                  {item.preparationTime && (
                    <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.preparationTime}m
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCustomization(true)}
                    disabled={!item.isAvailable}
                    className="flex-1"
                    data-testid={`button-customize-${item.id}`}
                  >
                    Customize
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleQuickAdd}
                    disabled={!item.isAvailable}
                    className="shrink-0"
                    data-testid={`button-add-${item.id}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <OrderCustomizationModal
        item={item}
        addons={addons}
        open={showCustomization}
        onClose={() => setShowCustomization(false)}
        onAdd={handleCustomizedAdd}
      />
    </>
  );
}

export function MenuItemCardSkeleton() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          <div className="w-24 h-24 rounded-lg shimmer shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-32 shimmer rounded" />
              <div className="h-5 w-16 shimmer rounded" />
            </div>
            <div className="h-4 w-full shimmer rounded" />
            <div className="h-4 w-2/3 shimmer rounded" />
            <div className="flex gap-2">
              <div className="h-8 flex-1 shimmer rounded" />
              <div className="h-8 w-8 shimmer rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
