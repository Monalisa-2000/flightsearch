import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login({ email, password });
        toast({ title: "Welcome back!", description: "Successfully logged in." });
      } else {
        await register({ email, password, name });
        toast({ title: "Account created!", description: "Welcome to FlightPlatform." });
      }
      onClose();
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message || "Authentication failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="bg-primary p-6 text-primary-foreground">
          <DialogTitle className="text-2xl text-white font-display">
            {isLogin ? "Welcome Back" : "Create Account"}
          </DialogTitle>
          <p className="text-primary-foreground/80 mt-2">
            {isLogin ? "Sign in to access your price alerts and bookings." : "Join to track prices and get personalized recommendations."}
          </p>
        </div>
        <div className="p-6 bg-background">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required={!isLogin}
                  className="rounded-xl border-border/50 focus:ring-accent"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                className="rounded-xl border-border/50 focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                minLength={8}
                className="rounded-xl border-border/50 focus:ring-accent"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-xl h-12 mt-4 bg-accent hover:bg-accent/90 text-white font-semibold transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
            </Button>
            
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
