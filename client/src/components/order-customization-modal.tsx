import { useState, useEffect } from "react";
import { Minus, Plus, Flame, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { MenuItem, Addon, CartItem } from "@shared/schema";

interface OrderCustomizationModalProps {
  item: MenuItem;
  addons: Addon[];
  open: boolean;
  onClose: () => void;
  onAdd: (cartItem: CartItem) => void;
}

const spiceLevels = [
  { value: 0, label: "No Spice", color: "bg-muted" },
  { value: 1, label: "Mild", color: "bg-green-500" },
  { value: 2, label: "Medium", color: "bg-yellow-500" },
  { value: 3, label: "Hot", color: "bg-orange-500" },
  { value: 4, label: "Extra Hot", color: "bg-red-500" },
];

export function OrderCustomizationModal({ item, addons, open, onClose, onAdd }: OrderCustomizationModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setSpiceLevel(0);
      setSelectedAddons([]);
      setSpecialInstructions("");
    }
  }, [open]);

  const basePrice = parseFloat(item.price);
  const addonsPrice = selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price), 0);
  const totalPrice = (basePrice + addonsPrice) * quantity;

  const handleAddonToggle = (addon: Addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleAdd = () => {
    const cartItem: CartItem = {
      menuItem: item,
      quantity,
      spiceLevel,
      selectedAddons,
      specialInstructions,
      totalPrice,
    };
    onAdd(cartItem);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="glass max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{item.name}</DialogTitle>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                data-testid="button-decrease-quantity"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-semibold w-8 text-center" data-testid="text-quantity">
                {quantity}
              </span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
                data-testid="button-increase-quantity"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Spice Level */}
          {item.isSpicy && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Spice Level
              </Label>
              <div className="flex gap-2">
                {spiceLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSpiceLevel(level.value)}
                    className={cn(
                      "flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all border",
                      spiceLevel === level.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-muted-foreground"
                    )}
                    data-testid={`button-spice-${level.value}`}
                  >
                    <div className={cn("w-3 h-3 rounded-full mx-auto mb-1", level.color)} />
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {addons.length > 0 && (
            <div className="space-y-3">
              <Label>Add-ons</Label>
              <div className="space-y-2">
                {addons.map((addon) => (
                  <div
                    key={addon.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                      selectedAddons.find((a) => a.id === addon.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground"
                    )}
                    onClick={() => addon.isAvailable && handleAddonToggle(addon)}
                    data-testid={`addon-${addon.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={!!selectedAddons.find((a) => a.id === addon.id)}
                        disabled={!addon.isAvailable}
                      />
                      <span className={cn(!addon.isAvailable && "text-muted-foreground")}>
                        {addon.name}
                      </span>
                    </div>
                    <span className="text-primary font-medium">
                      +${parseFloat(addon.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Any allergies or special requests?"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="resize-none"
              rows={3}
              data-testid="input-instructions"
            />
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Price</span>
              <span>${basePrice.toFixed(2)}</span>
            </div>
            {selectedAddons.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Add-ons</span>
                <span>+${addonsPrice.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity</span>
              <span>x{quantity}</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary" data-testid="text-total-price">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleAdd} data-testid="button-add-to-cart">
            Add to Cart - ${totalPrice.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
