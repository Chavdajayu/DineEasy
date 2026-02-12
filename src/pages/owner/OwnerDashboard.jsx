import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getCafesByOwner, 
  updateCafeStatus 
} from "@/lib/firestore";
import { createCafeWithAdmin, createNewOwner } from "@/lib/owner-actions";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  LayoutDashboard, 
  Plus, 
  LogOut, 
  Coffee, 
  Users, 
  Settings,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  UserPlus
} from "lucide-react";

const OwnerDashboard = () => {
  const [cafes, setCafes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCafe, setIsCreatingCafe] = useState(false);
  const [isCreatingOwner, setIsCreatingOwner] = useState(false);
  
  // Create Cafe Form State
  const [cafeName, setCafeName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  // Create Owner Form State
  const [newOwnerUsername, setNewOwnerUsername] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newOwnerPassword, setNewOwnerPassword] = useState("");

  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/owner-login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.uid) {
      fetchCafes();
    }
  }, [user]);

  const fetchCafes = async () => {
    try {
      setIsLoading(true);
      const data = await getCafesByOwner(user.uid);
      setCafes(data);
    } catch (error) {
      console.error("Error fetching cafes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (cafeId, currentStatus) => {
    try {
      await updateCafeStatus(cafeId, !currentStatus);
      toast({
        title: "Status Updated",
        description: `Cafe is now ${!currentStatus ? "active" : "inactive"}.`,
      });
      fetchCafes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update cafe status.",
      });
    }
  };

  const handleCreateCafe = async (e) => {
    e.preventDefault();
    setIsCreatingCafe(true);
    try {
      await createCafeWithAdmin(cafeName, adminEmail, adminPassword, user.uid);
      toast({
        title: "Cafe Created",
        description: `${cafeName} has been created successfully.`,
      });
      setCafeName("");
      setAdminEmail("");
      setAdminPassword("");
      fetchCafes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Could not create cafe.",
      });
    } finally {
      setIsCreatingCafe(false);
    }
  };

  const handleCreateOwner = async (e) => {
    e.preventDefault();
    setIsCreatingOwner(true);
    try {
      await createNewOwner(newOwnerUsername, newOwnerEmail, newOwnerPassword);
      toast({
        title: "Owner Created",
        description: `New platform owner ${newOwnerUsername} created.`,
      });
      setNewOwnerUsername("");
      setNewOwnerEmail("");
      setNewOwnerPassword("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Could not create owner.",
      });
    } finally {
      setIsCreatingOwner(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/30 backdrop-blur-xl flex flex-col hidden md:flex">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight block">Platform</span>
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Owner Panel</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold">
            <LayoutDashboard className="w-5 h-5" />
            Cafes Management
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all font-bold">
            <Users className="w-5 h-5" />
            Admin Users
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all font-bold">
            <Settings className="w-5 h-5" />
            Global Settings
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start rounded-2xl h-12 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 font-bold"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Cafes Management</h1>
                <p className="text-muted-foreground">Manage your cafe instances and their administrators.</p>
              </div>
              <div className="flex gap-3">
                {/* Create Owner Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-border/50 bg-card hover:bg-white/5 transition-all">
                      <UserPlus className="w-5 h-5 mr-2" />
                      New Owner
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#09090b] border-border/50 text-foreground sm:max-w-[425px] rounded-[2rem]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Create New Owner</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateOwner} className="space-y-6 pt-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Username</label>
                        <Input 
                          placeholder="e.g. John Doe"
                          value={newOwnerUsername}
                          onChange={(e) => setNewOwnerUsername(e.target.value)}
                          className="h-12 rounded-xl bg-muted/30 border-none"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                        <Input 
                          type="email"
                          placeholder="owner@dineeasy.com"
                          value={newOwnerEmail}
                          onChange={(e) => setNewOwnerEmail(e.target.value)}
                          className="h-12 rounded-xl bg-muted/30 border-none"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                        <Input 
                          type="password"
                          placeholder="••••••••"
                          value={newOwnerPassword}
                          onChange={(e) => setNewOwnerPassword(e.target.value)}
                          className="h-12 rounded-xl bg-muted/30 border-none"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={isCreatingOwner}>
                        {isCreatingOwner ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Owner Account"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Create Cafe Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Cafe
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#09090b] border-border/50 text-foreground sm:max-w-[425px] rounded-[2rem]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">New Cafe Instance</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCafe} className="space-y-6 pt-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Cafe Name</label>
                        <Input 
                          placeholder="e.g. Shiv Cafe"
                          value={cafeName}
                          onChange={(e) => setCafeName(e.target.value)}
                          className="h-12 rounded-xl bg-muted/30 border-none"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Admin Email</label>
                        <Input 
                          type="email"
                          placeholder="admin@cafe.com"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="h-12 rounded-xl bg-muted/30 border-none"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Admin Password</label>
                        <Input 
                          type="password"
                          placeholder="••••••••"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="h-12 rounded-xl bg-muted/30 border-none"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={isCreatingCafe}>
                        {isCreatingCafe ? <Loader2 className="h-5 w-5 animate-spin" /> : "Initialize Cafe"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard icon={<Coffee className="w-6 h-6 text-blue-400" />} label="Total Cafes" value={cafes.length} />
              <StatCard icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />} label="Active" value={cafes.filter(c => c.active).length} />
              <StatCard icon={<ShieldAlert className="w-6 h-6 text-rose-400" />} label="Disabled" value={cafes.filter(c => !c.active).length} />
            </div>

            {/* Cafes Table */}
            <div className="bg-card/30 backdrop-blur-xl rounded-[2rem] border border-border/50 overflow-hidden shadow-2xl">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="px-8 h-16 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Cafe Info</TableHead>
                    <TableHead className="h-16 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Admin Email</TableHead>
                    <TableHead className="h-16 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Status</TableHead>
                    <TableHead className="h-16 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Created At</TableHead>
                    <TableHead className="px-8 h-16 text-right font-black uppercase tracking-widest text-[10px] text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 opacity-20" />
                        Fetching your cafes...
                      </TableCell>
                    </TableRow>
                  ) : cafes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-medium">
                        No cafes found. Create your first one!
                      </TableCell>
                    </TableRow>
                  ) : cafes.map((cafe) => (
                    <TableRow key={cafe.id} className="border-border/50 hover:bg-white/5 transition-colors group">
                      <TableCell className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-lg text-foreground">{cafe.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">/{cafe.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 font-medium text-muted-foreground">{cafe.adminEmail}</TableCell>
                      <TableCell className="py-6">
                        <Badge className={`rounded-lg px-3 py-1 font-bold ${
                          cafe.active 
                            ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" 
                            : "bg-rose-400/10 text-rose-400 border-rose-400/20"
                        }`} variant="outline">
                          {cafe.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-6 text-sm text-muted-foreground">
                        {cafe.createdAt?.toDate ? cafe.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`rounded-xl font-bold transition-all ${
                            cafe.active 
                              ? "text-rose-400 hover:bg-rose-400/10 hover:text-rose-400" 
                              : "text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-400"
                          }`}
                          onClick={() => handleToggleStatus(cafe.id, cafe.active)}
                        >
                          {cafe.active ? "Disable" : "Enable"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-card/30 backdrop-blur-xl p-8 rounded-[2rem] border border-border/50 flex items-center gap-6 shadow-xl transition-transform hover:scale-[1.02]">
    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  </div>
);

export default OwnerDashboard;
