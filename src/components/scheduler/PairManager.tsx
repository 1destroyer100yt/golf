import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, X, Heart, Ban } from "lucide-react";

interface PairManagerProps {
  players: string[];
  preferredPairs: Map<string, number>;
  forbiddenPairs: Set<string>;
  onPreferredChange: (pairs: Map<string, number>) => void;
  onForbiddenChange: (pairs: Set<string>) => void;
}

export function PairManager({
  players,
  preferredPairs,
  forbiddenPairs,
  onPreferredChange,
  onForbiddenChange,
}: PairManagerProps) {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [maxTimes, setMaxTimes] = useState(2);

  const addPreferredPair = () => {
    if (player1 && player2 && player1 !== player2) {
      const key = [player1, player2].sort().join("|");
      const newPairs = new Map(preferredPairs);
      newPairs.set(key, maxTimes);
      onPreferredChange(newPairs);
      setPlayer1("");
      setPlayer2("");
    }
  };

  const removePreferredPair = (key: string) => {
    const newPairs = new Map(preferredPairs);
    newPairs.delete(key);
    onPreferredChange(newPairs);
  };

  const addForbiddenPair = () => {
    if (player1 && player2 && player1 !== player2) {
      const key = [player1, player2].sort().join("|");
      const newPairs = new Set(forbiddenPairs);
      newPairs.add(key);
      onForbiddenChange(newPairs);
      setPlayer1("");
      setPlayer2("");
    }
  };

  const removeForbiddenPair = (key: string) => {
    const newPairs = new Set(forbiddenPairs);
    newPairs.delete(key);
    onForbiddenChange(newPairs);
  };

  const formatPair = (key: string) => {
    const [a, b] = key.split("|");
    return `${a} & ${b}`;
  };

  if (players.length < 2) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Pair Preferences</h3>
        </div>
        <p className="text-sm text-muted-foreground">Add at least 2 players to set pair preferences</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-primary" />
        <h3 className="font-medium">Pair Preferences</h3>
      </div>

      {/* Player Selection */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[120px]">
          <Select value={player1} onValueChange={setPlayer1}>
            <SelectTrigger>
              <SelectValue placeholder="Player 1" />
            </SelectTrigger>
            <SelectContent>
              {players.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[120px]">
          <Select value={player2} onValueChange={setPlayer2}>
            <SelectTrigger>
              <SelectValue placeholder="Player 2" />
            </SelectTrigger>
            <SelectContent>
              {players.filter(p => p !== player1).map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          type="number"
          min={1}
          max={10}
          value={maxTimes}
          onChange={(e) => setMaxTimes(parseInt(e.target.value) || 2)}
          className="w-16"
          title="Max times together"
        />
        <Button onClick={addPreferredPair} size="sm" variant="outline" className="gap-1">
          <Heart className="h-3 w-3" />
          Prefer
        </Button>
        <Button onClick={addForbiddenPair} size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive">
          <Ban className="h-3 w-3" />
          Forbid
        </Button>
      </div>

      {/* Preferred Pairs */}
      {preferredPairs.size > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Heart className="h-3 w-3 text-success" /> Preferred pairs:
          </span>
          <div className="flex flex-wrap gap-2">
            {Array.from(preferredPairs.entries()).map(([key, max]) => (
              <Badge key={key} variant="outline" className="bg-success/10 border-success/30 gap-1 pr-1">
                {formatPair(key)} (max {max})
                <button onClick={() => removePreferredPair(key)} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Forbidden Pairs */}
      {forbiddenPairs.size > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Ban className="h-3 w-3 text-destructive" /> Forbidden pairs:
          </span>
          <div className="flex flex-wrap gap-2">
            {Array.from(forbiddenPairs).map((key) => (
              <Badge key={key} variant="outline" className="bg-destructive/10 border-destructive/30 gap-1 pr-1">
                {formatPair(key)}
                <button onClick={() => removeForbiddenPair(key)} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
