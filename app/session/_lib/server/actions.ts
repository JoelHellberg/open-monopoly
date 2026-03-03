"use server";

import { getRTDBAdmin } from "@/app/_lib/firebaseAdmin";
import defaultBoard from "@/data/boards/default";
import { endPlayersTurn, processLanding, startPlayersTurn } from "./gameLogic";
import { GameData, Ownable, Player, Trade } from "@/types/gameTypes";
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

export async function auction(sessionId: string) {
  if (!(await assertPlayerActionAllowed("AUCTION", sessionId))) return;

  const playerId: string = await getPlayerId();
  const playerData: Player = await fetchPlayerData(playerId, sessionId);
  const gameData: GameData = await fetchGameData(sessionId);
  const tile = defaultBoard[playerData.pos];

  const ownableId = tile.name;
  const ownableData: Ownable = await fetchOwnableData(ownableId, sessionId);

  // prepare auction state in game data
  gameData.auction = {
    tile: ownableId,
    currentBid: ownableData.price / 2, // start at half price
    highestBidderId: "",
    participants: [...gameData.playersInSession],
  };

  // update global game data with auction info
  await updateGameData(sessionId, gameData);

  // set all players into auction status so their UI can react
  for (const pid of gameData.playersInSession) {
    await setPlayersStatus(sessionId, pid, "AUCTION");
  }
}

export async function bidAuction(sessionId: string, amount: number) {
  const playerId: string = await getPlayerId();
  const gameData: GameData = await fetchGameData(sessionId);

  if (!gameData.auction) {
    throw new Error("No auction in progress");
  }

  // must beat current bid
  if (amount <= gameData.auction.currentBid) {
    throw new Error("Bid must be higher than current bid");
  }

  // ensure bidder has enough money
  const bidder: Player = await fetchPlayerData(playerId, sessionId);
  if (bidder.money < amount) {
    throw new Error("Not enough money to place bid");
  }

  gameData.auction.currentBid = amount;
  gameData.auction.highestBidderId = playerId;

  await updateGameData(sessionId, gameData);
}


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

export async function sendChatMessage(sessionId: string, message: string, timeStamp: number) {
  const playerId: string = await getPlayerId();
  const rtdb = await getRTDBAdmin();

  const messageRef = rtdb.ref(`games/${sessionId}/gameChatMessages`).push();
  await messageRef.set({
    messageContent: message,
    playerId: playerId,
    timeStamp: timeStamp,
  });
}

export async function createTrade(sessionId: string, trade: Trade) {
  const rtdb = await getRTDBAdmin();
  const tradeRef = rtdb.ref(`games/${sessionId}/trades`).push();
  await tradeRef.set(trade);
}

// Trade Actions

export async function acceptTrade(sessionId: string, tradeId: string) {
  const playerId: string = await getPlayerId();
  const rtdb = await getRTDBAdmin();

  const tradeRef = rtdb.ref(`games/${sessionId}/trades/${tradeId}`);
  const tradeSnapshot = await tradeRef.get();

  if (!tradeSnapshot.exists()) {
    throw new Error("Trade not found");
  }

  const tradeData: Trade = tradeSnapshot.val();

  if (tradeData.receivingPlayer !== playerId) {
    throw new Error("You are not the receiving player");
  }

  const offeringPlayer: Player = await fetchPlayerData(tradeData.offeringPlayer, sessionId);
  const receivingPlayer: Player = await fetchPlayerData(tradeData.receivingPlayer, sessionId);

  // Default arrays to empty if undefined (firebase quirks)
  tradeData.offeringProperties = tradeData.offeringProperties || [];
  tradeData.receivingProperties = tradeData.receivingProperties || [];
  tradeData.offeringFreeRent = tradeData.offeringFreeRent || [];
  tradeData.receivingFreeRent = tradeData.receivingFreeRent || [];
  tradeData.offeringSharedIncome = tradeData.offeringSharedIncome || [];
  tradeData.receivingSharedIncome = tradeData.receivingSharedIncome || [];

  // Validate money
  if (offeringPlayer.money < tradeData.offeringMoney) throw new Error("Offering player usually don't have enough money");
  if (receivingPlayer.money < tradeData.receivingMoney) throw new Error("You don't have enough money");

  // Validate properties
  const allOfferingPropsOwned = tradeData.offeringProperties.every(prop => offeringPlayer.ownables.includes(prop));
  const allReceivingPropsOwned = tradeData.receivingProperties.every(prop => receivingPlayer.ownables.includes(prop));
  if (!allOfferingPropsOwned) throw new Error("Offering player doesn't own all offered properties");
  if (!allReceivingPropsOwned) throw new Error("You don't own all requested properties");

  // Execute Trade - Money
  offeringPlayer.money -= tradeData.offeringMoney;
  offeringPlayer.money += tradeData.receivingMoney;

  receivingPlayer.money -= tradeData.receivingMoney;
  receivingPlayer.money += tradeData.offeringMoney;

  // Execute Trade - Properties
  // Remove from owners
  offeringPlayer.ownables = offeringPlayer.ownables.filter(prop => !tradeData.offeringProperties.includes(prop));
  receivingPlayer.ownables = receivingPlayer.ownables.filter(prop => !tradeData.receivingProperties.includes(prop));

  // Add to new owners
  offeringPlayer.ownables.push(...tradeData.receivingProperties);
  receivingPlayer.ownables.push(...tradeData.offeringProperties);

  // Update Property Ownership Data
  for (const prop of tradeData.offeringProperties) {
    const propData: Ownable = await fetchOwnableData(prop, sessionId);
    propData.owner = receivingPlayer.id;
    await updateOwnableData(prop, sessionId, propData);
  }

  for (const prop of tradeData.receivingProperties) {
    const propData: Ownable = await fetchOwnableData(prop, sessionId);
    propData.owner = offeringPlayer.id;
    await updateOwnableData(prop, sessionId, propData);
  }

  // Handle Free Rent
  // Add offered free rent to receiver
  for (const prop of tradeData.offeringFreeRent) {
    const propData: Ownable = await fetchOwnableData(prop, sessionId);
    if (!propData.freeRent) propData.freeRent = [];
    propData.freeRent.push(receivingPlayer.id);
    await updateOwnableData(prop, sessionId, propData);
  }
  // Add requested free rent to offerer
  for (const prop of tradeData.receivingFreeRent) {
    const propData: Ownable = await fetchOwnableData(prop, sessionId);
    if (!propData.freeRent) propData.freeRent = [];
    propData.freeRent.push(offeringPlayer.id);
    await updateOwnableData(prop, sessionId, propData);
  }

  // Handle Shared Income
  // Add offered shared income to receiver
  for (const [prop, percent] of tradeData.offeringSharedIncome) {
    const propData: Ownable = await fetchOwnableData(prop, sessionId);
    if (!propData.incomePercent) propData.incomePercent = { [propData.owner]: 100 };
    propData.incomePercent[receivingPlayer.id] = (propData.incomePercent[receivingPlayer.id] || 0) + percent;
    await updateOwnableData(prop, sessionId, propData);
  }
  // Add requested shared income to offerer
  for (const [prop, percent] of tradeData.receivingSharedIncome) {
    const propData: Ownable = await fetchOwnableData(prop, sessionId);
    if (!propData.incomePercent) propData.incomePercent = { [propData.owner]: 100 };
    propData.incomePercent[offeringPlayer.id] = (propData.incomePercent[offeringPlayer.id] || 0) + percent;
    await updateOwnableData(prop, sessionId, propData);
  }

  // Save Player Data
  await updatePlayerData(offeringPlayer.id, sessionId, offeringPlayer);
  await updatePlayerData(receivingPlayer.id, sessionId, receivingPlayer);

  // Use updatePlayerStatus to refresh potential UI states if necessary
  // No strict 'status' change but refreshes help
  updatePlayerStatus(sessionId, offeringPlayer.id);
  updatePlayerStatus(sessionId, receivingPlayer.id);

  // Remove Trade
  await tradeRef.remove();
}

export async function cancelTrade(sessionId: string, tradeId: string) {
  const playerId: string = await getPlayerId();
  const rtdb = await getRTDBAdmin();

  const tradeRef = rtdb.ref(`games/${sessionId}/trades/${tradeId}`);
  const tradeSnapshot = await tradeRef.get();

  if (!tradeSnapshot.exists()) {
    throw new Error("Trade not found");
  }

  const tradeData: Trade = tradeSnapshot.val();

  // Allow cancellation if you are the one who offered OR the one receiving (Deny)
  if (tradeData.offeringPlayer !== playerId && tradeData.receivingPlayer !== playerId) {
    throw new Error("You do not have permission to cancel this trade");
  }

  await tradeRef.remove();
}

//
//
// Extra developer actions
//
// Remove when in production

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