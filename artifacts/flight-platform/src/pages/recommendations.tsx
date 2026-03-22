import { Layout } from "@/components/layout";
import { useGetRecommendations } from "@workspace/api-client-react";
import { useApiAuthOptions } from "@/hooks/use-auth";
import { Sparkles, MapPin, Calendar, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Recommendations() {
  const apiOpts = useApiAuthOptions();
  const { data, isLoading } = useGetRecommendations({}, apiOpts);

  return (
    <Layout>
      <div className="bg-primary pt-16 pb-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <Sparkles className="w-12 h-12 text-accent mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Curated For You</h1>
          <p className="text-xl text-white/80">
            {data?.basedOn || "AI-powered travel recommendations based on global trends and pricing data."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-20 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-96 bg-white rounded-3xl animate-pulse shadow-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.recommendations.map((rec, i) => (
              <div key={i} className="bg-card rounded-3xl overflow-hidden shadow-xl border border-border/50 group flex flex-col">
                <div className="h-56 relative overflow-hidden">
                  <img 
                    src={rec.destination.imageUrl} 
                    alt={rec.destination.city} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="text-3xl font-display font-bold text-white mb-1 flex items-center gap-2">
                        {rec.destination.city}
                      </h3>
                      <p className="text-white/80 flex items-center gap-1 text-sm font-medium">
                        <MapPin className="w-4 h-4" /> {rec.destination.country}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-accent text-white font-bold border-none shadow-lg py-1 px-3 text-sm">
                      ~ ${rec.estimatedPrice}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rec.destination.tags.map(tag => (
                      <span key={tag} className="text-xs font-semibold px-2 py-1 bg-secondary text-primary rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-muted-foreground mb-6 flex-1 leading-relaxed">
                    {rec.reason}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Calendar className="w-4 h-4 text-accent" />
                      Best time: {rec.bestMonthToVisit}
                    </div>
                    <Link href={`/search?to=${rec.destination.code}`}>
                      <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-accent hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
