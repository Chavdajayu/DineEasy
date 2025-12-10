import { ShoppingCart, Minus, Plus, Trash2, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  onCheckout: () => void;
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalItems, subtotal, tax, total, clearCart } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="relative"
          data-testid="button-cart"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground"
              data-testid="badge-cart-count"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="glass w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Cart
            {totalItems > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingCart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-sm">
              Add items from the menu to get started
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={`${item.menuItem.id}-${index}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                    className="py-4 border-b border-border last:border-0"
                    data-testid={`cart-item-${index}`}
                  >
                    <div className="flex gap-3">
                      {/* Item Image */}
                      <div className="w-16 h-16 rounded-lg bg-muted shrink-0 overflow-hidden">
                        {item.menuItem.image ? (
                          <img
                            src={item.menuItem.image}
                            alt={item.menuItem.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="text-primary/40 text-2xl">
                              {item.menuItem.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm truncate">{item.menuItem.name}</h4>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-muted-foreground"
                            onClick={() => removeItem(index)}
                            data-testid={`button-remove-${index}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Customizations */}
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          {item.spiceLevel > 0 && (
                            <p>Spice: Level {item.spiceLevel}</p>
                          )}
                          {item.selectedAddons.length > 0 && (
                            <p>
                              Add-ons: {item.selectedAddons.map((a) => a.name).join(", ")}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p className="italic">"{item.specialInstructions}"</p>
                          )}
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              data-testid={`button-decrease-${index}`}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              data-testid={`button-increase-${index}`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="font-semibold text-primary">
                            ${item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>

            {/* Price Summary */}
            <div className="border-t border-border pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary" data-testid="text-cart-total">${total.toFixed(2)}</span>
              </div>
            </div>

            <SheetFooter className="mt-4 flex-col gap-2 sm:flex-col">
              <Button
                className="w-full"
                size="lg"
                onClick={onCheckout}
                data-testid="button-checkout"
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
                data-testid="button-clear-cart"
              >
                Clear Cart
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function FloatingCartButton({ onClick }: { onClick: () => void }) {
  const { totalItems, total } = useCart();

  if (totalItems === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 left-4 right-4 z-50 md:left-auto md:right-6 md:w-auto"
    >
      <Button
        size="lg"
        className="w-full md:w-auto gap-4 shadow-lg"
        onClick={onClick}
        data-testid="button-floating-cart"
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <Badge variant="secondary" className="bg-primary-foreground/20">
            {totalItems}
          </Badge>
        </div>
        <span>View Cart - ${total.toFixed(2)}</span>
      </Button>
    </motion.div>
  );
}
