import { Badge } from "@/components/ui/badge";
import { Pairing } from "@/lib/scheduler";
import { Users, UserMinus } from "lucide-react";

interface WeekCardProps {
  week: string;
  pairings: Pairing[];
  isAggregate: boolean;
  pairCounts: Map<string, number>;
  sitOuts: Map<string, number>;
  preferredPairs: Map<string, number>;
}

export function WeekCard({
  week,
  pairings,
  isAggregate,
  pairCounts,
  sitOuts,
  preferredPairs,
}: WeekCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <h3 className="font-semibold text-lg">Week {week}</h3>
        {isAggregate && (
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            Aggregate
          </Badge>
        )}
      </div>
      <div className="space-y-2">
        {pairings.map((pairing, idx) => {
          if (pairing.sitout) {
            const totalSitouts = sitOuts.get(pairing.sitout) || 0;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-md bg-destructive/10 border border-destructive/20"
              >
                <div className="flex items-center gap-2 text-destructive">
                  <UserMinus className="h-4 w-4" />
                  <span className="font-medium">{pairing.sitout} sits out</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Total: {totalSitouts}
                </span>
              </div>
            );
          }

          const pairKey = [pairing.a, pairing.b].sort().join('|');
          const count = pairCounts.get(pairKey) || 0;
          const preferredLimit = preferredPairs.get(pairKey);
          const isRepeat = count > 1;

          return (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-md bg-primary/5 border border-primary/10 transition-colors hover:bg-primary/10"
            >
              <div className="flex items-center gap-2 text-primary">
                <Users className="h-4 w-4" />
                <span className="font-medium">
                  {pairing.a} + {pairing.b}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isRepeat ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
                  {count}×
                </span>
                {preferredLimit && (
                  <Badge variant="outline" className="text-xs">
                    max {preferredLimit}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
