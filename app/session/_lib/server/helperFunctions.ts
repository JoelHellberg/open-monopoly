"use server";

import { verifyGameSession } from "@/app/_lib/session";
import { Ownable, Player } from "@/types/gameTypes";
import {
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
  switch (action) {
    case "THROW_DICE":
      return await assertCanThrowDice(sessionId);
    case "BUY_PROPERTY":
      return await assertCanBuyProperty(sessionId);
  }
  return true;
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

  return isPropertyForSale(sessionId);
}

export async function isPropertyForSale(sessionId: string) {
  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  const street = defaultBoard[playerData.pos];
  if (street.type !== "ownable") return false;

  const ownableData: Ownable = await fetchOwnableData(street.name, sessionId);
  if (ownableData.owner !== "") return false;

  return playerData.money > ownableData.cost;
}

export async function updatePlayerStatus(sessionId: string) {
  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  switch (playerData.status) {
    case "":
      setPlayersStatus(sessionId, "PLAYING");
    case "PLAYING":
      // Just denna är oklar eftersom processLanding() typ gör detta??
      return;
    case "BUYING":
      await setPlayersStatus(sessionId, "FINISHING");
      return;
    case "FINISHING":
      endPlayersTurn(sessionId);
      return;

    case "VACATION":
      await setPlayersStatus(sessionId, "");
      return;

    case "JAIL":
      await setPlayersStatus(sessionId, "JAIL1");
      return;
    case "JAIL1":
      await setPlayersStatus(sessionId, "JAIL2");
      return;
    case "JAIL2":
      await setPlayersStatus(sessionId, "JAIL3");
      return;
    case "JAIL3":
      await setPlayersStatus(sessionId, "");
      return;
  }
}

export async function setPlayersStatus(sessionId: string, status: string) {
  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  playerData.status = status;
  await updatePlayerData(playerId, sessionId, playerData);
}

export async function endPlayersTurn(sessionId: string) {
  // tillfälligt
  await setPlayersStatus(sessionId, "PLAYING");
}
