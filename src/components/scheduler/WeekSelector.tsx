import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Star } from "lucide-react";

interface WeekSelectorProps {
  weekCount: number;
  onWeekCountChange: (count: number) => void;
  aggregateWeeks: Set<string>;
  onAggregateWeeksChange: (weeks: Set<string>) => void;
}

export function WeekSelector({
  weekCount,
  onWeekCountChange,
  aggregateWeeks,
  onAggregateWeeksChange,
}: WeekSelectorProps) {
  const weeks = Array.from({ length: weekCount }, (_, i) => String(i + 1));

  const toggleAggregate = (week: string) => {
    const newSet = new Set(aggregateWeeks);
    if (newSet.has(week)) {
      newSet.delete(week);
    } else {
      newSet.add(week);
    }
    onAggregateWeeksChange(newSet);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <h3 className="font-medium">Weeks</h3>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="weekCount" className="text-sm text-muted-foreground whitespace-nowrap">
            Number of weeks:
          </Label>
          <Input
            id="weekCount"
            type="number"
            min={1}
            max={52}
            value={weekCount}
            onChange={(e) => onWeekCountChange(Math.max(1, Math.min(52, parseInt(e.target.value) || 1)))}
            className="w-20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="h-3 w-3" />
          <span>Select aggregate weeks (special scoring weeks):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {weeks.map((week) => (
            <label
              key={week}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md border cursor-pointer transition-colors
                ${aggregateWeeks.has(week) 
                  ? 'bg-accent text-accent-foreground border-accent' 
                  : 'bg-card border-border hover:bg-muted/50'}
              `}
            >
              <Checkbox
                checked={aggregateWeeks.has(week)}
                onCheckedChange={() => toggleAggregate(week)}
                className="sr-only"
              />
              <span className="text-sm font-medium">Week {week}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
