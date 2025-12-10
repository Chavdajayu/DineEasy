import { Check, Clock, ChefHat, Flame, Bell, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@shared/schema";
import { motion } from "framer-motion";

interface OrderStatusTrackerProps {
  status: OrderStatus;
  className?: string;
  compact?: boolean;
}

const steps = [
  { key: "received", label: "Order Received", icon: Clock },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "cooking", label: "Cooking", icon: Flame },
  { key: "ready", label: "Ready to Serve", icon: Bell },
  { key: "served", label: "Served", icon: UtensilsCrossed },
] as const;

const statusIndex: Record<OrderStatus, number> = {
  received: 0,
  preparing: 1,
  cooking: 2,
  ready: 3,
  served: 4,
  cancelled: -1,
};

export function OrderStatusTracker({ status, className, compact = false }: OrderStatusTrackerProps) {
  const currentIndex = statusIndex[status];

  if (status === "cancelled") {
    return (
      <div className={cn("flex items-center justify-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20", className)}>
        <span className="text-destructive font-medium">Order Cancelled</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted && "bg-success text-success-foreground",
                  isCurrent && "bg-primary text-primary-foreground animate-pulse-glow",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </motion.div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-4 h-0.5 transition-all duration-300",
                    index < currentIndex ? "bg-success" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: index <= currentIndex ? 1 : 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className={cn(
                      "flex-1 h-1 origin-left transition-all duration-500",
                      index <= currentIndex ? "bg-success" : "bg-muted"
                    )}
                  />
                )}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.15 }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shrink-0",
                    isCompleted && "bg-success text-success-foreground",
                    isCurrent && "bg-primary text-primary-foreground animate-pulse-glow",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: index < currentIndex ? 1 : 0 }}
                    transition={{ duration: 0.5, delay: (index + 1) * 0.2 }}
                    className={cn(
                      "flex-1 h-1 origin-left transition-all duration-500",
                      index < currentIndex ? "bg-success" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className={cn(
                  "text-xs mt-2 text-center font-medium transition-colors",
                  isCurrent ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"
                )}
              >
                {step.label}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    received: { label: "Received", className: "status-received" },
    preparing: { label: "Preparing", className: "status-preparing" },
    cooking: { label: "Cooking", className: "status-cooking" },
    ready: { label: "Ready", className: "status-ready" },
    served: { label: "Served", className: "status-served" },
    cancelled: { label: "Cancelled", className: "bg-destructive/20 text-destructive border-destructive/30" },
  };

  const config = statusConfig[status];

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
      config.className
    )}>
      {config.label}
    </span>
  );
}
