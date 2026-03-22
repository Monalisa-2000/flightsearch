import { Layout } from "@/components/layout";
import { useGetNotifications } from "@workspace/api-client-react";
import { useApiAuthOptions, useAuth } from "@/hooks/use-auth";
import { Bell, TrendingDown, Info, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const apiOpts = useApiAuthOptions();
  const { data, isLoading } = useGetNotifications({
    request: apiOpts.request,
    query: { enabled: isAuthenticated }
  });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center max-w-lg">
          <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold text-primary mb-4">Sign in required</h2>
          <p className="text-muted-foreground mb-8">You need to be signed in to view notifications.</p>
        </div>
      </Layout>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'price_drop': return <TrendingDown className="w-6 h-6 text-green-500" />;
      case 'alert_triggered': return <ShieldAlert className="w-6 h-6 text-accent" />;
      default: return <Info className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-display font-bold text-primary mb-8 flex items-center gap-3">
          <Bell className="text-accent" /> Activity Hub
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-secondary/50 rounded-xl animate-pulse" />)}
          </div>
        ) : data?.length === 0 ? (
          <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-border/50">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-primary mb-2">All caught up</h3>
            <p className="text-muted-foreground">You don't have any notifications right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.map(notif => (
              <div key={notif.id} className={`p-6 rounded-2xl border transition-all flex gap-4 ${notif.read ? 'bg-background border-border/50' : 'bg-accent/5 border-accent/20 shadow-sm'}`}>
                <div className="mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-lg font-bold ${notif.read ? 'text-primary' : 'text-primary'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap ml-4">
                      {format(new Date(notif.createdAt), "MMM d, HH:mm")}
                    </span>
                  </div>
                  <p className={`${notif.read ? 'text-muted-foreground' : 'text-primary/80 font-medium'}`}>
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
