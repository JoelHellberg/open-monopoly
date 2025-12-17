"use server"

import { getFirestoreAdmin } from "@/app/_lib/firebaseAdmin";
import defaultBoard from "@/data/boards/default";

export async function throwDice(sessionId: string, playerId: string) {
  const db = await getFirestoreAdmin();

  // Roll the dice
  const diceOne = Math.floor(Math.random() * 6) + 1;
  const diceTwo = Math.floor(Math.random() * 6) + 1;
  const playerMovement = diceOne + diceTwo;

  // Update dice values in the gameData document
  await db
    .collection("gameData")
    .doc(sessionId)
    .update({
      diceOne: diceOne,
      diceTwo: diceTwo,
    });

  // Get current player position
  const playerDocRef = db
    .collection("gameData")
    .doc(sessionId)
    .collection("players")
    .doc(playerId);

  const playerSnapshot = await playerDocRef.get();
  if (!playerSnapshot.exists) throw new Error("Player not found");

  const playerData = playerSnapshot.data();
  const currentPos = playerData?.pos ?? 0;
  const board = defaultBoard;

  // Update player position
  await playerDocRef.update({
    pos: (currentPos + playerMovement) % (board.length - 1),
  });
}


export async function purchase() {}
