"use server";

import { getRTDBAdmin } from "@/app/_lib/firebaseAdmin";
import defaultBoard from "@/data/boards/default";
import { endPlayersTurn, processLanding, startPlayersTurn } from "./gameLogic";
import { GameData, Ownable, Player } from "@/types/gameTypes";
import {
  assertPlayerActionAllowed,
  getPlayerId,
  updatePlayerStatus,
  setPlayersStatus,
} from "./helperFunctions";
import {
  fetchGameData,
  fetchOwnableData,
  fetchPlayerData,
  updateGameData,
  updateOwnableData,
  updatePlayerData,
} from "./database";
import { Gothic_A1 } from "next/font/google";

export async function startGame(sessionId: string) {
  const playerId: string = await getPlayerId();
  const gameData: GameData = await fetchGameData(sessionId);

  // Make sure the player trying to start is the host!
  if (playerId === gameData.host) {
    gameData.gameIsOn = true;
    await updateGameData(sessionId, gameData);
    const firstPlayersId = gameData.playersInSession[gameData.currentPlayer];
    await startPlayersTurn(sessionId, firstPlayersId);
  }
}

export async function throwDice(sessionId: string) {
  if (!(await assertPlayerActionAllowed("THROW_DICE", sessionId))) return;

  const playerId: string = await getPlayerId();
  const rtdb = await getRTDBAdmin();

  const { playerMovement, rolledDoubles } = await rollDice(sessionId, rtdb);

  walkTheBoard(sessionId, playerId, rtdb, playerMovement, rolledDoubles);
}

export async function rollJail(sessionId: string) {
  if (!(await assertPlayerActionAllowed("ROLL_JAIL", sessionId))) return;

  const playerId: string = await getPlayerId();
  const rtdb = await getRTDBAdmin();

  const { playerMovement, rolledDoubles } = await rollDice(sessionId, rtdb);

  if (rolledDoubles) {
    await setPlayersStatus(sessionId, playerId, "PLAYING");
    walkTheBoard(sessionId, playerId, rtdb, playerMovement, rolledDoubles);
  }
  else {
    await endPlayersTurn(sessionId, playerId);
  }
}

export async function payJail(sessionId: string) {
  if (!(await assertPlayerActionAllowed("PAY_JAIL", sessionId))) return;

  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  playerData.money -= 50;
  playerData.status = "PLAYING";

  await updatePlayerData(playerId, sessionId, playerData);
}

async function rollDice(sessionId: string, rtdb: any): Promise<{ playerMovement: number; rolledDoubles: boolean }> {
  // Roll the dice
  const diceOne = Math.floor(Math.random() * 6) + 1;
  const diceTwo = Math.floor(Math.random() * 6) + 1;

  const playerMovement = diceOne + diceTwo;
  const rolledDoubles = diceOne === diceTwo;

  // Update dice values in the gameData node
  const gameRef = rtdb.ref(`games/${sessionId}`);
  await gameRef.update({
    diceOne,
    diceTwo,
  });

  return { playerMovement, rolledDoubles };
}

async function walkTheBoard(sessionId: string, playerId: string, rtdb: any, playerMovement: number, rolledDoubles: boolean) {
  // Get current player position
  const playerRef = rtdb.ref(`games/${sessionId}/players/${playerId}`);
  const playerSnapshot = await playerRef.get();

  if (!playerSnapshot.exists()) throw new Error("Player not found");

  const playerData = playerSnapshot.val();
  const currentPos = playerData.pos ?? 0;

  let newPlayerMoney = playerData.money;
  // Gain 200 if passed Go
  if (currentPos + playerMovement >= defaultBoard.length) newPlayerMoney += 200;

  // Calculate new player position
  let newPlayerPos =
    (currentPos + playerMovement) % (defaultBoard.length - 1);

  // Calculate number of doubles in a row
  let newDoublesInRow = playerData.doublesInRow;
  if (rolledDoubles) newDoublesInRow += 1;

  // If 3rd double send to jail
  if (newDoublesInRow >= 3) {
    const jailIndex = defaultBoard.findIndex(
      (tile) => tile.subtype === "jail"
    );
    newPlayerPos = jailIndex;
    newDoublesInRow = 0;
    await playerRef.update({
      pos: newPlayerPos,
      doublesInRow: newDoublesInRow,
    });
    await setPlayersStatus(sessionId, playerId, "JAIL");
    endTurn(sessionId);
  }
  else {
    // Update player position and number of doubles
    await playerRef.update({
      pos: newPlayerPos,
      doublesInRow: newDoublesInRow,
      money: newPlayerMoney,
    });

    // Call your landing logic
    await processLanding(sessionId, newPlayerPos);
  }
}

export async function purchase(sessionId: string) {
  if (!(await assertPlayerActionAllowed("BUY_PROPERTY", sessionId))) return;

  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);
  const tile = defaultBoard[playerData.pos];

  // Ensure ownables array exists
  if (!Array.isArray(playerData.ownables)) {
    playerData.ownables = [];
  }
  // Get the ownable for the player's current position
  const ownableId = tile.name;
  const ownableData: Ownable = await fetchOwnableData(ownableId, sessionId);

  if (tile.type === "ownable" && playerData.money >= tile.price) {
    playerData.money -= tile.price;
  }

  // Update local objects
  playerData.ownables.push(ownableId);
  ownableData.owner = playerId;

  // Write updates back to the database
  await updatePlayerData(playerId, sessionId, playerData);
  await updateOwnableData(ownableId, sessionId, ownableData);

  updatePlayerStatus(sessionId, playerId);
}

export async function auction() { }

export async function bidAuction() { }

export async function endTurn(sessionId: string) {
  if (!(await assertPlayerActionAllowed("END_TURN", sessionId))) return;

  const currentPlayerId: string = await getPlayerId();
  endPlayersTurn(sessionId, currentPlayerId);
}

export async function callUpdatePlayerStatus(sessionId: string) {
  const playerId: string = await getPlayerId();
  updatePlayerStatus(sessionId, playerId);
}

export async function goToJail(sessionId: string) {
  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);
  playerData.status = "JAIL";
  playerData.pos = defaultBoard.findIndex((tile) => tile.subtype === "jail");
  await updatePlayerData(playerId, sessionId, playerData);
  endPlayersTurn(sessionId, playerId);
}