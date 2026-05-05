import { GameSettings } from "@/types/gameTypes";

export function getDefaultGameSettings(): GameSettings {
  return {
    startingMoney: 1500,
    selectedBoard: "default",
    freeParkingMoney: false,
    allowHouseShortage: false,
  };
}
