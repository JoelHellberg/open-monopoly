"use server";

import { getRTDBAdmin } from "@/app/_lib/firebaseAdmin";
import defaultBoard from "@/data/boards/default";
import { processLanding } from "./gameLogic";

export async function throwDice(sessionId: string, playerId: string) {
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
  await processLanding(playerId, sessionId, newPlayerPos);
}

export async function purchase(sessionId: string, playerId: string) {}

export async function auction() {}

export async function bidAuction() {}

export async function endTurn() {}
