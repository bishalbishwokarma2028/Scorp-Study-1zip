import { useUser } from "@clerk/react";
import { useGetHistory, useGetDailyUsage, getGetHistoryQueryKey, getGetDailyUsageQueryKey } from "@workspace/api-client-react";
import { History, Brain, FileText, Image, Network, Languages, BarChart2, Flame, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  quiz: Brain,
  summary: FileText,
  image: Image,
  mindmap: Network,
  translation: Languages,
};

const TYPE_COLORS: Record<string, string> = {
  quiz: "bg-purple-100 text-purple-700",
  summary: "bg-orange-100 text-orange-700",
  image: "bg-pink-100 text-pink-700",
  mindmap: "bg-cyan-100 text-cyan-700",
  translation: "bg-indigo-100 text-indigo-700",
  chat: "bg-blue-100 text-blue-700",
};

const PIE_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#EC4899", "#06B6D4"];

export default function HistoryPage() {
  const { user } = useUser();

  const { data: historyData, isLoading: loadingHistory } = useGetHistory(
    { query: { queryKey: getGetHistoryQueryKey(), enabled: !!user } }
  );

  const { data: usageData, isLoading: loadingUsage } = useGetDailyUsage(
    { query: { queryKey: getGetDailyUsageQueryKey(), enabled: !!user } }
  );

  if (loadingHistory || loadingUsage) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const analytics = historyData?.analytics;
  const items = historyData?.items ?? [];
  const usage = usageData;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <History className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">History & Analytics</h1>
          <p className="text-sm text-muted-foreground">Your study activity and insights</p>
        </div>
      </div>

      {usage && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-1">AI Queries Today</p>
              <p className="text-2xl font-bold text-foreground">{usage.aiQueries}<span className="text-sm text-muted-foreground">/{usage.aiQueriesLimit}</span></p>
              <Progress value={(usage.aiQueries / usage.aiQueriesLimit) * 100} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-1">Images Today</p>
              <p className="text-2xl font-bold text-foreground">{usage.imagesGenerated}<span className="text-sm text-muted-foreground">/{usage.imagesLimit}</span></p>
              <Progress value={(usage.imagesGenerated / usage.imagesLimit) * 100} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-1">This Week</p>
              <p className="text-2xl font-bold text-primary">{analytics?.totalQueriesThisWeek ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">AI queries</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <p className="text-xs text-muted-foreground">Study Streak</p>
              </div>
              <p className="text-2xl font-bold text-orange-500">{analytics?.studyStreakDays ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analytics.queriesByDay?.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" /> Queries This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={analytics.queriesByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {analytics.usageByFeature?.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Usage by Feature</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={analytics.usageByFeature.filter((f) => f.count > 0)} dataKey="count" nameKey="feature" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                        {analytics.usageByFeature.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {analytics.usageByFeature.filter((f) => f.count > 0).map((f, i) => (
                      <div key={f.feature} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="capitalize">{f.feature}</span>
                        </div>
                        <span className="font-semibold">{f.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activity yet. Start using ScorpStudy tools!</p>
          ) : (
            <div className="space-y-3">
              {items.slice(0, 20).map((item) => {
                const Icon = TYPE_ICONS[item.type] || History;
                return (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors" data-testid={`history-item-${item.id}`}>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", TYPE_COLORS[item.type] || "bg-gray-100 text-gray-600")}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <Badge variant="outline" className="text-xs capitalize flex-shrink-0">{item.type}</Badge>
                      </div>
                      {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                    </div>
                    <p className="text-xs text-muted-foreground flex-shrink-0">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
