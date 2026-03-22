import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { FlightCard } from "@/components/flight-card";
import { useSearchFlights } from "@workspace/api-client-react";
import { Plane, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SearchFlightsSort = "cheapest" | "fastest" | "best";

export default function SearchResults() {
  const [params, setParams] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<SearchFlightsSort>("best");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const p: Record<string, string> = {};
    searchParams.forEach((value, key) => p[key] = value);
    setParams(p);
    if (p.sort) setSort(p.sort as SearchFlightsSort);
  }, []);

  const { data, isLoading, error } = useSearchFlights({
    from: params.from || "SFO",
    to: params.to || "JFK",
    date: params.date || new Date().toISOString().split('T')[0],
    passengers: Number(params.passengers) || 1,
    sort
  }, {
    query: {
      enabled: !!params.from && !!params.to
    }
  });

  const handleSortChange = (val: string) => {
    setSort(val as SearchFlightsSort);
  };

  return (
    <Layout>
      <div className="bg-primary pt-10 pb-20 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                {params.from || "SFO"} <ArrowRight className="text-accent" /> {params.to || "JFK"}
              </h1>
              <p className="text-white/70 mt-2 text-lg">
                {params.date} • {params.passengers || 1} Passenger(s)
              </p>
            </div>
            
            {data && (
              <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-md">
                <p className="text-sm font-medium">Search Performance</p>
                <div className="flex gap-4 mt-2">
                  <div className="text-xs">
                    <span className="text-white/60">Time:</span> <strong className="text-accent">{data.meta.searchDurationMs}ms</strong>
                  </div>
                  <div className="text-xs">
                    <span className="text-white/60">Cache:</span> 
                    <strong className={data.meta.cacheHit ? "text-green-400" : "text-yellow-400"}>
                      {data.meta.cacheHit ? " HIT" : " MISS"}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-10 pb-20">
        <div className="bg-background rounded-2xl shadow-xl p-2 border border-border/50 mb-8 max-w-fit mx-auto md:mx-0">
          <Tabs value={sort} onValueChange={handleSortChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-secondary/50 rounded-xl">
              <TabsTrigger value="best" className="rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Best Value</TabsTrigger>
              <TabsTrigger value="cheapest" className="rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Cheapest</TabsTrigger>
              <TabsTrigger value="fastest" className="rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Fastest</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading && (
          <div className="py-32 flex flex-col items-center justify-center text-primary">
            <Loader2 className="w-12 h-12 animate-spin text-accent mb-4" />
            <p className="font-display text-xl">Searching hundreds of airlines...</p>
          </div>
        )}

        {error && (
          <div className="py-20 flex flex-col items-center text-center max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h3 className="text-2xl font-bold text-primary mb-2">Search Failed</h3>
            <p className="text-muted-foreground">We encountered an error while searching for flights. Please try again later.</p>
          </div>
        )}

        {data && data.flights.length === 0 && (
          <div className="py-20 flex flex-col items-center text-center max-w-md mx-auto">
            <img src={`${import.meta.env.BASE_URL}images/empty-state.png`} alt="No flights" className="w-48 h-48 mb-6 drop-shadow-xl" />
            <h3 className="text-2xl font-bold text-primary mb-2">No flights found</h3>
            <p className="text-muted-foreground">Try adjusting your dates or destinations to find more options.</p>
          </div>
        )}

        {data && data.flights.length > 0 && (
          <div className="space-y-4 max-w-4xl">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-2 mb-4">
              Showing {data.flights.length} flights
            </p>
            {data.flights.map((flight, i) => (
              <FlightCard key={flight.id} flight={flight} index={i} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
