import { Card, CardContent } from "@/components/ui/card";
import { ScoreResult } from "@/lib/scheduler";
import { Users, UserMinus, Heart, Repeat } from "lucide-react";

interface StatisticsPanelProps {
  stats: ScoreResult['stats'] | null;
  score: number | null;
}

export function StatisticsPanel({ stats, score }: StatisticsPanelProps) {
  const statItems = [
    {
      label: "Unique Pairings",
      value: stats?.uniquePairs ?? 0,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Total Sit-outs",
      value: stats?.totalSitouts ?? 0,
      icon: UserMinus,
      color: "text-destructive",
    },
    {
      label: "Preferred Pairs",
      value: stats?.preferredUsed ?? 0,
      icon: Heart,
      color: "text-accent",
    },
    {
      label: "Pair Repeats",
      value: stats?.pairRepeats ?? 0,
      icon: Repeat,
      color: "text-muted-foreground",
    },
  ];

  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-4">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center p-3 rounded-lg bg-card border border-border"
            >
              <item.icon className={`h-5 w-5 mb-2 ${item.color}`} />
              <span className="text-2xl font-bold">{item.value}</span>
              <span className="text-xs text-muted-foreground text-center">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div className="text-center p-4 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20">
          <span className="text-sm text-muted-foreground block mb-1">
            Optimization Score
          </span>
          <span className="text-4xl font-bold text-primary">
            {score ?? 0}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
