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
  hasMonopoly,
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

export async function useJailFreeCard(sessionId: string) {
  if (!(await assertPlayerActionAllowed("USE_JAIL_FREE_CARD", sessionId))) return;

  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  playerData.jailFreeCards -= 1;
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
    (currentPos + playerMovement) % (defaultBoard.length);

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
  ownableData.incomePercent = { [playerId]: 100 };

  // Write updates back to the database
  await updatePlayerData(playerId, sessionId, playerData);
  await updateOwnableData(ownableId, sessionId, ownableData);

  updatePlayerStatus(sessionId, playerId);
}

export async function auction() { }

export async function bidAuction() { }

export async function sellProperty(sessionId: string, tileName: string) {
  if (!(await assertPlayerActionAllowed("SELL_PROPERTY", sessionId))) return;

  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);
  const ownableData: Ownable = await fetchOwnableData(tileName, sessionId);

  if (ownableData.owner === playerId && ownableData.housesAmount === 0) {
    // Update local objects
    playerData.money += ownableData.price / 2;
    ownableData.owner = "";
    ownableData.incomePercent = {};
    ownableData.freeRent = [];
    playerData.ownables = playerData.ownables.filter((ownable) => ownable !== tileName);

    // Write updates back to the database
    await updatePlayerData(playerId, sessionId, playerData);
    await updateOwnableData(tileName, sessionId, ownableData);
  }
}

export async function mortgageProperty(sessionId: string, tileName: string) {
  if (!(await assertPlayerActionAllowed("MORTGAGE_PROPERTY", sessionId))) return;

  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);
  const ownableData: Ownable = await fetchOwnableData(tileName, sessionId);
  // If the player owns the property and has no houses and it's not mortgaged
  if (ownableData.owner === playerId && ownableData.housesAmount === 0 && !ownableData.mortgaged) {
    // Update local objects
    playerData.money += ownableData.price / 2;
    ownableData.mortgaged = true;

    // Write updates back to the database
    await updatePlayerData(playerId, sessionId, playerData);
    await updateOwnableData(tileName, sessionId, ownableData);
  }
  // If the player owns the property and it's mortgaged
  else if (ownableData.owner === playerId && ownableData.mortgaged) {
    // Update local objects
    playerData.money -= Math.round(ownableData.price / 2 * 1.1);
    ownableData.mortgaged = false;

    // Write updates back to the database
    await updatePlayerData(playerId, sessionId, playerData);
    await updateOwnableData(tileName, sessionId, ownableData);
  }
}

export async function buyHouse(sessionId: string, tileName: string) {
  if (!(await assertPlayerActionAllowed("BUY_HOUSE", sessionId))) return;
  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);
  const ownableData: Ownable = await fetchOwnableData(tileName, sessionId);
  const canBuyHouse = playerData.money >= ownableData.houseCost &&
    ownableData.housesAmount < 5 && await hasMonopoly(ownableData, playerData) && !ownableData.mortgaged;

  if (canBuyHouse) {
    // Update local objects
    playerData.money -= ownableData.houseCost;
    ownableData.housesAmount += 1;
  }
  // Write updates back to the database
  await updatePlayerData(playerId, sessionId, playerData);
  await updateOwnableData(tileName, sessionId, ownableData);
}

export async function sellHouse(sessionId: string, tileName: string) {
  if (!(await assertPlayerActionAllowed("SELL_HOUSE", sessionId))) return;

  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);
  const ownableData: Ownable = await fetchOwnableData(tileName, sessionId);

  if (ownableData.type === "property" && ownableData.housesAmount > 0 && ownableData.owner === playerId) {
    // Update local objects
    playerData.money += ownableData.houseCost / 2;
    ownableData.housesAmount -= 1;
  }

  // Write updates back to the database
  await updatePlayerData(playerId, sessionId, playerData);
  await updateOwnableData(tileName, sessionId, ownableData);
}

export async function endTurn(sessionId: string) {
  if (!(await assertPlayerActionAllowed("END_TURN", sessionId))) return;

  const currentPlayerId: string = await getPlayerId();
  endPlayersTurn(sessionId, currentPlayerId);
}

export async function callUpdatePlayerStatus(sessionId: string) {
  const playerId: string = await getPlayerId();
  updatePlayerStatus(sessionId, playerId);
}

export async function bankrupt(sessionId: string) {
  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);
  const gameData: GameData = await fetchGameData(sessionId);

  // Mark player as OUT
  playerData.status = "OUT";

  // Reset all properties owned by the player
  if (playerData.ownables) {
    for (const ownable of playerData.ownables) {
      const ownableData: Ownable = await fetchOwnableData(ownable, sessionId);
      ownableData.owner = "";
      ownableData.mortgaged = false;
      ownableData.housesAmount = 0;
      console.log("ownableData", ownableData);
      await updateOwnableData(ownable, sessionId, ownableData);
    }
  }

  // Clear player data
  playerData.ownables = [];
  playerData.money = 0;
  playerData.doublesInRow = 0;
  console.log("playerData", playerData);
  // Save updates in correct order
  await updatePlayerData(playerId, sessionId, playerData);
  console.log("playerData updated");
  // Finally end the turn
  await endPlayersTurn(sessionId, playerId);
  // Remove player from active list
  // gameData.playersInSession = gameData.playersInSession.filter((id) => id !== playerId);
  // await updateGameData(sessionId, gameData);
}

//extra developer actions

export async function goToJail(sessionId: string) {
  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);
  playerData.status = "JAIL";
  playerData.pos = defaultBoard.findIndex((tile) => tile.subtype === "jail");
  await updatePlayerData(playerId, sessionId, playerData);
  endPlayersTurn(sessionId, playerId);
}

export async function goToNextCardSpace(sessionId: string) {

  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);
  const tile = defaultBoard[playerData.pos];

  const nextCardSpaceIndex = defaultBoard.findIndex(
    (tile) => tile.type === "event" && (tile.subtype === "chest" || tile.subtype === "chance") && tile.id > playerData.pos + 1
  );

  if (nextCardSpaceIndex === -1) {
    throw new Error("No card space found");
  }

  playerData.pos = nextCardSpaceIndex;

  // Write updates back to the database
  await updatePlayerData(playerId, sessionId, playerData);

  await processLanding(sessionId, nextCardSpaceIndex);
}