import { Checkbox } from "@/components/ui/checkbox";
import { CalendarCheck } from "lucide-react";

interface AvailabilityGridProps {
  players: string[];
  weeks: string[];
  availability: Record<string, string[]>;
  onChange: (availability: Record<string, string[]>) => void;
}

export function AvailabilityGrid({
  players,
  weeks,
  availability,
  onChange,
}: AvailabilityGridProps) {
  const toggleAvailability = (week: string, player: string) => {
    const weekPlayers = availability[week] || [];
    const newWeekPlayers = weekPlayers.includes(player)
      ? weekPlayers.filter((p) => p !== player)
      : [...weekPlayers, player];
    
    onChange({
      ...availability,
      [week]: newWeekPlayers,
    });
  };

  const setAllAvailable = () => {
    const newAvailability: Record<string, string[]> = {};
    weeks.forEach((week) => {
      newAvailability[week] = [...players];
    });
    onChange(newAvailability);
  };

  const isAvailable = (week: string, player: string) => {
    return (availability[week] || []).includes(player);
  };

  if (players.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Availability</h3>
        </div>
        <p className="text-sm text-muted-foreground">Add players first to set availability</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Availability</h3>
        </div>
        <button
          onClick={setAllAvailable}
          className="text-xs text-primary hover:underline"
        >
          Set all available
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2 font-medium text-muted-foreground">Player</th>
              {weeks.map((week) => (
                <th key={week} className="p-2 text-center font-medium text-muted-foreground">
                  W{week}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player} className="border-t border-border">
                <td className="p-2 font-medium">{player}</td>
                {weeks.map((week) => (
                  <td key={week} className="p-2 text-center">
                    <Checkbox
                      checked={isAvailable(week, player)}
                      onCheckedChange={() => toggleAvailability(week, player)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
