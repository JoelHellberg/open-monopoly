"use server";

import defaultBoard from "@/data/boards/default";
import { assertPlayerActionAllowed, setPlayersStatus } from "./helperFunctions";

export async function processLanding(sessionId: string, tilePos: number) {
  switch (defaultBoard[tilePos].type) {
    case "event":
      //tilfälligt
      await setPlayersStatus(sessionId, "PLAYING");
      return;
    case "ownable":
      await setPlayersStatus(sessionId, "BUYING");
      return;
  }
}

export async function endTurn(sessionId: string) {}
