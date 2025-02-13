import { motion } from "framer-motion";
import { useGameState } from "@/lib/game-state";
import { useToast } from "@/hooks/use-toast";

export default function ClickerArea() {
  const { player, click } = useGameState();
  const { toast } = useToast();

  if (!player) return null;

  const handleClick = () => {
    if (player.energy <= 0) {
      toast({
        title: "Нет энергии!",
        description: "Подождите пока энергия восстановится",
        variant: "destructive"
      });
      return;
    }

    click();
  };

  return (
    <div className="flex items-center justify-center py-12">
      <motion.button
        className="w-48 h-48 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-lg hover:shadow-primary/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
      >
        VI
      </motion.button>
    </div>
  );
}