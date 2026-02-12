import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CreditCard, Banknote, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/providers/CartProvider";
import { useSession } from "@/providers/SessionProvider";
import { useCafe } from "@/providers/CafeProvider";
import { placeOrder, getOrCreateSession } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cafeId, cafeSlug } = useCafe();
  const { cart, totalAmount, clearCart, setTableId } = useCart();
  const { session, setSession } = useSession();
  const { toast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [step, setStep] = useState("summary"); // "summary" or "payment"
  const [paymentMethod, setPaymentMethod] = useState("upi"); // Default to UPI as per image
  const [specialInstructions, setSpecialInstructions] = useState("");

  const tableNumber = searchParams.get("table");
  const tableId = searchParams.get("id");

  // Initialize session from URL if missing
  useEffect(() => {
    async function initSession() {
      if (!cafeId || !tableNumber || !tableId) return;
      try {
        const activeSession = await getOrCreateSession(cafeId, tableNumber, tableId);
        setSession(activeSession);
      } catch (err) {
        console.error("Session initialization failed in Checkout:", err);
      }
    }

    if (!session && tableNumber && tableId) {
      initSession();
    }
  }, [cafeId, tableNumber, tableId, session, setSession]);

  useEffect(() => {
    if (!session && !tableNumber) {
      navigate(`/${cafeSlug}/menu`);
      return;
    }

    // Set table ID to load cart if not already set
    if (session?.tableId) {
      setTableId(session.tableId);
    }
  }, [session, navigate, setTableId, cafeSlug, tableNumber]);

  // Separate check for cart to avoid redirecting before cart is loaded
  useEffect(() => {
    if (session && cart.length === 0 && !isPlacingOrder) {
      // Small delay to allow cart to load from Firestore if it hasn't yet
      const timer = setTimeout(() => {
        if (cart.length === 0) {
          navigate(`/${cafeSlug}/menu?table=${session.tableNumber}&id=${session.tableId}`);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cart.length, session, navigate, isPlacingOrder, cafeSlug]);

  const handlePlaceOrder = async () => {
    if (!session || !cafeId) return;
    
    setIsPlacingOrder(true);
    try {
      const orderData = {
        sessionId: session.id,
        tableId: session.tableId,
        tableNumber: session.tableNumber,
        items: cart,
        subtotal: totalAmount,
        tax: totalAmount * 0.05,
        total: totalAmount * 1.05,
        paymentMethod,
        specialInstructions,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      await placeOrder(cafeId, orderData);
      clearCart();
      navigate(`/${cafeSlug}/order-success`);
    } catch (error) {
      console.error("Order failed:", error);
      toast({
        title: "Order Failed",
        description: "Something went wrong while placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!session) return <CheckoutSkeleton />;

  const tax = totalAmount * 0.05;
  const finalTotal = totalAmount + tax;

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4">
      <header className="flex items-center gap-4 mb-8 pt-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-10 w-10 bg-muted/50" 
          onClick={() => step === "payment" ? setStep("summary") : navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-sm text-muted-foreground">
            {step === "summary" ? "Review your order" : "Select payment method"}
          </p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === "summary" ? (
          <motion.div
            key="summary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <section>
              <Card className="p-6 rounded-3xl border-none bg-card/50 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <span className="font-bold text-primary">{item.quantity}x</span>
                        <div>
                          <p className="font-bold text-sm">{item.menuItem?.name || item.name}</p>
                          {item.selectedAddons?.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {item.selectedAddons.map(a => a.name).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="font-bold text-sm">₹{(item.totalPrice || (item.price * item.quantity)).toFixed(2)}</p>
                    </div>
                  ))}
                  
                  <Separator className="my-4 opacity-50" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (5%)</span>
                      <span className="font-medium">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg pt-2">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-primary">₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            <section>
              <Card className="p-6 rounded-3xl border-none bg-card/50 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Special Instructions</h2>
                <textarea
                  className="w-full h-24 p-4 rounded-2xl bg-muted/50 border-none focus:ring-1 focus:ring-primary text-sm resize-none"
                  placeholder="Any allergies or special requests for the kitchen?"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </Card>
            </section>

            <Button 
              size="lg" 
              className="w-full rounded-2xl h-16 text-lg font-bold shadow-xl shadow-primary/20"
              onClick={() => setStep("payment")}
            >
              Continue to Payment
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <section>
              <Card className="p-6 rounded-3xl border-none bg-card/50 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <PaymentOption 
                    active={paymentMethod === "card"} 
                    onClick={() => setPaymentMethod("card")}
                    icon={<CreditCard className="w-5 h-5" />}
                    label="Credit/Debit Card"
                    description="Visa, Mastercard, Amex"
                  />
                  <PaymentOption 
                    active={paymentMethod === "upi"} 
                    onClick={() => setPaymentMethod("upi")}
                    icon={<div className="font-bold text-xs">UPI</div>}
                    label="UPI"
                    description="Google Pay, PhonePe, Paytm"
                  />
                  <PaymentOption 
                    active={paymentMethod === "wallet"} 
                    onClick={() => setPaymentMethod("wallet")}
                    icon={<ShoppingBag className="w-5 h-5" />}
                    label="Digital Wallet"
                    description="Apple Pay, Google Pay"
                  />
                </div>
              </Card>
            </section>

            <section>
              <div className="flex justify-between items-center p-6 rounded-3xl bg-card/50 shadow-sm mb-6">
                <span className="text-muted-foreground font-medium">Total to Pay</span>
                <span className="text-2xl font-bold text-primary">₹{finalTotal.toFixed(2)}</span>
              </div>
              
              <Button 
                size="lg" 
                className="w-full rounded-2xl h-16 text-lg font-bold shadow-xl shadow-primary/20"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order - ₹{finalTotal.toFixed(2)}
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                By placing this order, you agree to our terms of service
              </p>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PaymentOption({ active, onClick, icon, label, description }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
        active 
          ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
          : "border-border/50 bg-muted/20 hover:border-border"
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        active ? "border-primary bg-primary" : "border-muted-foreground/30"
      }`}>
        {active && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-muted" />
        <div className="h-8 w-48 bg-muted rounded-lg" />
      </div>
      <div className="space-y-4">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-48 bg-muted rounded-3xl" />
      </div>
      <div className="space-y-4">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="h-32 bg-muted rounded-3xl" />
        </div>
      </div>
      <div className="h-16 w-full bg-muted rounded-2xl" />
    </div>
  );
}
