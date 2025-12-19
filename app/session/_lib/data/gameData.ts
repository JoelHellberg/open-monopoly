import {
  GameData,
  Ownable,
  Ownables,
  Player,
  Players,
} from "@/types/gameTypes";
import { create } from "zustand";

type GameDataZustand = {
  data: GameData | null;
  players: Players | null;
  ownables: Ownables | null;

  ownPlayerId: string;

  updateGameData: (data_in: GameData) => void;
  updatePlayerData: (player_in: Player) => void;
  updateOwnableData: (ownable_in: Ownable) => void;

  setOwnPlayerId: (playerId_in: string) => void;
};

export const useGameData = create<GameDataZustand>((set) => ({
  data: null,
  players: null,
  ownables: null,

  ownPlayerId: "1N1w1vzDqYb5xnqE4Zvz1SowbBl2",

  updateGameData: (data_in) =>
    set({
      data: data_in,
    }),
  updatePlayerData: (player_in) =>
    set((state) => ({
      players: {
        ...(state.players ?? {}),
        [player_in.id]: {
          ...(state.players?.[player_in.id] ?? {}),
          ...player_in,
        },
      },
    })),
  updateOwnableData: (ownable_in) =>
    set((state) => ({
      ownables: {
        ...(state.ownables ?? {}),
        [ownable_in.id]: {
          ...(state.ownables?.[ownable_in.id] ?? {}),
          ...ownable_in,
        },
      },
    })),

  setOwnPlayerId: (playerId_in) =>
    set({
      ownPlayerId: playerId_in,
    }),
}));
