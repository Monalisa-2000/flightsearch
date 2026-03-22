import { Layout } from "@/components/layout";
import { useGetAlerts, useDeleteAlert } from "@workspace/api-client-react";
import { useApiAuthOptions, useAuth } from "@/hooks/use-auth";
import { Bell, Trash2, ArrowRight, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Alerts() {
  const { isAuthenticated } = useAuth();
  const apiOpts = useApiAuthOptions();
  const { data: alerts, isLoading } = useGetAlerts({
    request: apiOpts.request,
    query: { enabled: isAuthenticated }
  });
  const deleteAlertMut = useDeleteAlert(apiOpts);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    try {
      await deleteAlertMut.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({ title: "Alert deleted" });
    } catch (err) {
      toast({ title: "Error deleting alert", variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center max-w-lg">
          <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold text-primary mb-4">Sign in required</h2>
          <p className="text-muted-foreground mb-8">You need to be signed in to view and manage your price alerts.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-secondary/30 py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-display font-bold flex items-center gap-3">
            <Bell className="text-accent w-10 h-10" /> Your Price Alerts
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">We monitor prices 24/7 so you don't have to.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : alerts?.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
             <img src={`${import.meta.env.BASE_URL}images/empty-state.png`} alt="No alerts" className="w-48 h-48 mx-auto mb-6 drop-shadow-xl" />
            <h3 className="text-2xl font-bold text-primary mb-2">No active alerts</h3>
            <p className="text-muted-foreground mb-8">Search for a flight and click "Alert Me" to track prices.</p>
            <Link href="/search">
              <Button className="rounded-xl h-12 px-8 bg-primary">Search Flights</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts?.map(alert => (
              <div key={alert.id} className="bg-card rounded-2xl p-6 border border-border shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                {alert.status === 'triggered' && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
                )}
                {alert.status === 'active' && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <Badge variant="outline" className={`
                    ${alert.status === 'active' ? 'bg-accent/10 text-accent border-accent/20' : ''}
                    ${alert.status === 'triggered' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
                    ${alert.status === 'expired' ? 'bg-muted text-muted-foreground' : ''}
                  `}>
                    {alert.status.toUpperCase()}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(alert.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl font-display font-bold text-primary">{alert.fromAirport}</span>
                  <ArrowRight className="text-muted-foreground w-5 h-5" />
                  <span className="text-2xl font-display font-bold text-primary">{alert.toAirport}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Target Price</p>
                    <p className="text-xl font-bold text-primary">${alert.targetPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current Price</p>
                    <p className={`text-xl font-bold ${alert.currentPrice <= alert.targetPrice ? 'text-green-600 flex items-center gap-1' : 'text-primary'}`}>
                      ${alert.currentPrice}
                      {alert.currentPrice <= alert.targetPrice && <TrendingDown className="w-4 h-4" />}
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-xs text-muted-foreground flex justify-between">
                  <span>Created: {format(new Date(alert.createdAt), 'MMM d, yyyy')}</span>
                  {alert.lastCheckedAt && <span>Checked: {format(new Date(alert.lastCheckedAt), 'HH:mm')}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
