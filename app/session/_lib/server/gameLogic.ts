"use server";

import defaultBoard from "@/data/boards/default";
import {
  assertPlayerActionAllowed,
  isPropertyForSale,
  setPlayersStatus,
  updatePlayerStatus,
} from "./helperFunctions";

export async function processLanding(sessionId: string, tilePos: number) {
  switch (defaultBoard[tilePos].type) {
    case "event":
      await handleEvent(sessionId);
      //tilfälligt
      await setPlayersStatus(sessionId, "PLAYING");
      return;
    case "ownable":
      if (await isPropertyForSale(sessionId))
        await setPlayersStatus(sessionId, "BUYING");
      else await handleLandingOnProperty(sessionId);
      return;
  }
}

async function handleLandingOnProperty(sessionId: string) {
  //tilfälligt
  await setPlayersStatus(sessionId, "FINISHING");
}

async function handleEvent(sessionId: string) {}
