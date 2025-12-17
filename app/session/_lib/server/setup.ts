"use server";
import { getFirestoreAdmin } from "@/app/_lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { PropertyTile, RailroadTile, UtilityTile } from "@/types/board";
import { GameData, Ownable, Player } from "@/types/gameTypes";

function generateRandomId(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export async function addGameDataToDB(gameData: GameData): Promise<string> {
  const db = await getFirestoreAdmin();
  const gameId = generateRandomId(6);

  await db.collection("gameData").doc(gameId).create(gameData);

  return gameId;
}

export async function addPlayerToGame(userId: string, sessionId: string) {
  const db = await getFirestoreAdmin();
  const playerData: Player = {
    money: 0,
    ownables: [],
    pos: 0,
    status: "",
    color: "",
  };

  await db
    .collection("gameData")
    .doc(sessionId)
    .collection("players")
    .doc(userId)
    .create(playerData);

  await db
    .collection("gameData")
    .doc(sessionId)
    .update({
      playersInSession: FieldValue.arrayUnion(userId),
    });
}

export async function addPropertyToGame(
  street: PropertyTile,
  sessionId: string
) {
  const db = await getFirestoreAdmin();
  const ownableData: Ownable = {
    type: "property",
    familyMembers: [],
    housesAmount: 0,
    owner: "",
    cost: street.houseCost,
    rent: street.rent,
  };
  await db
    .collection("gameData")
    .doc(sessionId)
    .collection("ownables")
    .doc(street.name)
    .create(ownableData);
}

export async function addTransportToGame(
  street: RailroadTile,
  sessionId: string
) {
  const db = await getFirestoreAdmin();
  const ownableData: Ownable = {
    type: "transportation",
    familyMembers: [],
    housesAmount: 0,
    owner: "",
    cost: 0,
    rent: street.rent,
  };
  await db
    .collection("gameData")
    .doc(sessionId)
    .collection("ownables")
    .doc(street.name)
    .create(ownableData);
}

export async function addCompanyToGame(street: UtilityTile, sessionId: string) {
  const db = await getFirestoreAdmin();
  const ownableData: Ownable = {
    type: "company",
    familyMembers: [],
    housesAmount: 0,
    owner: "",
    cost: 0,
    rent: street.multiplier,
  };
  await db
    .collection("gameData")
    .doc(sessionId)
    .collection("ownables")
    .doc(street.name)
    .create(ownableData);
}
