import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useOrders";
import { useSession } from "@/providers/SessionProvider";
import { useCafe } from "@/providers/CafeProvider";

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const { cafeId, cafeSlug } = useCafe();
  const { session } = useSession();
  
  const { orders, loading } = useOrders(cafeId, session?.id);
  const latestOrder = orders[0];

  useEffect(() => {
    if (!session) {
      navigate(`/${cafeSlug}/menu`);
    }
  }, [session, navigate, cafeSlug]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-8 mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h1 className="text-4xl font-bold mb-4 tracking-tight">Order Placed!</h1>
        <p className="text-muted-foreground mb-12 max-w-sm mx-auto leading-relaxed">
          Your delicious order is being prepared. We'll serve it to your table shortly.
        </p>

        {loading ? (
          <div className="bg-card/50 border border-border/50 rounded-3xl p-6 mb-12 text-left max-w-md mx-auto w-full animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-6 w-16 bg-muted rounded-full" />
            </div>
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-4 w-12 bg-muted rounded" />
                </div>
              ))}
              <div className="pt-3 border-t border-border/50 flex justify-between">
                <div className="h-5 w-20 bg-muted rounded" />
                <div className="h-5 w-16 bg-muted rounded" />
              </div>
            </div>
          </div>
        ) : latestOrder && (
          <div className="bg-card/50 border border-border/50 rounded-3xl p-6 mb-12 text-left max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Order Status</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                {latestOrder.status}
              </span>
            </div>
            <div className="space-y-3">
              {latestOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                  <span className="font-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-border/50 flex justify-between font-bold">
                <span>Total Paid</span>
                <span className="text-primary">₹{Number(latestOrder.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            variant="secondary" 
            className="rounded-full h-14 px-8 font-bold w-full sm:w-auto"
            onClick={() => navigate(`/${cafeSlug}/menu?table=${session?.tableNumber}&id=${session?.tableId}`)}
          >
            <Utensils className="w-5 h-5 mr-2" />
            Order More
          </Button>
          <Button 
            size="lg" 
            className="rounded-full h-14 px-8 font-bold w-full sm:w-auto"
            onClick={() => navigate(`/${cafeSlug}/orders`)}
          >
            Track Your Order
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
