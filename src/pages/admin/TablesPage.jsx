import { useState } from "react";
import { useTables } from "@/hooks/useTables";
import { useCafe } from "@/providers/CafeProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table2, 
  Plus, 
  Trash2, 
  QrCode, 
  Copy, 
  ExternalLink,
  Users,
  Search,
  CheckCircle2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

export default function TablesPage() {
  const { cafeId, cafeSlug } = useCafe();
  const { tables, loading, error, addTable, removeTable } = useTables(cafeId);
  const { toast } = useToast();
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableSeats, setNewTableSeats] = useState("2");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState(null);

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNumber) return;
    
    setIsAdding(true);
    try {
      await addTable({
        tableNumber: parseInt(newTableNumber),
        seats: parseInt(newTableSeats),
        status: "available"
      });
      setNewTableNumber("");
      toast({ title: "Table Added", description: `Table ${newTableNumber} created successfully.` });
    } catch (err) {
      toast({ title: "Error", description: "Failed to add table.", variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <TablesSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
          <Table2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Tables</h2>
        <p className="text-muted-foreground mb-8 max-w-xs">There was a problem connecting to the database. Please check your permissions.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Tables</h1>
          <p className="text-muted-foreground">Manage your café layout and QR code access.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-14 px-8 font-bold shadow-xl shadow-primary/20">
              <Plus className="w-5 h-5 mr-2" />
              Add New Table
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] p-8 border-none bg-card/90 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">New Table Details</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTable} className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Table Number</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 5" 
                  className="h-14 rounded-2xl bg-muted/30 border-none"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Number of Seats</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 4" 
                  className="h-14 rounded-2xl bg-muted/30 border-none"
                  value={newTableSeats}
                  onChange={(e) => setNewTableSeats(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-lg" disabled={isAdding}>
                {isAdding ? "Creating..." : "Create Table"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.sort((a, b) => a.tableNumber - b.tableNumber).map((table) => (
          <Card key={table.id} className="p-8 rounded-[2.5rem] border-none bg-card/50 backdrop-blur-xl hover:bg-card transition-colors group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Table2 className="w-7 h-7" />
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl hover:bg-red-400/10 hover:text-red-400"
                  onClick={() => removeTable(table.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-1">Table {table.tableNumber}</h3>
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <Users className="w-4 h-4" />
                <span>{table.seats} Seats</span>
                <span className="mx-2">•</span>
                <span className={table.status === "available" ? "text-emerald-400" : "text-orange-400"}>
                  {table.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                className="rounded-2xl h-12 font-bold"
                onClick={() => setSelectedTableForQr(table)}
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </Button>
              <Button 
                variant="outline" 
                className="rounded-2xl h-12 font-bold border-border/50"
                onClick={() => {
                  const url = `${window.location.origin}/${cafeSlug}/menu?table=${table.tableNumber}&id=${table.id}`;
                  navigator.clipboard.writeText(url);
                  toast({ title: "Copied!", description: "Table link copied to clipboard" });
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-20 bg-card/30 rounded-[2.5rem] border border-dashed border-border/50">
          <Table2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No tables added yet.</p>
        </div>
      )}

      <Dialog open={!!selectedTableForQr} onOpenChange={() => setSelectedTableForQr(null)}>
        <DialogContent className="rounded-[2.5rem] p-8 border-none bg-card/90 backdrop-blur-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Table {selectedTableForQr?.tableNumber} QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-8 py-6">
            <div className="p-6 bg-white rounded-[2rem] shadow-xl shadow-primary/10">
              <QRCodeSVG 
                value={`${window.location.origin}/${cafeSlug}/menu?table=${selectedTableForQr?.tableNumber}&id=${selectedTableForQr?.id}`}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Scan this code to start ordering</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">DineEasy • Smart Ordering</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button 
                variant="outline" 
                className="rounded-2xl h-14 font-bold"
                onClick={() => window.open(`/${cafeSlug}/menu?table=${selectedTableForQr?.tableNumber}&id=${selectedTableForQr?.id}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Test
              </Button>
              <Button className="rounded-2xl h-14 font-bold" onClick={() => setSelectedTableForQr(null)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TablesSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-muted rounded-xl" />
          <div className="h-4 w-64 bg-muted rounded-lg" />
        </div>
        <div className="h-14 w-48 bg-muted rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-64 bg-muted rounded-[2.5rem]" />
        ))}
      </div>
    </div>
  );
}
