"use server";

import defaultBoard from "@/data/boards/default";
import {
  assertPlayerActionAllowed,
  calculateStreetRent,
  getPlayerId,
  isPropertyForSale,
  setPlayersStatus,
  updatePlayerStatus,
} from "./helperFunctions";
import { Ownable, Player } from "@/types/gameTypes";
import {
  fetchOwnableData,
  fetchPlayerData,
  updatePlayerData,
} from "./database";

export async function processLanding(sessionId: string, tilePos: number) {
  switch (defaultBoard[tilePos].type) {
    case "event":
      await handleEvent(sessionId);
      return;
    case "ownable":
      if (await isPropertyForSale(sessionId)) {
        const playerId: string = await getPlayerId();
        await setPlayersStatus(sessionId, playerId, "BUYING");
      } else await handleLandingOnProperty(sessionId);
      return;
  }
}

async function handleLandingOnProperty(sessionId: string) {
  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  const board = defaultBoard;
  const ownableData: Ownable = await fetchOwnableData(
    board[playerData.pos].name,
    sessionId
  );

  if (ownableData.owner === playerId) {
    await setPlayersStatus(sessionId, playerId, "FINISHING");
    return;
  }

  const rent = await calculateStreetRent(ownableData);

  playerData.money -= rent;

  if (playerData.money >= 0) playerData.status = "FINISHING";
  else playerData.status = "DEBTED";

  await updatePlayerData(playerId, sessionId, playerData);
}

async function handleEvent(sessionId: string) {
  const playerId: string = await getPlayerId();
  //tilfälligt
  await setPlayersStatus(sessionId, playerId, "FINISHING");
}
