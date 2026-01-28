"use client";
import Dice from "@/components/dice";
import { useGameData } from "../_lib/data/gameData";
import {
  endTurn,
  purchase,
  startGame,
  throwDice,
  callUpdatePlayerStatus,
  rollJail,
  payJail,
  goToJail,
  goToNextCardSpace,
  useJailFreeCard,
} from "../_lib/server/actions";
import { useParams } from "next/navigation";
import defaultBoard from "@/data/boards/default";
import type { PropertyTile, RailroadTile, UtilityTile, Tile } from "@/types/board";

export default function ActionsDisplay() {
  const gameData = useGameData((state) => state.data);
  const playerId = useGameData((state) => state.ownPlayerId);
  const playerData = useGameData((state) => state.players?.[playerId] ?? null);
  const tile = playerData ? defaultBoard[playerData.pos] : null;

  const isOwnableTile = (tile: Tile | null): tile is PropertyTile | RailroadTile | UtilityTile => tile?.type === "ownable";
  const cost = isOwnableTile(tile) ? tile.price : 0;
  const canBuy = (playerData?.money ?? 0) >= cost;
  const jailStatuses = ["JAIL", "JAIL1", "JAIL2", "JAIL3"];
  const canBuyOut = jailStatuses.includes(playerData?.status ?? "") && (playerData?.money ?? 0) >= 50;

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
            {playerData && playerData.status === "BUYING" && <BuyProperty cost={cost} canBuy={canBuy} />}
            {playerData && playerData.status === "FINISHING" && <EndTurn />}
            {playerData && jailStatuses.includes(playerData.status) &&
              <InJail canBuyOut={canBuyOut} jailFreeCards={playerData.jailFreeCards ?? 0} />}
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
    <div className="flex gap-5">
      <button
        className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
        onClick={() => throwDice(sessionId)}
      >
        Throw Dice
      </button>
      <button
        className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
        onClick={() => goToJail(sessionId)}
      >
        Go to Jail immediately
      </button>
      <button
        className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
        onClick={() => goToNextCardSpace(sessionId)}
      >
        Go to next card space
      </button>
    </div>
  );
}

function EndTurn() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  return (
    <div className="flex gap-5">
      <button
        className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
        onClick={() => endTurn(sessionId)}
      >
        End Turn
      </button>
    </div>
  );
}

function BuyProperty({ cost, canBuy }: { cost: number; canBuy: boolean }) {
  const params = useParams();
  const sessionId = params.sessionId as string;
  console.log(canBuy);
  return (
    <div className="flex gap-5">
      <button
        disabled={!canBuy}
        onClick={() => purchase(sessionId)}
        className={`p-2 rounded-md shadow-md
          ${canBuy
            ? "bg-white text-black hover:bg-gray-200 hover:cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"}`}
      >
        Purchase (${cost})
      </button>
      <button
        className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
        onClick={() => callUpdatePlayerStatus(sessionId)}
      >
        Don't buy
      </button>
    </div>
  );
}

function InJail({ canBuyOut, jailFreeCards }: { canBuyOut: boolean; jailFreeCards: number }) {
  const params = useParams();
  const sessionId = params.sessionId as string;
  return (
    <div className="flex gap-5">
      <button
        className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
        onClick={() => rollJail(sessionId)}
      >
        Throw Dice
      </button>
      <button
        disabled={!canBuyOut}
        className={`p-2 rounded-md shadow-md
          ${canBuyOut
            ? "bg-white text-black hover:bg-gray-200 hover:cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"}`}
        onClick={() => payJail(sessionId)}
      >
        Buy Out
      </button>
      {jailFreeCards > 0 && (
        <button
          className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
          onClick={() => useJailFreeCard(sessionId)}
        >
          Use Jail Free Card ({jailFreeCards})
        </button>
      )}
    </div>
  );
}
