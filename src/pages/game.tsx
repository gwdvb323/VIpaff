import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClickerArea from "@/components/game/clicker-area";
import EnergyBar from "@/components/game/energy-bar";
import { useGameState } from "@/lib/game-state";

export default function Game() {
  const { player, initializePlayer } = useGameState();

  useEffect(() => {
    initializePlayer();
  }, []);

  if (!player) return null;

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-xl font-medium bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
            {player.coins} VIcoins
          </div>
          <Link href="/shop">
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Store className="mr-2 h-4 w-4" />
              Магазин
            </Button>
          </Link>
        </div>

        <ClickerArea />
        <EnergyBar />
      </div>
    </motion.div>
  );
}