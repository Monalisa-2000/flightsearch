import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaneTakeoff, PlaneLanding, Calendar, Users, Search } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";

export function FlightSearchForm() {
  const [, setLocation] = useLocation();
  const [from, setFrom] = useState("SFO");
  const [to, setTo] = useState("JFK");
  const [date, setDate] = useState<string>(format(new Date(Date.now() + 86400000 * 14), 'yyyy-MM-dd'));
  const [passengers, setPassengers] = useState("1");
  const [cabin, setCabin] = useState("economy");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      from,
      to,
      date,
      passengers,
      cabin
    });
    setLocation(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="glass-panel p-6 sm:p-8 rounded-3xl w-full max-w-5xl mx-auto shadow-2xl relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="space-y-2">
          <Label className="text-primary font-semibold flex items-center gap-2 text-xs uppercase tracking-wider">
            <PlaneTakeoff className="w-4 h-4 text-accent" /> From
          </Label>
          <Input 
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="City or Airport" 
            className="h-14 rounded-xl border-border/60 bg-white/80 focus:bg-white text-lg font-medium"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-primary font-semibold flex items-center gap-2 text-xs uppercase tracking-wider">
            <PlaneLanding className="w-4 h-4 text-accent" /> To
          </Label>
          <Input 
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="City or Airport" 
            className="h-14 rounded-xl border-border/60 bg-white/80 focus:bg-white text-lg font-medium"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-primary font-semibold flex items-center gap-2 text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-accent" /> Date
          </Label>
          <Input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-14 rounded-xl border-border/60 bg-white/80 focus:bg-white text-lg font-medium"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-primary font-semibold flex items-center gap-2 text-xs uppercase tracking-wider">
            <Users className="w-4 h-4 text-accent" /> Travelers & Cabin
          </Label>
          <div className="flex gap-2">
            <Input 
              type="number"
              min="1"
              max="9"
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="h-14 w-20 rounded-xl border-border/60 bg-white/80 focus:bg-white text-lg font-medium text-center"
            />
            <Select value={cabin} onValueChange={setCabin}>
              <SelectTrigger className="h-14 rounded-xl border-border/60 bg-white/80 focus:bg-white text-lg font-medium">
                <SelectValue placeholder="Cabin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="first">First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-end">
          <Button 
            type="submit"
            className="w-full h-14 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-lg shadow-lg shadow-accent/30 hover:-translate-y-1 transition-all duration-300"
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
