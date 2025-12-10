import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Smartphone, Wallet, Check, Loader2, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/lib/cart-context";
import { useSession } from "@/lib/session-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type PaymentMethod = "card" | "upi" | "wallet";

const paymentMethods = [
  { id: "card" as const, label: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, Amex" },
  { id: "upi" as const, label: "UPI", icon: Smartphone, description: "Google Pay, PhonePe, Paytm" },
  { id: "wallet" as const, label: "Digital Wallet", icon: Wallet, description: "Apple Pay, Google Pay" },
];

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { items, subtotal, tax, total, clearCart } = useCart();
  const { tableNumber, tableId, sessionId } = useSession();
  const { toast } = useToast();

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [step, setStep] = useState<"review" | "payment" | "success">("review");

  const createOrderMutation = useMutation({
    mutationFn: async (data: {
      tableId: string;
      tableNumber: number;
      sessionId: string;
      subtotal: string;
      tax: string;
      total: string;
      specialInstructions: string;
      paymentMethod: string;
      items: Array<{
        menuItemId: string;
        menuItemName: string;
        quantity: number;
        unitPrice: string;
        totalPrice: string;
        spiceLevel: number;
        selectedAddons: Array<{ id: string; name: string; price: string }>;
        specialInstructions: string;
      }>;
    }) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: (order) => {
      setStep("success");
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order placed successfully!",
        description: "Your order has been sent to the kitchen.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = () => {
    if (!tableId || !tableNumber || !sessionId) {
      toast({
        title: "Session not found",
        description: "Please scan the QR code again to start a new session.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      tableId,
      tableNumber,
      sessionId,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      specialInstructions,
      paymentMethod,
      items: items.map((item) => ({
        menuItemId: item.menuItem.id,
        menuItemName: item.menuItem.name,
        quantity: item.quantity,
        unitPrice: item.menuItem.price,
        totalPrice: item.totalPrice.toFixed(2),
        spiceLevel: item.spiceLevel,
        selectedAddons: item.selectedAddons.map((addon) => ({
          id: addon.id,
          name: addon.name,
          price: addon.price,
        })),
        specialInstructions: item.specialInstructions,
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add items from the menu to checkout</p>
          <Button onClick={() => navigate("/menu")} data-testid="button-back-to-menu">
            Back to Menu
          </Button>
        </motion.div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-12 h-12 text-success" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
          <p className="text-muted-foreground mb-8">
            Your order has been sent to the kitchen. We'll start preparing it right away.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate("/order-status")}
              data-testid="button-track-order"
            >
              Track Your Order
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/menu")}
              data-testid="button-order-more"
            >
              Order More Items
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => step === "review" ? navigate("/menu") : setStep("review")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">Checkout</h1>
              <p className="text-sm text-muted-foreground">
                {step === "review" ? "Review your order" : "Select payment method"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {step === "review" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Order Items */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between gap-4" data-testid={`checkout-item-${index}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.quantity}x</span>
                        <span className="truncate">{item.menuItem.name}</span>
                      </div>
                      {(item.selectedAddons.length > 0 || item.spiceLevel > 0) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.spiceLevel > 0 && `Spice Lvl ${item.spiceLevel}`}
                          {item.spiceLevel > 0 && item.selectedAddons.length > 0 && " • "}
                          {item.selectedAddons.map((a) => a.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0">${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary" data-testid="text-checkout-total">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any allergies or special requests for the kitchen?"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="resize-none"
                  rows={3}
                  data-testid="input-special-instructions"
                />
              </CardContent>
            </Card>

            <Button
              className="w-full"
              size="lg"
              onClick={() => setStep("payment")}
              data-testid="button-continue-payment"
            >
              Continue to Payment
            </Button>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Payment Methods */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                        paymentMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      )}
                      onClick={() => setPaymentMethod(method.id)}
                      data-testid={`payment-method-${method.id}`}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <method.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="font-medium cursor-pointer">
                          {method.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Total */}
            <Card className="glass-card">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total to Pay</span>
                  <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={createOrderMutation.isPending}
              data-testid="button-place-order"
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>Place Order - ${total.toFixed(2)}</>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By placing this order, you agree to our terms of service
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
