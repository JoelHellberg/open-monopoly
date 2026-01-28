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
import { chanceCards } from "@/data/cards/chance";
import { communityChestCards } from "@/data/cards/communityChest";
import { Card } from "@/types/gameTypes";

export async function startPlayersTurn(sessionId: string, playerId: string) {
  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  if (playerData.status === "JAIL") {
    await updatePlayerStatus(sessionId, playerId);
    return;
  }

  if (playerData.status === "JAIL1" || playerData.status === "JAIL2" || playerData.status === "JAIL3") {
    return;
  }

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
      //break; // remove this later, no way to get out of jail now
      const jailIndex = defaultBoard.findIndex(
        (tile) => tile.subtype === "jail"
      );
      playerData.pos = jailIndex;
      await updatePlayerData(playerId, sessionId, playerData);
      await setPlayersStatus(sessionId, playerId, "JAIL");
      await endPlayersTurn(sessionId, playerId);
      return;
    case "tax":
      playerData.money -= defaultBoard[tilePos].amount;
      await updatePlayerData(playerId, sessionId, playerData);
      break;
    case "chance":
      const chanceResult = await handleCard(sessionId, playerId, "chance");
      if (chanceResult !== "CONTINUE") return;
      break;
    case "chest":
      const chestResult = await handleCard(sessionId, playerId, "chest");
      if (chestResult !== "CONTINUE") return;
      break;
  }

  // Calculate if doubles
  const gameData: GameData = await fetchGameData(sessionId);
  const rolledDoubles = gameData.diceOne == gameData.diceTwo;
  if (rolledDoubles) await setPlayersStatus(sessionId, playerId, "PLAYING");
  else await setPlayersStatus(sessionId, playerId, "FINISHING");
}

export async function endPlayersTurn(sessionId: string, playerId: string) {
  const playerData: Player = await fetchPlayerData(playerId, sessionId);
  if (playerData.status === "JAIL") console.log("Player is in jail");
  else await updatePlayerStatus(sessionId, playerId)
  if (playerData.status === "PLAYING") return;

  const gameData: GameData = await fetchGameData(sessionId);
  gameData.currentPlayer =
    (gameData.currentPlayer + 1) % gameData.playersInSession.length;
  await updateGameData(sessionId, gameData);

  const newPlayerId = gameData.playersInSession[gameData.currentPlayer];
  await startPlayersTurn(sessionId, newPlayerId);
}

async function handleCard(sessionId: string, playerId: string, type: "chance" | "chest"): Promise<string> {
  const deck = type === "chance" ? chanceCards : communityChestCards;
  const card = deck[Math.floor(Math.random() * deck.length)];

  // Log card for debugging/history
  console.log(`Player ${playerId} drew card: ${type},${card.text}`);

  const playerData: Player = await fetchPlayerData(playerId, sessionId);

  switch (card.action) {
    case "MOVE":
      let newPos = -1;
      const currentPos = playerData.pos;

      if (card.target !== undefined) {
        newPos = card.target;
      } else if (card.subaction) {
        if (card.subaction === "nearest_utility") {
          // Utilities are at indices 12 and 28
          const utilities = [12, 28];
          // Find next utility
          const nextUtility = utilities.find(u => u > currentPos) || utilities[0];
          if (nextUtility < currentPos) playerData.money += 200; // Passed Go
          newPos = nextUtility;
        } else if (card.subaction === "nearest_railroad") {
          // Railroads are at indices 5, 15, 25, 35
          const railroads = [5, 15, 25, 35];
          const nextRailroad = railroads.find(r => r > currentPos) || railroads[0];
          if (nextRailroad < currentPos) playerData.money += 200; // Passed Go
          newPos = nextRailroad;
        }
      }

      if (newPos !== -1) {
        // Handle "Advance to <target>"
        // If passing Go, collect 200
        if (card.target !== undefined) {
          if (newPos < currentPos && card.target !== 0) { // 0 is Go
            playerData.money += 200;
          }
        }

        playerData.pos = newPos;
        await updatePlayerData(playerId, sessionId, playerData);
      }
      await processLanding(sessionId, newPos);
      return "MOVED_AND_LANDED";

    case "MOVEREL":
      if (card.value) {
        const boardLength = defaultBoard.length;
        let newPos = (playerData.pos + card.value) % boardLength;
        if (newPos < 0) newPos += boardLength;

        playerData.pos = newPos;
        await updatePlayerData(playerId, sessionId, playerData);
        await processLanding(sessionId, newPos);
      }
      return "MOVED_AND_LANDED";

    case "PAY":
      if (card.value) {
        playerData.money -= card.value;
        await updatePlayerData(playerId, sessionId, playerData);
      }
      break;

    case "RECEIVE":
      if (card.value) {
        playerData.money += card.value;
        await updatePlayerData(playerId, sessionId, playerData);
      }
      break;

    case "GO_TO_JAIL":
      const jailIndex = defaultBoard.findIndex(
        (tile) => tile.subtype === "jail"
      );
      playerData.pos = jailIndex;
      await updatePlayerData(playerId, sessionId, playerData);
      await setPlayersStatus(sessionId, playerId, "JAIL");
      await endPlayersTurn(sessionId, playerId);
      return "TURN_ENDED";

    case "JAIL_FREE":
      playerData.jailFreeCards = (playerData.jailFreeCards || 0) + 1;
      await updatePlayerData(playerId, sessionId, playerData);
      break;

    case "PAY_ALL":
      if (card.value) {
        const gameData = await fetchGameData(sessionId);
        const players = gameData.playersInSession;
        let totalPaid = 0;

        for (const pid of players) {
          if (pid !== playerId) {
            const pData = await fetchPlayerData(pid, sessionId);
            pData.money += card.value;
            await updatePlayerData(pid, sessionId, pData);
            totalPaid += card.value;
          }
        }
        playerData.money -= totalPaid;
        await updatePlayerData(playerId, sessionId, playerData);
      }
      break;

    case "RECEIVE_ALL":
      if (card.value) {
        const gameData = await fetchGameData(sessionId);
        const players = gameData.playersInSession;
        let totalReceived = 0;

        for (const pid of players) {
          if (pid !== playerId) {
            const pData = await fetchPlayerData(pid, sessionId);
            pData.money -= card.value;
            await updatePlayerData(pid, sessionId, pData);
            totalReceived += card.value;
          }
        }
        playerData.money += totalReceived;
        await updatePlayerData(playerId, sessionId, playerData);
      }
      break;
  }
  return "CONTINUE";
}
