import { Layout } from "@/components/layout";
import { FlightSearchForm } from "@/components/flight-search-form";
import { useGetTrendingDestinations } from "@workspace/api-client-react";
import { Compass, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Home() {
  const { data: trending } = useGetTrendingDestinations();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero background" 
            className="w-full h-full object-cover opacity-90 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/50 to-background"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-accent/20 text-accent font-semibold text-sm mb-6 border border-accent/30 backdrop-blur-md">
            New A.I. Powered Search
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            Find perfect flights. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-200">
              Never miss a deal.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12">
            Intelligent flight search with real-time price tracking and predictive alerts. Travel smarter, not harder.
          </p>
          
          <FlightSearchForm />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background relative -mt-10 rounded-t-[3rem] z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <Zap className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-display text-primary mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground leading-relaxed">Our advanced caching layer ensures you get results in milliseconds, not minutes.</p>
            </div>
            <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-6 shadow-lg shadow-accent/20">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-display text-primary mb-3">Price Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">Set alerts and let our background workers monitor prices 24/7. We'll ping you when prices drop.</p>
            </div>
            <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <ShieldCheck className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-display text-primary mb-3">A/B Optimized</h3>
              <p className="text-muted-foreground leading-relaxed">Constantly evolving interface and ranking algorithms to ensure you see the best value first.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-20 bg-secondary/20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-10">
            <Compass className="w-8 h-8 text-accent" />
            <h2 className="text-3xl md:text-4xl font-display">Trending Destinations</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending?.slice(0,4).map((dest) => (
              <Link key={dest.code} href={`/search?to=${dest.code}&date=${format(new Date(Date.now() + 86400000 * 30), 'yyyy-MM-dd')}`}>
                <div className="group rounded-3xl overflow-hidden relative h-80 cursor-pointer shadow-lg">
                  <img src={dest.imageUrl} alt={dest.city} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent p-6 flex flex-col justify-end">
                    <h3 className="text-2xl font-display text-white font-bold">{dest.city}</h3>
                    <p className="text-white/80">{dest.country}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-3 py-1 bg-accent rounded-full text-xs font-bold text-white shadow-md">
                        From ${dest.avgPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
