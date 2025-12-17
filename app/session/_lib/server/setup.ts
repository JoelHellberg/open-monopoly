import { getFirestoreAdmin } from "@/app/_lib/firebaseAdmin";
import { PropertyTile, RailroadTile, UtilityTile } from "@/types/board";
import { GameData } from "@/types/gameTypes";

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
  console.log("0");
}

export async function addPropertyToGame(
  street: PropertyTile,
  sessionId: string
) {
  console.log("1");
}

export async function addTransportToGame(
  street: RailroadTile,
  sessionId: string
) {
  console.log("2");
}

export async function addCompanyToGame(street: UtilityTile, sessionId: string) {
  console.log("3");
}
