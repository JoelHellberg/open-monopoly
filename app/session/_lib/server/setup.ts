"use server";
import { getRTDBAdmin } from "@/app/_lib/firebaseAdmin";
import { PropertyTile, RailroadTile, Tile, UtilityTile } from "@/types/board";
import { GameData, Ownable, Player } from "@/types/gameTypes";

function generateRandomId(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export async function addGameDataToDB(gameData: GameData): Promise<string> {
  const rtdb = await getRTDBAdmin();
  const gameId = generateRandomId(6);

  await rtdb.ref(`games/${gameId}`).set(gameData);

  return gameId;
}

export async function checkGameExists(sessionId: string): Promise<boolean> {
  const rtdb = await getRTDBAdmin();
  const snapshot = await rtdb.ref(`games/${sessionId}`).get();
  return snapshot.exists();
}

export async function addPlayerToGame(userId: string, sessionId: string, color: string, name: string) {
  const rtdb = await getRTDBAdmin();
  // Check if game has started
  const gameRef = rtdb.ref(`games/${sessionId}`);
  const gameSnapshot = await gameRef.get();
  const gameData = gameSnapshot.val();
  if (gameData.gameIsOn) {
    throw new Error("Game has already started.");
  }
  // Check if player already exists
  const playerRef = rtdb.ref(`games/${sessionId}/players/${userId}`);
  const playerSnapshot = await playerRef.get();

  if (!playerSnapshot.exists()) {
    const playerData: Player = {
      id: userId,
      name: name,
      money: 1000,
      ownables: [],
      pos: 0,
      status: "",
      color: color,
      doublesInRow: 0,
      jailFreeCards: 0,
    };

    await playerRef.set(playerData);
  } else {
    // Update color and name if player exists!
    await playerRef.update({
      color: color,
      name: name
    });
  }

  await rtdb.ref(`games/${sessionId}/playersInSession/${userId}`).set(true);
}

export async function addPropertyToGame(
  street: PropertyTile,
  sessionId: string,
  board: Tile[]
) {
  const ownableData: Ownable = {
    id: street.name,
    type: "property",
    familyMembers: board.filter((el): el is PropertyTile => el.type === "ownable" && el.subtype === "property").filter(el => el.color === street.color).map(el => el.name),
    housesAmount: 0,
    owner: "",
    mortgaged: false,
    price: street.price,
    houseCost: street.houseCost,
    rent: street.rent,
    freeRent: [],
    incomePercent: {},
  };
  addOwnableToGame(ownableData, street.name, sessionId);
}

export async function addTransportToGame(
  street: RailroadTile,
  sessionId: string
) {
  const ownableData: Ownable = {
    id: street.name,
    type: "transportation",
    familyMembers: [],
    housesAmount: 0,
    owner: "",
    mortgaged: false,
    price: street.price,
    houseCost: 0,
    rent: street.rent,
    freeRent: [],
    incomePercent: {},
  };
  addOwnableToGame(ownableData, street.name, sessionId);
}

export async function addCompanyToGame(street: UtilityTile, sessionId: string) {
  const ownableData: Ownable = {
    id: street.name,
    type: "company",
    familyMembers: [],
    housesAmount: 0,
    owner: "",
    mortgaged: false,
    price: street.price,
    houseCost: 0,
    rent: street.multiplier,
    freeRent: [],
    incomePercent: {},
  };
  addOwnableToGame(ownableData, street.name, sessionId);
}

export async function addOwnableToGame(
  ownableData: Ownable,
  streetName: string,
  sessionId: string
) {
  const rtdb = await getRTDBAdmin();
  await rtdb.ref(`games/${sessionId}/ownables/${streetName}`).set(ownableData);
}
