import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  getOwnerByEmail, 
  createOwner, 
  getAllCafes,
  updateCafeAdminUid 
} from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

const SetupOwner = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if any owner already exists
    const checkOwners = async () => {
      // This is a simplified check. In a real app, you'd want a more secure way
      // to prevent multiple owner setups.
    };
    checkOwners();
  }, []);

  const handleSetup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Create the owner record in Firestore
      await createOwner(userCredential.user.uid, {
        username,
        email,
        active: true
      });

      toast({
        title: "Setup Complete",
        description: "Platform owner account has been created.",
      });
      navigate("/owner-login");
    } catch (error) {
      console.error("Setup error:", error);
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "Could not complete owner setup.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-white">
        <CardHeader className="space-y-1 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Platform Setup</CardTitle>
          <CardDescription className="text-slate-400">
            Create the primary owner account for DineEasy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Username</label>
              <Input
                placeholder="Platform Admin"
                className="bg-slate-800 border-slate-700 text-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Owner Email</label>
              <Input
                type="email"
                placeholder="owner@dineeasy.com"
                className="bg-slate-800 border-slate-700 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Master Password</label>
              <Input
                type="password"
                className="bg-slate-800 border-slate-700 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full mt-4" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupOwner;
