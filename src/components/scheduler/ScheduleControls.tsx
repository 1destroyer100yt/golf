import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Settings2 } from "lucide-react";

interface ScheduleControlsProps {
  iterations: number;
  onIterationsChange: (value: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function ScheduleControls({
  iterations,
  onIterationsChange,
  onGenerate,
  isGenerating,
}: ScheduleControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-card border border-border shadow-sm">
      <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
        <Settings2 className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">Iterations:</span>
        <Slider
          value={[iterations]}
          onValueChange={([value]) => onIterationsChange(value)}
          min={100}
          max={10000}
          step={100}
          className="flex-1 min-w-[120px]"
        />
        <span className="text-sm font-semibold text-primary min-w-[50px] text-right">
          {iterations.toLocaleString()}
        </span>
      </div>
      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        size="lg"
        className="w-full sm:w-auto"
      >
        <Play className="h-4 w-4 mr-2" />
        Generate Schedule
      </Button>
    </div>
  );
}
