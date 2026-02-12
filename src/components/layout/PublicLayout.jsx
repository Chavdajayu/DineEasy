import { motion } from "framer-motion";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
      
      <footer className="py-12 border-t border-border/50 text-center text-muted-foreground">
        <p className="text-sm font-medium">© {new Date().getFullYear()} DineEasy Café • Smart Ordering</p>
      </footer>
    </div>
  );
}
