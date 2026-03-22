import { Layout } from "@/components/layout";
import { useGetWorkerStatus, useTriggerWorker } from "@workspace/api-client-react";
import { Activity, Server, Clock, Zap, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Status() {
  const { data, isLoading } = useGetWorkerStatus();
  const triggerMut = useTriggerWorker();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleTrigger = async () => {
    try {
      const res = await triggerMut.mutateAsync();
      toast({ title: "Worker Triggered", description: res.message });
      queryClient.invalidateQueries({ queryKey: ["/api/worker/status"] });
    } catch (err) {
      toast({ title: "Failed to trigger worker", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary flex items-center gap-3">
              <Activity className="text-accent w-8 h-8" /> System Status
            </h1>
            <p className="text-muted-foreground mt-2">Background worker and service health.</p>
          </div>
          <Button 
            onClick={handleTrigger} 
            disabled={triggerMut.isPending || data?.status === 'running'}
            className="rounded-xl bg-primary shadow-lg"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Force Worker Run
          </Button>
        </div>

        {isLoading ? (
          <div className="h-64 bg-secondary/50 rounded-2xl animate-pulse" />
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Status Card */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <Server className="w-6 h-6 text-muted-foreground" />
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    data.status === 'running' ? 'bg-accent/20 text-accent' : 
                    data.status === 'idle' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {data.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Worker State</h3>
                <p className="text-2xl font-display font-bold text-primary capitalize">{data.status}</p>
              </div>
            </div>

            {/* Run Counts */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
              <div>
                <Zap className="w-6 h-6 text-accent mb-4" />
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-primary font-medium">Alerts Checked</span>
                    <span className="font-bold text-xl">{data.alertsChecked}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-primary font-medium">Alerts Triggered</span>
                    <span className="font-bold text-xl text-green-600">{data.alertsTriggered}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-medium">Total Runs</span>
                    <span className="font-bold text-xl">{data.runCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
              <div>
                <Clock className="w-6 h-6 text-primary mb-4" />
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Schedule</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Run</p>
                    <p className="font-medium text-primary bg-secondary/50 p-2 rounded-lg text-sm font-mono">
                      {data.lastRun ? format(new Date(data.lastRun), 'yyyy-MM-dd HH:mm:ss') : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Next Scheduled Run</p>
                    <p className="font-medium text-primary bg-secondary/50 p-2 rounded-lg text-sm font-mono">
                      {data.nextRun ? format(new Date(data.nextRun), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </Layout>
  );
}
