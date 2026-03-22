import { Layout } from "@/components/layout";
import { useGetExperimentResults } from "@workspace/api-client-react";
import { LineChart, Beaker, Users, MousePointerClick, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Experiments() {
  const { data, isLoading } = useGetExperimentResults({ experimentId: 'ranking-algo-v2' });

  const chartData = data ? [
    {
      metric: 'Click Through Rate (%)',
      Control: data.control.clickThroughRate * 100,
      Treatment: data.treatment.clickThroughRate * 100,
    },
    {
      metric: 'Conversion Rate (%)',
      Control: data.control.conversionRate * 100,
      Treatment: data.treatment.conversionRate * 100,
    }
  ] : [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary flex items-center gap-3">
              <Beaker className="text-accent w-8 h-8" /> A/B Experiment Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Monitoring active algorithmic adjustments and UI tests.</p>
          </div>
          {data && (
            <div className="text-right">
              <span className="text-sm font-semibold text-muted-foreground block mb-1">Experiment Status</span>
              <span className="inline-block px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full text-sm border border-green-200">
                ACTIVE • {data.experimentId}
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="h-96 rounded-2xl bg-secondary/50 animate-pulse" />
        ) : data ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <Users className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Users</h3>
                <p className="text-3xl font-display font-bold text-primary">
                  {(data.control.users + data.treatment.users).toLocaleString()}
                </p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <MousePointerClick className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Clicks</h3>
                <p className="text-3xl font-display font-bold text-primary">
                  {(data.control.clicks + data.treatment.clicks).toLocaleString()}
                </p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <Target className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Conversions</h3>
                <p className="text-3xl font-display font-bold text-primary">
                  {(data.control.conversions + data.treatment.conversions).toLocaleString()}
                </p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm bg-gradient-to-br from-primary to-primary/90 text-white">
                <LineChart className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-1">Confidence Score</h3>
                <p className="text-3xl font-display font-bold text-white">
                  {(data.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="text-xl font-display font-bold text-primary mb-8">Performance Metrics</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <Tooltip 
                        cursor={{fill: '#f1f5f9'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                      <Bar dataKey="Control" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      <Bar dataKey="Treatment" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center">
                <h3 className="text-xl font-display font-bold text-primary mb-6 text-center">Current Winner</h3>
                <div className="text-center p-8 bg-secondary/50 rounded-xl border border-border">
                  {data.winner ? (
                    <>
                      <div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/30">
                        <Target className="w-10 h-10" />
                      </div>
                      <h4 className="text-3xl font-display font-bold text-primary uppercase tracking-wider">{data.winner}</h4>
                      <p className="text-muted-foreground mt-2 font-medium">Outperforming variant</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                        <LineChart className="w-10 h-10" />
                      </div>
                      <h4 className="text-2xl font-display font-bold text-primary">Inconclusive</h4>
                      <p className="text-muted-foreground mt-2">More data needed</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
