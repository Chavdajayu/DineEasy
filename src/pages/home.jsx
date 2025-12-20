import { useState } from "react";
import { useLocation } from "wouter";
import { UtensilsCrossed, QrCode, ArrowRight, Clock, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchTables } from "@/lib/dataClient";
import { useSession, generateSessionId } from "@/lib/session-context";
import { motion } from "framer-motion";

export default function HomePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { setTableInfo } = useSession();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data: tables = [] } = useQuery({
    queryKey: ["tables-home"],
    queryFn: fetchTables,
  });

  const availableTableNumbers = tables
    .filter((t) => t.status === "available" || t.status === "occupied" || t.status === "reserved")
    .map((t) => t.tableNumber)
    .sort((a, b) => a - b);

  const handleViewMenu = () => {
    setSelected(null);
    setOpen(true);
  };

  const handleConfirm = () => {
    if (!selected) {
      toast({ title: "Please select a table", variant: "destructive" });
      return;
    }
    const tableNum = parseInt(selected, 10);
    const tbl = tables.find((t) => t.tableNumber === tableNum);
    if (!tbl) {
      toast({ title: "Invalid table number", variant: "destructive" });
      return;
    }
    const sessionId = generateSessionId();
    setTableInfo(tableNum, tbl.id, sessionId);
    setOpen(false);
    navigate(`/menu?table=${tableNum}&id=${tbl.id}`);
  };

  const features = [
    { icon: QrCode, title: "Scan & Order", description: "Scan the QR code on your table to access the digital menu instantly" },
    { icon: Clock, title: "Real-Time Tracking", description: "Track your order status from kitchen to table in real-time" },
    { icon: Star, title: "Customize Your Order", description: "Adjust spice levels, add extras, and note any dietary requirements" },
    { icon: Shield, title: "Secure Payments", description: "Pay safely with cards, UPI, or digital wallets" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <div className="w-28 h-28 rounded-2xl bg-[#121212] from-primary to-primary/60 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
            <img src="/favicon.png" alt="DineEase Logo" className="w-full h-full" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to <span className="text-primary">DineEase</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">Experience seamless dining with our digital ordering system. Scan, order, and enjoy!</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button size="lg" onClick={handleViewMenu} className="gap-2" data-testid="button-view-menu">
            View Menu
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/admin/login")} data-testid="button-admin-login">
            Staff Login
          </Button>
        </motion.div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent aria-label="Select Your Table Number">
            <DialogHeader>
              <DialogTitle>Select Your Table Number</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Select value={selected ?? undefined} onValueChange={setSelected}>
                  <SelectTrigger className="w-full" aria-label="Table Number">
                    <SelectValue placeholder="Choose a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTableNumbers.length === 0 ? (
                      <SelectItem value="none" disabled>No tables available</SelectItem>
                    ) : (
                      availableTableNumbers.map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          Table {num}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={!selected}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
          {features.map((feature, index) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.1 }}>
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

      <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        <p>Powered by DineEase Restaurant Management System</p>
      </footer>
    </div>
  );
}
