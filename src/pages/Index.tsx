import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { SimpleConfigPanel, SimpleConfig } from "@/components/scheduler/SimpleConfigPanel";
import { ScheduleOutput } from "@/components/scheduler/ScheduleOutput";
import { ScheduleControls } from "@/components/scheduler/ScheduleControls";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import {
  generateOptimalSchedule,
  SchedulerData,
  ScheduleResult,
} from "@/lib/scheduler";
import { Flag } from "lucide-react";

const DEFAULT_CONFIG: SimpleConfig = {
  players: [],
  weekCount: 6,
  aggregateWeeks: new Set(),
  availability: {},
  preferredPairs: new Map(),
  forbiddenPairs: new Set(),
};

const EXAMPLE_CONFIG: SimpleConfig = {
  players: ["Scott", "Mark", "Gary", "Greg", "Ken", "Bob", "Chris", "Dave"],
  weekCount: 6,
  aggregateWeeks: new Set(["2", "4", "6"]),
  availability: {
    "1": ["Scott", "Mark", "Gary", "Greg", "Bob", "Chris"],
    "2": ["Scott", "Mark", "Ken", "Bob", "Dave"],
    "3": ["Scott", "Gary", "Ken", "Bob", "Chris", "Dave"],
    "4": ["Scott", "Mark", "Greg", "Ken", "Dave"],
    "5": ["Scott", "Mark", "Gary", "Ken", "Bob", "Chris"],
    "6": ["Gary", "Greg", "Ken", "Bob", "Dave"],
  },
  preferredPairs: new Map([["Mark|Scott", 2], ["Gary|Greg", 3]]),
  forbiddenPairs: new Set(["Greg|Scott"]),
};

const Index = () => {
  const [config, setConfig] = useState<SimpleConfig>(DEFAULT_CONFIG);
  const [iterations, setIterations] = useState(2000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<SchedulerData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleResult | null>(null);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const handleLoadExample = useCallback(() => {
    setConfig(EXAMPLE_CONFIG);
    toast.success("Example configuration loaded");
  }, []);

  const handleClear = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setSchedule(null);
    setData(null);
    toast.info("Configuration cleared");
  }, []);

  // Convert SimpleConfig to SchedulerData
  const convertToSchedulerData = (cfg: SimpleConfig): SchedulerData => {
    const weeks = Array.from({ length: cfg.weekCount }, (_, i) => String(i + 1));
    
    return {
      players: cfg.players,
      weeks,
      availability: cfg.availability,
      aggregateWeeks: cfg.aggregateWeeks,
      preferredPairs: cfg.preferredPairs,
      forbiddenPairs: cfg.forbiddenPairs,
      objectives: {
        UNIQUE_PAIRINGS: 8,
        MINIMIZE_SITOUTS: 6,
        PREFERRED_PAIRS: 7,
        MAX_PAIR_REPEATS: 3,
      },
    };
  };

  const handleGenerate = useCallback(async () => {
    if (isGenerating) return;

    if (config.players.length < 2) {
      toast.error("Add at least 2 players to generate a schedule");
      return;
    }

    try {
      const schedulerData = convertToSchedulerData(config);
      setData(schedulerData);
      setIsGenerating(true);
      setProgress(0);

      const result = await generateOptimalSchedule(
        schedulerData,
        iterations,
        (p) => setProgress(p)
      );

      setSchedule(result);
      toast.success("Schedule generated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate schedule");
    } finally {
      setIsGenerating(false);
    }
  }, [config, iterations, isGenerating]);

  // Keyboard shortcut for generating schedule
  useKeyboardShortcut("Enter", handleGenerate, { ctrl: true });

  const handleCopy = useCallback(() => {
    if (!schedule || !data) {
      toast.warning("No schedule to copy");
      return;
    }

    let text = "Golf Group Schedule\n\n";
    data.weeks.forEach((week) => {
      const weekData = schedule.schedule[week];
      if (!weekData) return;

      text += `Week ${week}${data.aggregateWeeks.has(week) ? " (Aggregate)" : ""}\n`;
      weekData.forEach((item) => {
        if (item.sitout) {
          text += `  ${item.sitout} sits out\n`;
        } else {
          text += `  ${item.a} + ${item.b}\n`;
        }
      });
      text += "\n";
    });

    navigator.clipboard.writeText(text);
    toast.success("Schedule copied to clipboard");
  }, [schedule, data]);

  const handleExport = useCallback(() => {
    if (!schedule || !data) {
      toast.warning("No schedule to export");
      return;
    }

    let csv = "Week,Player1,Player2,Sitout\n";

    data.weeks.forEach((week) => {
      const weekData = schedule.schedule[week] || [];
      weekData.forEach((item) => {
        if (item.sitout) {
          csv += `${week},,${item.sitout},Yes\n`;
        } else {
          csv += `${week},${item.a},${item.b},No\n`;
        }
      });
    });

    csv += "\nStatistics\n";
    csv += "Metric,Value\n";
    csv += `Unique Pairings,${schedule.scoreResult?.stats.uniquePairs ?? 0}\n`;
    csv += `Total Sitouts,${schedule.scoreResult?.stats.totalSitouts ?? 0}\n`;
    csv += `Preferred Pairs Used,${schedule.scoreResult?.stats.preferredUsed ?? 0}\n`;
    csv += `Pairing Repeats,${schedule.scoreResult?.stats.pairRepeats ?? 0}\n`;
    csv += `Optimization Score,${schedule.scoreResult?.score ?? 0}\n`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `golf-schedule_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  }, [schedule, data]);

  return (
    <div className="min-h-screen bg-background">
      <ThemeToggle />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Flag className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Golf Group Scheduler
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Optimize pairings for golf or any group activity
          </p>
        </header>

        {/* Controls */}
        <div className="mb-6">
          <ScheduleControls
            iterations={iterations}
            onIterationsChange={setIterations}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleConfigPanel
            config={config}
            onChange={setConfig}
            onLoadExample={handleLoadExample}
            onClear={handleClear}
          />
          <ScheduleOutput
            data={data}
            schedule={schedule}
            isGenerating={isGenerating}
            progress={progress}
            onCopy={handleCopy}
            onExport={handleExport}
          />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>Press Ctrl/Cmd + Enter to generate schedule quickly</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
