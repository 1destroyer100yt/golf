import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Users } from "lucide-react";

interface PlayerManagerProps {
  players: string[];
  onChange: (players: string[]) => void;
}

export function PlayerManager({ players, onChange }: PlayerManagerProps) {
  const [newPlayer, setNewPlayer] = useState("");

  const addPlayer = () => {
    const name = newPlayer.trim();
    if (name && !players.includes(name)) {
      onChange([...players, name]);
      setNewPlayer("");
    }
  };

  const removePlayer = (player: string) => {
    onChange(players.filter((p) => p !== player));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPlayer();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="font-medium">Players</h3>
        <Badge variant="secondary" className="ml-auto">
          {players.length}
        </Badge>
      </div>
      
      <div className="flex gap-2">
        <Input
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter player name..."
          className="flex-1"
        />
        <Button onClick={addPlayer} size="icon" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-md bg-muted/30 border border-border">
        {players.length === 0 ? (
          <span className="text-sm text-muted-foreground">No players added yet</span>
        ) : (
          players.map((player) => (
            <Badge
              key={player}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {player}
              <button
                onClick={() => removePlayer(player)}
                className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
