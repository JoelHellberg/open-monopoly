"use server";
import { getRTDBAdmin } from "@/app/_lib/firebaseAdmin";
import { PropertyTile, RailroadTile, UtilityTile } from "@/types/board";
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

export async function addPlayerToGame(userId: string, sessionId: string) {
  const rtdb = await getRTDBAdmin();
  const playerData: Player = {
    money: 1000,
    ownables: [],
    pos: 0,
    status: "",
    color: "",
  };

  await rtdb.ref(`games/${sessionId}/players/${userId}`).set(playerData);
  await rtdb.ref(`games/${sessionId}/playersInSession/${userId}`).set(true);
}

export async function addPropertyToGame(
  street: PropertyTile,
  sessionId: string
) {
  const ownableData: Ownable = {
    type: "property",
    familyMembers: [],
    housesAmount: 0,
    owner: "",
    cost: street.houseCost,
    rent: street.rent,
  };
  addOwnableToGame(ownableData, street.name, sessionId);
}

export async function addTransportToGame(
  street: RailroadTile,
  sessionId: string
) {
  const ownableData: Ownable = {
    type: "transportation",
    familyMembers: [],
    housesAmount: 0,
    owner: "",
    cost: 0,
    rent: street.rent,
  };
  addOwnableToGame(ownableData, street.name, sessionId);
}

export async function addCompanyToGame(street: UtilityTile, sessionId: string) {
  const ownableData: Ownable = {
    type: "company",
    familyMembers: [],
    housesAmount: 0,
    owner: "",
    cost: 0,
    rent: street.multiplier,
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
