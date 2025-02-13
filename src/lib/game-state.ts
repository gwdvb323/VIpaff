import { create } from "zustand";
import { apiRequest } from "./queryClient";
import { type Player } from "@shared/schema";

interface GameState {
  player: Player | null;
  lastClickTime: number;
  initializePlayer: () => Promise<void>;
  click: () => void;
  buyItem: (itemId: string) => void;
}

// Конфигурация товаров
const SHOP_ITEMS = {
  // Одноразки
  hqd_cuvie: { price: 100 },
  hqd_cuvie_plus: { price: 150 },
  elf_bar_600: { price: 120 },
  elf_bar_1500: { price: 200 },
  // Жидкости
  salt_25: { price: 80 },
  salt_20: { price: 70 },
  classic_6: { price: 50 },
  classic_12: { price: 60 },
  // Аксессуары
  cart_standard: { price: 30 },
  cart_mesh: { price: 40 },
  coil_regular: { price: 20 },
  coil_mesh: { price: 25 }
};

const CLICK_COOLDOWN = 200; // Минимальное время между кликами (мс) для защиты от автокликера

export const useGameState = create<GameState>((set, get) => ({
  player: null,
  lastClickTime: 0,

  initializePlayer: async () => {
    try {
      const res = await apiRequest("POST", "/api/players", { username: "player1" });
      const player = await res.json();
      set({ player });

      // Запускаем регенерацию энергии
      setInterval(() => {
        const { player } = get();
        if (!player || player.energy >= 100) return;

        set({
          player: {
            ...player,
            energy: Math.min(100, player.energy + 1)
          }
        });
      }, 1000);

    } catch (error) {
      console.error("Failed to initialize player:", error);
    }
  },

  click: () => {
    const { player, lastClickTime } = get();
    const currentTime = Date.now();

    // Защита от автокликера
    if (currentTime - lastClickTime < CLICK_COOLDOWN) {
      console.warn("Clicking too fast!");
      return;
    }

    if (!player || player.energy <= 0) return;

    set({
      player: {
        ...player,
        coins: player.coins + 1, // Базовое значение монет за клик
        totalClicks: player.totalClicks + 1,
        energy: player.energy - 1
      },
      lastClickTime: currentTime
    });
  },

  buyItem: (itemId: string) => {
    const { player } = get();
    if (!player) return;

    const item = SHOP_ITEMS[itemId as keyof typeof SHOP_ITEMS];
    if (!item) {
      console.error("Item not found:", itemId);
      return;
    }

    if (player.coins < item.price) {
      console.warn("Not enough coins!");
      return;
    }

    set({
      player: {
        ...player,
        coins: player.coins - item.price
      }
    });

    // TODO: Добавить сохранение покупки в инвентарь игрока
    console.log("Item purchased:", itemId);
  }
}));