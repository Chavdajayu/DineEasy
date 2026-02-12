import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UtensilsCrossed } from "lucide-react";

const OwnerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Login with Firebase Auth
      const userCredential = await login(email, password);
      const user = userCredential.user;
      
      // 2. Verify the user exists in 'owners' collection
      const ownerDoc = await getDoc(doc(db, "owners", user.uid));
      
      if (!ownerDoc.exists()) {
        await logout(); // Sign out if not an owner
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "This account does not have platform owner privileges.",
        });
        return;
      }

      const ownerData = ownerDoc.data();
      if (!ownerData.active) {
        await logout();
        toast({
          variant: "destructive",
          title: "Account Disabled",
          description: "Your owner account is currently disabled.",
        });
        return;
      }

      toast({
        title: "Login Success",
        description: `Welcome back, ${ownerData.username || 'Owner'}!`,
      });
      navigate("/owner");
    } catch (error) {
      console.error("Owner login error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
      <Card className="w-full max-w-md bg-card border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardHeader className="space-y-4 text-center pt-10">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-xl shadow-primary/20">
            <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight">Owner Portal</CardTitle>
            <CardDescription className="text-muted-foreground">
              Platform administration access
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8 md:p-10 pt-4">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <Input
                type="email"
                placeholder="owner@dineeasy.com"
                className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign In as Owner"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerLogin;
