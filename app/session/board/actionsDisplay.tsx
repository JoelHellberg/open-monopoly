"use client";
import Dice from "@/components/dice";
import { useGameData } from "../_lib/data/gameData";
import {
  endTurn,
  purchase,
  startGame,
  throwDice,
} from "../_lib/server/actions";
import { useParams } from "next/navigation";
import defaultBoard from "@/data/boards/default";
import type { PropertyTile, RailroadTile, UtilityTile, Tile } from "@/types/board";

export default function ActionsDisplay() {
  const gameData = useGameData((state) => state.data);
  const playerId = useGameData((state) => state.ownPlayerId);
  const playerData = useGameData((state) => state.players?.[playerId] ?? null);
  const tile = playerData ? defaultBoard[playerData.pos] : null;

  const isOwnableTile = ( tile: Tile | null ): tile is PropertyTile | RailroadTile | UtilityTile => tile?.type === "ownable";
  const cost = isOwnableTile(tile) ? tile.price : 0;

  return (
    <div className="absolute inset-0 m-auto flex flex-col gap-5 items-center justify-center z-10 pointer-events-none select-none">
      <div className="m-auto flex flex-col gap-5 items-center justify-center pointer-events-auto">
        {gameData && !gameData.gameIsOn ? (
          <StartGame />
        ) : (
          <>
            <div className="flex gap-5">
              <Dice numberOfSides={gameData?.diceOne} />
              <Dice numberOfSides={gameData?.diceTwo} />
            </div>
            {playerData && playerData.status === "PLAYING" && <ThrowDice />}
            {playerData && playerData.status === "BUYING" && <BuyProperty cost={cost} />}
            {playerData && playerData.status === "FINISHING" && <EndTurn />}
          </>
        )}
      </div>
    </div>
  );
}

function StartGame() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  return (
    <button
      className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
      onClick={() => startGame(sessionId)}
    >
      Start Game
    </button>
  );
}

function ThrowDice() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  return (
    <button
      className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
      onClick={() => throwDice(sessionId)}
    >
      Throw Dice
    </button>
  );
}

function EndTurn() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  return (
    <button
      className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
      onClick={() => endTurn(sessionId)}
    >
      End Turn
    </button>
  );
}

function BuyProperty({ cost }: { cost: number }) {
  const params = useParams();
  const sessionId = params.sessionId as string;
  return (
    <div className="flex gap-5">
      <button
        className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
        onClick={() => purchase(sessionId)}
      >
        Purchase (${cost})
      </button>
      <button
        className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
        onClick={() => endTurn(sessionId)}
      >
        Don't buy
      </button>
    </div>
  );
}
