"use server";

import { getRTDBAdmin } from "@/app/_lib/firebaseAdmin";
import { Ownable, Player } from "@/types/gameTypes";

export async function fetchPlayerData(
  playerId: string,
  sessionId: string
): Promise<Player> {
  const rtdb = await getRTDBAdmin();
  const playerRef = rtdb.ref(`games/${sessionId}/players/${playerId}`);
  const playerSnapshot = await playerRef.get();
  if (!playerSnapshot.exists()) {
    throw new Error("Player not found");
  }
  const playerData: Player = playerSnapshot.val();
  return playerData;
}

export async function updatePlayerData(
  playerId: string,
  sessionId: string,
  playerData: Player
) {
  const rtdb = await getRTDBAdmin();
  const playerRef = rtdb.ref(`games/${sessionId}/players/${playerId}`);
  await playerRef.set(playerData);
}

export async function fetchOwnableData(
  ownableId: string,
  sessionId: string
): Promise<Ownable> {
  const rtdb = await getRTDBAdmin();
  const ownableRef = rtdb.ref(`games/${sessionId}/ownables/${ownableId}`);
  const ownableSnapshot = await ownableRef.get();
  if (!ownableSnapshot.exists()) {
    throw new Error("Ownable not found");
  }
  const ownableData: Ownable = ownableSnapshot.val();
  return ownableData;
}

export async function updateOwnableData(
  ownableId: string,
  sessionId: string,
  ownableData: Ownable
) {
  const rtdb = await getRTDBAdmin();
  const ownableRef = rtdb.ref(`games/${sessionId}/ownables/${ownableId}`);
  await ownableRef.set(ownableData);
}
