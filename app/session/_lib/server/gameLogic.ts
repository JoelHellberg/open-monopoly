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
import { GameData, Ownable, Player } from "@/types/gameTypes";
import {
  fetchGameData,
  fetchOwnableData,
  fetchPlayerData,
  updateGameData,
  updatePlayerData,
} from "./database";

export async function startPlayersTurn(sessionId: string, playerId: string) {
  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  if (playerData.status === "") await updatePlayerStatus(sessionId, playerId);
  else endPlayersTurn(sessionId, playerId);
}

export async function processLanding(sessionId: string, tilePos: number) {
  switch (defaultBoard[tilePos].type) {
    case "event":
      await handleEvent(sessionId, tilePos);
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
  // Calculate if doubles
  const gameData: GameData = await fetchGameData(sessionId);
  const rolledDoubles = gameData.diceOne == gameData.diceTwo;

  if (ownableData.owner === playerId) {
    if (rolledDoubles) await setPlayersStatus(sessionId, playerId, "PLAYING");
    else await setPlayersStatus(sessionId, playerId, "FINISHING");
    return;
  }

  const rent = await calculateStreetRent(ownableData);

  playerData.money -= rent;

  if (playerData.money >= 0) {
    if (rolledDoubles) playerData.status = "PLAYING";
    else playerData.status = "FINISHING";
  } 
  else playerData.status = "DEBTED";

  await updatePlayerData(playerId, sessionId, playerData);
}

async function handleEvent(sessionId: string, tilePos: number) {
  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  switch (defaultBoard[tilePos].subtype) {
    case "go":
      playerData.money += 300;
      await updatePlayerData(playerId, sessionId, playerData);
      break;
    case "jail":
      // Shouldn't do anything
      break;
    case "parking":
      // no money storage implemented yet
      break;
    case "toJail":
      break; // remove this later, no way to get out of jail now
      const jailIndex = defaultBoard.findIndex(
        (tile) => tile.subtype === "jail"
      );
      playerData.pos = jailIndex;
      await updatePlayerData(playerId, sessionId, playerData);
      await setPlayersStatus(sessionId, playerId, "JAIL");
      return;
    case "tax":
      playerData.money -= defaultBoard[tilePos].amount;
      await updatePlayerData(playerId, sessionId, playerData);
      break;
    case "chance":
      // temporary
      break;
    case "chest":
      // temporary
      break;
  }
  // Calculate if doubles
  const gameData: GameData = await fetchGameData(sessionId);
  const rolledDoubles = gameData.diceOne == gameData.diceTwo;
  if (rolledDoubles) await setPlayersStatus(sessionId, playerId, "PLAYING");
  else await setPlayersStatus(sessionId, playerId, "FINISHING");
}

export async function endPlayersTurn(sessionId: string, playerId: string) {
  await updatePlayerStatus(sessionId, playerId);

  const gameData: GameData = await fetchGameData(sessionId);
  gameData.currentPlayer =
    (gameData.currentPlayer + 1) % gameData.playersInSession.length;
  await updateGameData(sessionId, gameData);

  const newPlayerId = gameData.playersInSession[gameData.currentPlayer];
  await startPlayersTurn(sessionId, newPlayerId);
}
