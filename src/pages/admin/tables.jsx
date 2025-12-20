import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  ClipboardList,
  QrCode,
  LogOut,
  Plus,
  Download,
  Copy,
  Trash2,
  Users,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/session-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fetchTables, createTable, deleteTable } from "@/lib/dataClient";
import { motion } from "framer-motion";

const navItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Orders", url: "/admin/orders", icon: ClipboardList },
  { title: "Tables", url: "/admin/tables", icon: QrCode },
];

function AdminSidebar() {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const { setIsAdmin, clearSession } = useSession();

  const handleLogout = () => {
    setIsAdmin(false);
    clearSession();
    navigate("/admin/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold">DineEase</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                    <a href={item.url} onClick={(e) => { e.preventDefault(); navigate(item.url); }}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout} data-testid="button-logout">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function QRCodeDisplay({ table, baseUrl }) {
  const tableUrl = `${baseUrl}/menu?table=${table.tableNumber}&id=${table.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(tableUrl);
  };

  const handleDownload = () => {
    if (table.qrCode) {
      const link = document.createElement("a");
      link.download = `table-${table.tableNumber}-qr.png`;
      link.href = table.qrCode;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {table.qrCode ? (
        <div className="w-48 h-48 bg-white rounded-lg p-4">
          <img src={table.qrCode} alt={`QR Code for Table ${table.tableNumber}`} className="w-full h-full" />
        </div>
      ) : (
        <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
          <QrCode className="w-16 h-16 text-muted-foreground" />
        </div>
      )}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={handleCopy} data-testid={`button-copy-${table.id}`}>
          <Copy className="w-4 h-4 mr-1" />
          Copy URL
        </Button>
        {table.qrCode && (
          <Button size="sm" variant="outline" onClick={handleDownload} data-testid={`button-download-${table.id}`}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground text-center break-all max-w-[200px]">{tableUrl}</p>
    </div>
  );
}

export default function AdminTablesPage() {
  const [, navigate] = useLocation();
  const { isAdmin } = useSession();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("4");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, navigate]);

  const { data: tables = [], refetch } = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
  });

  const createTableMutation = useMutation({
    mutationFn: async ({ tableNumber, capacity }) => createTable({ tableNumber, capacity }),
    onSuccess: () => {
      refetch();
      setCreateDialogOpen(false);
      setNewTableNumber("");
      setNewTableCapacity("4");
      toast({ title: "Table created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create table", description: error.message, variant: "destructive" });
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: async (tableId) => deleteTable(tableId),
    onSuccess: () => {
      refetch();
      toast({ title: "Table deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete table", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateTable = () => {
    const tableNum = parseInt(newTableNumber, 10);
    const capacity = parseInt(newTableCapacity, 10);
    if (isNaN(tableNum) || tableNum < 1) {
      toast({ title: "Invalid table number", variant: "destructive" });
      return;
    }
    if (isNaN(capacity) || capacity < 1) {
      toast({ title: "Invalid capacity", variant: "destructive" });
      return;
    }
    createTableMutation.mutate({ tableNumber: tableNum, capacity });
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  if (!isAdmin) return null;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between gap-4 p-4 border-b border-border">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="font-bold text-lg">Table Management</h1>
                <p className="text-sm text-muted-foreground">{tables.length} tables configured</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => refetch()} data-testid="button-refresh">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" data-testid="button-add-table">
                    <Plus className="w-4 h-4" />
                    Add Table
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass">
                  <DialogHeader>
                    <DialogTitle>Add New Table</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="tableNumber">Table Number</Label>
                      <Input
                        id="tableNumber"
                        type="number"
                        min="1"
                        placeholder="e.g., 1, 2, 3..."
                        value={newTableNumber}
                        onChange={(e) => setNewTableNumber(e.target.value)}
                        data-testid="input-table-number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Seating Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        placeholder="Number of seats"
                        value={newTableCapacity}
                        onChange={(e) => setNewTableCapacity(e.target.value)}
                        data-testid="input-capacity"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTable} disabled={createTableMutation.isPending} data-testid="button-confirm-add">
                      {createTableMutation.isPending ? "Creating..." : "Create Table"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <ScrollArea className="flex-1">
            <main className="p-6">
              {tables.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <QrCode className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No tables configured</h3>
                  <p className="text-muted-foreground mb-6">Add tables to generate QR codes for ordering</p>
                  <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Table
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {tables.map((table, index) => (
                    <motion.div key={table.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <Card className="glass-card" data-testid={`table-card-${table.id}`}>
                        <CardHeader className="text-center pb-2">
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                table.status === "available"
                                  ? "bg-success/10 text-success border-success/30"
                                  : table.status === "occupied"
                                  ? "bg-primary/10 text-primary border-primary/30"
                                  : "bg-warning/10 text-warning border-warning/30"
                              )}
                            >
                              {table.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground"
                              onClick={() => deleteTableMutation.mutate(table.id)}
                              data-testid={`button-delete-${table.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <CardTitle className="text-2xl">Table {table.tableNumber}</CardTitle>
                          <CardDescription className="flex items-center justify-center gap-1">
                            <Users className="w-4 h-4" />
                            {table.capacity} seats
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <QRCodeDisplay table={table} baseUrl={baseUrl} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </main>
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}

