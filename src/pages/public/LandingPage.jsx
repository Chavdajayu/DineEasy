import { motion } from "framer-motion";
import { UtensilsCrossed, QrCode, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8">
          <UtensilsCrossed className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide uppercase">DineEasy Café Ordering</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
          Order your favorite <br /> flavors in seconds.
        </h1>
        
        <p className="text-lg text-muted-foreground mb-12 max-w-lg mx-auto leading-relaxed">
          Simply scan the QR code on your table to browse our menu and place your order. No apps, no waiting, just pure taste.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-left">
          <Step 
            icon={<QrCode className="w-6 h-6" />}
            title="Scan"
            description="Scan the QR code at your table."
          />
          <Step 
            icon={<UtensilsCrossed className="w-6 h-6" />}
            title="Choose"
            description="Browse our fresh menu items."
          />
          <Step 
            icon={<ShoppingBag className="w-6 h-6" />}
            title="Enjoy"
            description="Place order and we'll serve you."
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="rounded-full h-14 px-8 text-lg font-bold group" asChild>
            <Link to="/login">
              Cafe Login
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function Step({ icon, title, description }) {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}
