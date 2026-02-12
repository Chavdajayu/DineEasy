
import { useNavigate } from "react-router-dom";
import { Clock, Receipt, ChefHat, Bell, UtensilsCrossed, Check, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useOrders } from "@/hooks/useOrders";
import { useSession } from "@/providers/SessionProvider";
import { useCafe } from "@/providers/CafeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const statusColors = {
  pending: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  cooking: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ready: "bg-green-500/10 text-green-500 border-green-500/20",
  served: "bg-muted text-muted-foreground border-border/50",
};

const orderSteps = [
  { status: 'pending', label: 'Received', icon: Clock },
  { status: 'cooking', label: 'Cooking', icon: ChefHat },
  { status: 'ready', label: 'Ready', icon: Bell },
  { status: 'served', label: 'Served', icon: UtensilsCrossed },
];

export default function OrderStatusPage() {
  const navigate = useNavigate();
  const { cafeId, cafeSlug } = useCafe();
  const { session } = useSession();
  const { orders, loading, error } = useOrders(cafeId, session?.id);

  if (loading) return (
    <div className="max-w-2xl mx-auto p-4">
      <OrderStatusSkeleton />
    </div>
  );

  if (error) return (
    <div className="text-center py-20">
      <p className="text-destructive">Error loading orders. Please try again.</p>
      <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
    </div>
  );

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
          <Receipt className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No active orders</h2>
        <p className="text-muted-foreground mb-8">You haven't placed any orders yet. Head to the menu to get started!</p>
        <Button size="lg" className="rounded-2xl px-8" onClick={() => navigate(`/${cafeSlug}/menu`)}>
          Go to Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-32 px-4">
      <header className="flex items-center gap-4 mb-8 pt-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-10 w-10 bg-muted/50" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Your Orders</h1>
          <p className="text-sm text-muted-foreground">Table {session?.tableNumber}</p>
        </div>
      </header>

      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => {
            const currentStepIndex = orderSteps.findIndex(s => s.status === order.status);
            
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <Card className="rounded-3xl border-none bg-card/50 overflow-hidden shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            Order #{order.id.slice(-6)}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <p className="text-xs text-muted-foreground">
                            {order.createdAt instanceof Date ? order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </p>
                        </div>
                        <h3 className="text-lg font-bold">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </h3>
                      </div>
                      <Badge className={cn(statusColors[order.status], "px-4 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider")}>
                        {order.status}
                      </Badge>
                    </div>

                    {/* Progress Steps */}
                    <div className="relative flex justify-between items-center mb-10 px-2">
                      {/* Connecting Line */}
                      <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                          initial={{ width: "0%" }}
                          animate={{ width: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%` }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                        />
                      </div>

                      {orderSteps.map((step, idx) => {
                        const isCompleted = idx < currentStepIndex;
                        const isActive = idx === currentStepIndex;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.status} className="relative z-8 flex flex-col items-center">
                            <motion.div
                              initial={false}
                              animate={{ 
                                scale: isActive ? 1.25 : 1,
                                backgroundColor: isCompleted || isActive ? "#f97316" : "rgba(39, 39, 42, 0.5)",
                                boxShadow: isCompleted || isActive ? "0 0 20px rgba(249, 115, 22, 0.4)" : "none"
                              }}
                              className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 z-20 border-2",
                                isCompleted || isActive ? "border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]" : "border-zinc-800"
                              )}
                            >
                              {isCompleted ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                  <Check className="w-6 h-6 text-white stroke-[3px]" />
                                </motion.div>
                              ) : (
                                <StepIcon className={cn(
                                  "w-5 h-5 transition-colors",
                                  isActive ? "text-white animate-pulse" : "text-zinc-500"
                                )} />
                              )}
                            </motion.div>
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider mt-2 absolute -bottom-6 whitespace-nowrap",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-4 mb-6">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex gap-3">
                            <span className="font-bold text-primary text-sm">{item.quantity}x</span>
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <span className="font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-border/50 mb-4" />

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Total Amount</span>
                        <span className="text-xl font-bold text-primary">₹{order.total.toFixed(2)}</span>
                      </div>
                      <Badge variant="outline" className="rounded-xl px-4 py-1.5 font-bold bg-muted/30">
                        {order.paymentMethod === 'online' ? 'Paid Online' : 'Payment Pending'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-8 left-0 right-0 px-4">
        <Button 
          size="lg" 
          className="w-full max-w-2xl mx-auto rounded-2xl h-16 text-lg font-bold shadow-2xl shadow-primary/20 flex gap-2"
          onClick={() => navigate(`/${cafeSlug}/menu?table=${session?.tableNumber}&id=${session?.tableId}`)}
        >
          <UtensilsCrossed className="w-5 h-5" />
          Order More Items
        </Button>
      </div>
    </div>
  );
}

function OrderStatusSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-xl mb-8" />
      {[1, 2].map(i => (
        <div key={i} className="h-48 bg-muted rounded-3xl" />
      ))}
    </div>
  );
}
