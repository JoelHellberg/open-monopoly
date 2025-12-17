import { Tile } from "@/types/board";
import { GameData } from "@/types/gameTypes";
import {
  addCompanyToGame,
  addPlayerToGame,
  addPropertyToGame,
  addTransportToGame,
} from "../server/setup";

export async function hostGame(board: Tile[]) {
  const hostPlayerId: string = "aa";
  const gameData: GameData = {
    diceOne: 1,
    diceTwo: 1,
    host: hostPlayerId,
    currentPlayer: 0,
    playersInSession: [hostPlayerId],
    gameIsOn: false,
  };
  await addPlayerToGame(hostPlayerId);

  for (const street of board) {
    if (street.type === "ownable") {
      switch (street.subtype) {
        case "property":
          await addPropertyToGame(street);
          break;
        case "transportation":
          await addTransportToGame(street);
          break;
        case "company":
          await addCompanyToGame(street);
          break;
      }
    }
  }
  
  window.location.href = "/session"
}
