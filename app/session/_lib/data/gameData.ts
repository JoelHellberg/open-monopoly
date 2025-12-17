import { GameData } from "@/types/gameTypes";
import { create } from "zustand";

type GameDataZustand = {
  data: GameData | null;
  update: (data_in: GameData) => void;
};

export const useGameData = create<GameDataZustand>((set) => ({
  data: null,
  update: (data_in) =>
    set({
      data: data_in,
    }),
}));
