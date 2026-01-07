import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Trash2, Settings } from "lucide-react";
import { PlayerManager } from "./PlayerManager";
import { WeekSelector } from "./WeekSelector";
import { AvailabilityGrid } from "./AvailabilityGrid";
import { PairManager } from "./PairManager";

export interface SimpleConfig {
  players: string[];
  weekCount: number;
  aggregateWeeks: Set<string>;
  availability: Record<string, string[]>;
  preferredPairs: Map<string, number>;
  forbiddenPairs: Set<string>;
}

interface SimpleConfigPanelProps {
  config: SimpleConfig;
  onChange: (config: SimpleConfig) => void;
  onLoadExample: () => void;
  onClear: () => void;
}

export function SimpleConfigPanel({
  config,
  onChange,
  onLoadExample,
  onClear,
}: SimpleConfigPanelProps) {
  const weeks = Array.from({ length: config.weekCount }, (_, i) => String(i + 1));

  const updateConfig = (partial: Partial<SimpleConfig>) => {
    onChange({ ...config, ...partial });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Configuration</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onLoadExample}>
              <FileText className="h-4 w-4 mr-2" />
              Example
            </Button>
            <Button variant="outline" size="sm" onClick={onClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Players */}
            <PlayerManager
              players={config.players}
              onChange={(players) => updateConfig({ players })}
            />

            <Separator />

            {/* Weeks */}
            <WeekSelector
              weekCount={config.weekCount}
              onWeekCountChange={(weekCount) => updateConfig({ weekCount })}
              aggregateWeeks={config.aggregateWeeks}
              onAggregateWeeksChange={(aggregateWeeks) => updateConfig({ aggregateWeeks })}
            />

            <Separator />

            {/* Availability */}
            <AvailabilityGrid
              players={config.players}
              weeks={weeks}
              availability={config.availability}
              onChange={(availability) => updateConfig({ availability })}
            />

            <Separator />

            {/* Pair Preferences */}
            <PairManager
              players={config.players}
              preferredPairs={config.preferredPairs}
              forbiddenPairs={config.forbiddenPairs}
              onPreferredChange={(preferredPairs) => updateConfig({ preferredPairs })}
              onForbiddenChange={(forbiddenPairs) => updateConfig({ forbiddenPairs })}
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
