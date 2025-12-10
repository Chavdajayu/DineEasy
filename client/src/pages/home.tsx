import { useLocation } from "wouter";
import { UtensilsCrossed, QrCode, ArrowRight, Clock, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function HomePage() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: QrCode,
      title: "Scan & Order",
      description: "Scan the QR code on your table to access the digital menu instantly",
    },
    {
      icon: Clock,
      title: "Real-Time Tracking",
      description: "Track your order status from kitchen to table in real-time",
    },
    {
      icon: Star,
      title: "Customize Your Order",
      description: "Adjust spice levels, add extras, and note any dietary requirements",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Pay safely with cards, UPI, or digital wallets",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
            <UtensilsCrossed className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to <span className="text-primary">DineFlow</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Experience seamless dining with our digital ordering system. Scan, order, and enjoy!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <Button
            size="lg"
            onClick={() => navigate("/menu")}
            className="gap-2"
            data-testid="button-view-menu"
          >
            View Menu
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/admin/login")}
            data-testid="button-admin-login"
          >
            Staff Login
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Card className="glass-card text-left h-full">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        <p>Powered by DineFlow Restaurant Management System</p>
      </footer>
    </div>
  );
}
