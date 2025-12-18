"use server";

import { getRTDBAdmin } from "@/app/_lib/firebaseAdmin";
import defaultBoard from "@/data/boards/default";
import { processLanding } from "./gameLogic";
import { Ownable, Player } from "@/types/gameTypes";
import { assertPlayerActionAllowed, getPlayerId, updatePlayerStatus } from "./helperFunctions";
import {
  fetchOwnableData,
  fetchPlayerData,
  updateOwnableData,
  updatePlayerData,
} from "./database";

export async function throwDice(sessionId: string) {
  if (!(await assertPlayerActionAllowed("THROW_DICE", sessionId))) return;

  const playerId: string = await getPlayerId();
  const rtdb = await getRTDBAdmin();

  // Roll the dice
  const diceOne = Math.floor(Math.random() * 6) + 1;
  const diceTwo = Math.floor(Math.random() * 6) + 1;
  const playerMovement = diceOne + diceTwo;

  // Update dice values in the gameData node
  const gameRef = rtdb.ref(`games/${sessionId}`);
  await gameRef.update({
    diceOne,
    diceTwo,
  });

  // Get current player position
  const playerRef = rtdb.ref(`games/${sessionId}/players/${playerId}`);
  const playerSnapshot = await playerRef.get();

  if (!playerSnapshot.exists()) throw new Error("Player not found");

  const playerData = playerSnapshot.val();
  const currentPos = playerData.pos ?? 0;

  // Calculate new player position
  const newPlayerPos =
    (currentPos + playerMovement) % (defaultBoard.length - 1);

  // Update player position
  await playerRef.update({
    pos: newPlayerPos,
  });

  // Call your landing logic
  await processLanding(sessionId, newPlayerPos);
}

export async function purchase(sessionId: string) {
  if (!(await assertPlayerActionAllowed("BUY_PROPERTY", sessionId))) return;

  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  // Ensure ownables array exists
  if (!Array.isArray(playerData.ownables)) {
    playerData.ownables = [];
  }
  // Get the ownable for the player's current position
  const ownableId = defaultBoard[playerData.pos].name;
  const ownableData: Ownable = await fetchOwnableData(ownableId, sessionId);

  // Update local objects
  playerData.ownables.push(ownableId);
  ownableData.owner = playerId;

  // Write updates back to the database
  await updatePlayerData(playerId, sessionId, playerData);
  await updateOwnableData(ownableId, sessionId, ownableData);

  updatePlayerStatus(sessionId);
}

export async function auction() {}

export async function bidAuction() {}

export async function endTurn() {}
