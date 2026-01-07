import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Copy, Download, Loader2 } from "lucide-react";
import { WeekCard } from "./WeekCard";
import { StatisticsPanel } from "./StatisticsPanel";
import { SchedulerData, ScheduleResult } from "@/lib/scheduler";

interface ScheduleOutputProps {
  data: SchedulerData | null;
  schedule: ScheduleResult | null;
  isGenerating: boolean;
  progress: number;
  onCopy: () => void;
  onExport: () => void;
}

export function ScheduleOutput({
  data,
  schedule,
  isGenerating,
  progress,
  onCopy,
  onExport,
}: ScheduleOutputProps) {
  const hasSchedule = schedule && data;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Schedule Output</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCopy}
              disabled={!hasSchedule || isGenerating}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onExport}
              disabled={!hasSchedule || isGenerating}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating optimal schedule...</p>
            <div className="w-full max-w-xs">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        ) : hasSchedule ? (
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            <ScrollArea className="flex-1 pr-4">
              <div className="grid gap-4">
                {data.weeks.map((week) => {
                  const weekData = schedule.schedule[week];
                  if (!weekData) return null;

                  return (
                    <WeekCard
                      key={week}
                      week={week}
                      pairings={weekData}
                      isAggregate={data.aggregateWeeks.has(week)}
                      pairCounts={schedule.pairCounts}
                      sitOuts={schedule.sitOuts}
                      preferredPairs={data.preferredPairs}
                    />
                  );
                })}
              </div>
            </ScrollArea>
            <StatisticsPanel
              stats={schedule.scoreResult?.stats ?? null}
              score={schedule.scoreResult?.score ?? null}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Configure and generate a schedule to see results</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
