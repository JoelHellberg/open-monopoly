import { GameData } from "@/types/gameTypes";
import { create } from "zustand";

type GameDataZustand = {
  data: GameData | null;
  ownPlayerId: string;
  update: (data_in: GameData) => void;
  setPlayerId: (playerId_in: string) => void;
};

export const useGameData = create<GameDataZustand>((set) => ({
  data: null,
  ownPlayerId: "1N1w1vzDqYb5xnqE4Zvz1SowbBl2",
  update: (data_in) =>
    set({
      data: data_in,
    }),
  setPlayerId: (playerId_in) =>
    set({
      ownPlayerId: playerId_in,
    }),
}));
