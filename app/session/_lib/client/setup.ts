import { Tile } from "@/types/board";
import { GameData } from "@/types/gameTypes";
import {
  addCompanyToGame,
  addGameDataToDB,
  addPlayerToGame,
  addPropertyToGame,
  addTransportToGame,
} from "../server/setup";
import { createGameSession, verifySession } from "@/app/_lib/session";

export async function hostGame(board: Tile[], color: string) {
  const { userId: playerId } = await verifySession();
  const hostPlayerId = playerId as string;

  const gameData: GameData = {
    diceOne: 1,
    diceTwo: 1,
    host: hostPlayerId,
    currentPlayer: 0,
    playersInSession: [],
    gameIsOn: false,
  };

  const sessionId = await addGameDataToDB(gameData);
  await addPlayerToGame(hostPlayerId, sessionId, color);

  for (const street of board) {
    if (street.type === "ownable") {
      switch (street.subtype) {
        case "property":
          await addPropertyToGame(street, sessionId, board);
          break;
        case "transportation":
          await addTransportToGame(street, sessionId);
          break;
        case "company":
          await addCompanyToGame(street, sessionId);
          break;
      }
    }
  }

  await createGameSession(hostPlayerId);
  window.location.href = "/session/" + sessionId;
}

export async function joinGame(sessionId: string, color: string) {
  const isValid = /^[A-Z0-9]{6}$/.test(sessionId);
  if (!isValid) {
    throw new Error("Invalid Session ID. Must be 6 alphanumeric uppercase characters.");
  }

  const { checkGameExists } = await import("../server/setup");
  const exists = await checkGameExists(sessionId);

  if (!exists) {
    throw new Error("Game session not found.");
  }

  const { userId: playerId } = await verifySession();
  const joiningPlayerId = playerId as string;

  await addPlayerToGame(joiningPlayerId, sessionId, color);
  await createGameSession(joiningPlayerId);

  window.location.href = "/session/" + sessionId;
}
