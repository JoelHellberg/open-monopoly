"use server";

import { getRTDBAdmin } from "@/app/_lib/firebaseAdmin";
import { GameSettings } from "@/types/gameTypes";
import { getPlayerId } from "./helperFunctions";
import { fetchGameData, fetchPlayerData, updatePlayerData } from "./database";
import { getDefaultGameSettings } from "../gameSettingsConstants";

export async function updateGameSettings(
  sessionId: string,
  settings: Partial<GameSettings>
) {
  const playerId = await getPlayerId();
  const gameData = await fetchGameData(sessionId);

  // Only the host can change settings, and only before the game starts
  if (playerId !== gameData.host) {
    throw new Error("Only the host can change settings");
  }

  if (gameData.gameIsOn) {
    throw new Error("Cannot change settings after the game has started");
  }

  const rtdb = await getRTDBAdmin();
  const currentSettings = gameData.settings || getDefaultGameSettings();
  
  const updatedSettings: GameSettings = {
    ...currentSettings,
    ...settings,
  };

  // If starting money is being changed, update all players' money
  if (settings.startingMoney && settings.startingMoney !== currentSettings.startingMoney) {
    for (const pid of gameData.playersInSession) {
      const playerData = await fetchPlayerData(pid, sessionId);
      playerData.money = settings.startingMoney;
      await updatePlayerData(pid, sessionId, playerData);
    }
  }

  await rtdb.ref(`games/${sessionId}/settings`).set(updatedSettings);
}
