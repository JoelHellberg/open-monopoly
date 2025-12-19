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

export async function hostGame(board: Tile[]) {
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
  await addPlayerToGame(hostPlayerId, sessionId);

  for (const street of board) {
    if (street.type === "ownable") {
      switch (street.subtype) {
        case "property":
          await addPropertyToGame(street, sessionId);
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
