"use server";

import { verifyGameSession } from "@/app/_lib/session";
import { GameData, Ownable, Player } from "@/types/gameTypes";
import {
  fetchGameData,
  fetchOwnableData,
  fetchPlayerData,
  updatePlayerData,
} from "./database";
import defaultBoard from "@/data/boards/default";

export async function getPlayerId(): Promise<string> {
  const { playerId: id } = await verifyGameSession();
  return id as string;
}

export async function assertPlayerActionAllowed(
  action: string,
  sessionId: string
): Promise<boolean> {
  const gameData: GameData = await fetchGameData(sessionId);
  if (!gameData.gameIsOn) return false;

  const isPlayersTurn =
    gameData.playersInSession[gameData.currentPlayer] === (await getPlayerId());
  if (!isPlayersTurn) return false;

  switch (action) {
    case "THROW_DICE":
      return await assertCanThrowDice(sessionId);
    case "BUY_PROPERTY":
      return await assertCanBuyProperty(sessionId);
    case "END_TURN":
      return true;
  }
  return false;
}

async function assertCanThrowDice(sessionId: string): Promise<boolean> {
  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  return playerData.status === "PLAYING";
}

async function assertCanBuyProperty(sessionId: string): Promise<boolean> {
  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);
  if (playerData.status !== "BUYING") return false;

  const street = defaultBoard[playerData.pos];
  const ownableData: Ownable = await fetchOwnableData(street.name, sessionId);

  return (
    (await isPropertyForSale(sessionId)) && playerData.money > ownableData.cost
  );
}

export async function isPropertyForSale(sessionId: string): Promise<boolean> {
  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  const street = defaultBoard[playerData.pos];
  if (street.type !== "ownable") return false;

  const ownableData: Ownable = await fetchOwnableData(street.name, sessionId);
  if (ownableData.owner !== "") return false;

  return true;
}

export async function updatePlayerStatus(sessionId: string, playerId: string) {
  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  switch (playerData.status) {
    case "":
      setPlayersStatus(sessionId, playerId, "PLAYING");
    case "PLAYING":
      // Just denna är oklar eftersom processLanding() typ gör detta??
      return;
    case "BUYING":
      const gameData: GameData = await fetchGameData(sessionId);
      const rolledDoubles = gameData.diceOne == gameData.diceTwo;
      if (rolledDoubles) {
        setPlayersStatus(sessionId, playerId, "PLAYING");
      } else await setPlayersStatus(sessionId, playerId, "FINISHING");
      return;
    case "FINISHING":
      playerData.doublesInRow = 0;
      await updatePlayerData(playerId, sessionId, playerData);
      await setPlayersStatus(sessionId, playerId, "");
      return;

    case "VACATION":
      await setPlayersStatus(sessionId, playerId, "");
      return;

    case "JAIL":
      await setPlayersStatus(sessionId, playerId, "JAIL1");
      return;
    case "JAIL1":
      await setPlayersStatus(sessionId, playerId, "JAIL2");
      return;
    case "JAIL2":
      await setPlayersStatus(sessionId, playerId, "JAIL3");
      return;
    case "JAIL3":
      await setPlayersStatus(sessionId, playerId, "");
      return;
  }
}

export async function setPlayersStatus(
  sessionId: string,
  playerId: string,
  status: string
) {
  const playerData: Player = await fetchPlayerData(playerId, sessionId);
  playerData.status = status;
  await updatePlayerData(playerId, sessionId, playerData);
}

export async function calculateStreetRent(ownable: Ownable): Promise<number> {
  // tillfälligt
  return ownable.rent[0];
}
