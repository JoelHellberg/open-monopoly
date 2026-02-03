import { GameDataRTDB } from "@/types/databaseTypes";
import { GameData } from "@/types/gameTypes";

export function normalizeGameData(
  raw: GameDataRTDB
): GameData {
  return {
    ...raw,
    playersInSession: raw.playersInSession
      ? Object.keys(raw.playersInSession)
      : [],
    gameChatMessages: raw.gameChatMessages ?? {},
    trades: raw.trades ?? {},
  };
}

function arrayToRTDBMap(arr: string[]): Record<string, true> {
  return Object.fromEntries(arr.map((id) => [id, true]));
}
