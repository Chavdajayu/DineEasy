import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UtensilsCrossed, Lock, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getCafeByAdminUid } from "@/lib/firestore";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await login(email, password);
      const user = userCredential.user;
      
      // Resolve cafe automatically from Firestore using adminUid
      const cafe = await getCafeByAdminUid(user.uid);
      
      if (!cafe) {
        await logout();
        toast({
          title: "Access Denied",
          description: "This account is not linked to any cafe.",
          variant: "destructive",
        });
        return;
      }

      if (cafe.active === false) {
        await logout();
        toast({
          title: "Cafe Disabled",
          description: "This cafe is currently disabled by the owner.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login Successful",
        description: `Welcome to ${cafe.name} admin panel.`,
      });

      // Redirect to the resolved cafe's admin dashboard
      navigate(`/${cafe.slug}/admin/dashboard`);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20">
            <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Admin Portal Access</p>
        </div>

        <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@dineeasy.com"
                  className="h-14 pl-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-14 pl-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          Don't have an account? Contact system administrator.
        </p>
      </motion.div>
    </div>
  );
}
