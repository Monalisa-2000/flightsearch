import { useState } from "react";
import { format, differenceInMinutes } from "date-fns";
import { Plane, Clock, BellPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAlert, type Flight } from "@workspace/api-client-react";
import { useApiAuthOptions, useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export function FlightCard({ flight, index }: { flight: Flight, index: number }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(Math.floor(flight.price * 0.9).toString());
  
  const { isAuthenticated } = useAuth();
  const apiOpts = useApiAuthOptions();
  const { toast } = useToast();
  const createAlertMut = useCreateAlert(apiOpts);

  const durationHours = Math.floor(flight.duration / 60);
  const durationMins = flight.duration % 60;

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAlertMut.mutateAsync({
        data: {
          fromAirport: flight.from,
          toAirport: flight.to,
          targetPrice: Number(targetPrice),
          currency: flight.currency,
        }
      });
      setIsAlertOpen(false);
      toast({
        title: "Alert Created!",
        description: `We'll notify you when price drops below $${targetPrice}.`,
      });
    } catch (err: any) {
      toast({ title: "Failed to create alert", description: err.message, variant: "destructive" });
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md hover:border-border transition-all group"
      >
        <div className="flex flex-col md:flex-row justify-between gap-6">
          
          <div className="flex flex-1 gap-6">
            <div className="flex flex-col items-center justify-center p-3 bg-secondary/50 rounded-xl min-w-[80px]">
              <Plane className="w-6 h-6 text-primary mb-1" />
              <span className="text-xs font-bold text-muted-foreground">{flight.airlineCode}</span>
            </div>

            <div className="flex-1 flex items-center justify-between relative">
              {/* Departure */}
              <div className="text-center md:text-left">
                <p className="text-2xl font-display font-bold text-primary">
                  {format(new Date(flight.departureTime), "HH:mm")}
                </p>
                <p className="text-sm font-medium text-muted-foreground mt-1">{flight.from}</p>
              </div>

              {/* Journey Line */}
              <div className="flex-1 flex flex-col items-center px-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {durationHours}h {durationMins}m
                </p>
                <div className="w-full h-px bg-border relative flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary/20 absolute left-0" />
                  <span className="bg-background px-2 text-[10px] font-bold text-accent uppercase tracking-wider border border-border rounded-full">
                    {flight.stops === 0 ? "Direct" : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-primary/20 absolute right-0" />
                </div>
              </div>

              {/* Arrival */}
              <div className="text-center md:text-right">
                <p className="text-2xl font-display font-bold text-primary">
                  {format(new Date(flight.arrivalTime), "HH:mm")}
                </p>
                <p className="text-sm font-medium text-muted-foreground mt-1">{flight.to}</p>
              </div>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price</p>
              <p className="text-3xl font-display font-bold text-primary">${flight.price}</p>
            </div>
            
            {isAuthenticated ? (
              <Button 
                variant="outline"
                className="mt-3 rounded-full hover:bg-accent hover:text-white border-accent/20 text-accent transition-all w-full"
                onClick={() => setIsAlertOpen(true)}
              >
                <BellPlus className="w-4 h-4 mr-2" /> Alert Me
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground mt-3 w-full text-center">Sign in to set alerts</p>
            )}
          </div>
        </div>
      </motion.div>

      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-primary flex items-center gap-2">
              <BellPlus className="text-accent" /> Set Price Alert
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAlert} className="space-y-6 pt-4">
            <div className="p-4 bg-secondary/50 rounded-xl mb-4">
              <p className="text-sm font-medium text-primary">Current Price: ${flight.price}</p>
              <p className="text-xs text-muted-foreground mt-1">For {flight.from} → {flight.to}</p>
            </div>
            <div className="space-y-2">
              <Label>Target Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                <Input 
                  type="number" 
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="pl-8 text-lg font-bold h-12 rounded-xl"
                  required
                  max={flight.price - 1}
                />
              </div>
              <p className="text-xs text-muted-foreground">We'll notify you when the price drops below this amount.</p>
            </div>
            <Button type="submit" disabled={createAlertMut.isPending} className="w-full h-12 rounded-xl bg-primary text-white font-bold">
              {createAlertMut.isPending ? "Saving..." : "Create Alert"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
