import { Progress } from "@/components/ui/progress";
import { useGameState } from "@/lib/game-state";

export default function EnergyBar() {
  const { player } = useGameState();

  if (!player) return null;

  return (
    <div className="space-y-2 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-primary/20">
      <div className="flex justify-between">
        <span className="text-sm font-medium">Энергия</span>
        <span className="text-sm font-medium">{player.energy}/100</span>
      </div>
      <Progress 
        value={player.energy} 
        className="h-3 bg-primary/20"
      />
    </div>
  );
}