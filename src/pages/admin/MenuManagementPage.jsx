import { useState } from "react";
import { useMenu } from "@/hooks/useMenu";
import { useCafe } from "@/providers/CafeProvider";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChefHat, 
  Image as ImageIcon,
  Loader2,
  Utensils,
  Leaf,
  Flame,
  Check,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function MenuManagementPage() {
  const { cafeId } = useCafe();
  const { items, categories, loading, error } = useMenu(cafeId);
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    image: "",
    isVegetarian: true,
    spiceLevel: "mild",
    available: true
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      image: "",
      isVegetarian: true,
      spiceLevel: "mild",
      available: true
    });
    setIsEditing(false);
    setCurrentItemId(null);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !cafeId) return;
    try {
      await addDoc(collection(db, "cafes", cafeId, "categories"), {
        name: newCategoryName.trim(),
        icon: "utensils" // default icon
      });
      setNewCategoryName("");
      setIsAddingCategory(false);
      toast({ title: "Success", description: "Category added successfully" });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add category: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      categoryId: item.categoryId,
      image: item.image,
      isVegetarian: item.isVegetarian,
      spiceLevel: item.spiceLevel,
      available: item.available
    });
    setCurrentItemId(item.id);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      await deleteDoc(doc(db, "cafes", cafeId, "menuItems", itemId));
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete item: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cafeId) return;
    
    setSubmitting(true);
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        updatedAt: new Date()
      };

      if (isEditing) {
        await updateDoc(doc(db, "cafes", cafeId, "menuItems", currentItemId), itemData);
        toast({ title: "Success", description: "Item updated successfully" });
      } else {
        await addDoc(collection(db, "cafes", cafeId, "menuItems"), {
          ...itemData,
          createdAt: new Date()
        });
        toast({ title: "Success", description: "New item added successfully" });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save item: " + err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === "all" || item.categoryId === activeTab;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Menu Management</h1>
          <p className="text-muted-foreground">Add, edit or remove dishes from your cafe's menu.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5 mr-2" />
              Add New Dish
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] rounded-[2rem] border-none bg-card backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {isEditing ? "Edit Dish" : "Add New Dish"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Dish Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Butter Chicken"
                    required
                    className="rounded-xl bg-muted/30 border-none focus-visible:ring-primary h-12"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of the dish..."
                    required
                    className="rounded-xl bg-muted/30 border-none focus-visible:ring-primary min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Price (₹)</Label>
                  <Input 
                    id="price" 
                    type="number"
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="299"
                    required
                    className="rounded-xl bg-muted/30 border-none focus-visible:ring-primary h-12"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                    <button 
                      type="button"
                      onClick={() => setIsAddingCategory(!isAddingCategory)}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      {isAddingCategory ? "Cancel" : "+ New Category"}
                    </button>
                  </div>
                  {isAddingCategory ? (
                    <div className="flex gap-2">
                      <Input 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category Name"
                        className="rounded-xl bg-muted/30 border-none h-12"
                      />
                      <Button 
                        type="button" 
                        size="icon"
                        onClick={handleAddCategory}
                        className="rounded-xl h-12 w-12 shrink-0"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Select 
                      value={formData.categoryId} 
                      onValueChange={(val) => setFormData({...formData, categoryId: val})}
                      required
                    >
                      <SelectTrigger className="rounded-xl bg-muted/30 border-none focus:ring-primary h-12">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="image" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Image URL</Label>
                  <Input 
                    id="image" 
                    value={formData.image} 
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="Paste image link from online..."
                    required
                    className="rounded-xl bg-muted/30 border-none focus-visible:ring-primary h-12"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 col-span-2">
                  <div className="flex items-center gap-2">
                    <Leaf className={formData.isVegetarian ? "text-emerald-500" : "text-muted-foreground"} size={18} />
                    <Label htmlFor="veg" className="font-bold">Vegetarian Dish</Label>
                  </div>
                  <Switch 
                    id="veg" 
                    checked={formData.isVegetarian} 
                    onCheckedChange={(val) => setFormData({...formData, isVegetarian: val})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Spice Level</Label>
                  <Select 
                    value={formData.spiceLevel} 
                    onValueChange={(val) => setFormData({...formData, spiceLevel: val})}
                  >
                    <SelectTrigger className="rounded-xl bg-muted/30 border-none h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <Label className="font-bold">Available</Label>
                  <Switch 
                    checked={formData.available} 
                    onCheckedChange={(val) => setFormData({...formData, available: val})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full rounded-2xl h-14 font-bold text-lg shadow-xl shadow-primary/20"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditing ? "Update Dish" : "Add Dish to Menu"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search dishes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 rounded-2xl h-12 bg-card/50 border-none backdrop-blur-xl focus-visible:ring-primary"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-card/50 backdrop-blur-xl p-1 rounded-2xl border-none h-14 w-full md:w-auto overflow-x-auto">
            <TabsTrigger value="all" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-12">
              All
            </TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-12">
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group"
            >
              <Card className="rounded-[2rem] border-none bg-card/50 backdrop-blur-xl overflow-hidden group-hover:bg-card transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className={cn(
                      "rounded-full px-3 py-1 border-none shadow-lg backdrop-blur-md",
                      item.available ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"
                    )}>
                      {item.available ? "Available" : "Sold Out"}
                    </Badge>
                  </div>
                  {item.isVegetarian && (
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold line-clamp-1">{item.name}</h3>
                    <span className="text-lg font-black text-primary">₹{item.price}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Flame 
                          key={i} 
                          className={cn(
                            "w-3 h-3",
                            i < (item.spiceLevel === "mild" ? 1 : item.spiceLevel === "medium" ? 2 : item.spiceLevel === "hot" ? 3 : 0)
                              ? "text-orange-500 fill-orange-500"
                              : "text-muted/30"
                          )} 
                        />
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-xl w-10 h-10 hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-xl w-10 h-10 hover:bg-red-500 hover:text-white transition-colors"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <Utensils className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">No dishes found</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">Try adjusting your search or category filter, or add a new dish to your menu.</p>
            <Button variant="outline" className="rounded-2xl" onClick={() => { setSearchQuery(""); setActiveTab("all"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
