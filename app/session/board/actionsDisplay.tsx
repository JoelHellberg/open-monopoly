"use client";
import Dice from "@/components/dice";
import { useGameData } from "../_lib/data/gameData";
import {
  endTurn,
  purchase,
  auction,
  startGame,
  throwDice,
  callUpdatePlayerStatus,
  rollJail,
  payJail,
  goToJail,
  goToNextCardSpace,
  useJailFreeCard,
  submitBlindBid,
  finalizeAuction,
  dismissAuction,
} from "../_lib/server/actions";
import { useParams } from "next/navigation";
import { defaultBoard, allownableBoard } from "@/data/boards/default";
import type { PropertyTile, RailroadTile, UtilityTile, Tile } from "@/types/board";
import { useState, useEffect } from "react";

export default function ActionsDisplay() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const gameData = useGameData((state) => state.data);
  const playerId = useGameData((state) => state.ownPlayerId);
  const playerData = useGameData((state) => state.players?.[playerId] ?? null);
  const tile = playerData ? defaultBoard[playerData.pos] : null;

  const isOwnableTile = (tile: Tile | null): tile is PropertyTile | RailroadTile | UtilityTile => tile?.type === "ownable";
  const cost = isOwnableTile(tile) ? tile.price : 0;
  const canBuy = (playerData?.money ?? 0) >= cost;
  const jailStatuses = ["JAIL1", "JAIL2", "JAIL3"];
  const canBuyOut = jailStatuses.includes(playerData?.status ?? "") && (playerData?.money ?? 0) >= 50;

  return (
    <>
      {/* popup should live outside of parent so pointer-events:none doesn't block it */}
      {gameData?.auction && <AuctionPopup sessionId={sessionId} />}

      <div className="absolute inset-0 m-auto flex flex-col gap-5 items-center justify-center z-10 pointer-events-none select-none">
        <div className="m-auto flex flex-col gap-5 items-center justify-center pointer-events-auto">
          {gameData && !gameData.gameIsOn && playerData?.id === gameData.host ? (
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
              {playerData && jailStatuses.includes(playerData.status) && playerData.id === gameData?.playersInSession[gameData.currentPlayer] &&
                <InJail canBuyOut={canBuyOut} jailFreeCards={playerData.jailFreeCards ?? 0} />}
            </>
          )}
        </div>
      </div>
    </>
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
      <button
        className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
        onClick={() => auction(sessionId)}
      >
        Auction
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

// small popup component shown during auction - blind bidding system
function AuctionPopup({ sessionId }: { sessionId: string }) {
  const gameData = useGameData((s) => s.data);
  const playerId = useGameData((s) => s.ownPlayerId);
  const playerData = useGameData((s) => s.players?.[playerId] ?? null);
  const allPlayers = useGameData((s) => s.players);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  if (!gameData?.auction) return null;

  const { tile, phase, blindBids, bidSubmitted, participants } = gameData.auction;
  const isBiddingPhase = phase === "bidding";
  const myBid = blindBids?.[playerId];
  const hasBid = bidSubmitted?.includes(playerId);

  // Get all bids for reveal phase
  const allBids = participants?.map(pid => ({
    playerId: pid,
    name: allPlayers?.[pid]?.name ?? "Unknown",
    bid: blindBids?.[pid] || 0
  })).sort((a, b) => b.bid - a.bid) || [];

  const highestBid = allBids[0]?.bid || 0;
  const winner = allBids[0]?.playerId === playerId ? "You" : allBids[0]?.name;
  const didWin = allBids[0]?.playerId === playerId;

  // Reset hasSubmitted when auction starts new
  useEffect(() => {
    if (phase === "bidding") {
      setHasSubmitted(false);
      setBidAmount(0);
    }
  }, [phase]);

  const handleSubmitBid = () => {
    if (bidAmount > 0 && (playerData?.money ?? 0) >= bidAmount) {
      submitBlindBid(sessionId, bidAmount);
      setHasSubmitted(true);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 pointer-events-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-black">
        <h3 className="mb-2 font-bold">Auction: {tile}</h3>
        
        {isBiddingPhase ? (
          // Bidding phase - blind bid input
          <>
            <p className="mb-2 text-sm text-gray-600">
              Submit your bid.
            </p>
            <p className="mb-2 text-sm">
              Your money: ${playerData?.money ?? 0}
            </p>
            
            {hasBid ? (
              <div className="mt-4 p-3 bg-green-100 rounded text-center">
                <p className="font-bold">Bid Submitted!</p>
                <p>Your bid: ${myBid}</p>
                <p className="text-sm text-gray-600">Waiting for others...</p>
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <input
                  type="number"
                  className="border p-1 rounded w-full"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  min={1}
                  placeholder="Enter your bid"
                />
                <button
                  className={`p-2 rounded-md shadow-md text-white ${bidAmount > 0 && (playerData?.money ?? 0) >= bidAmount ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"}`}
                  disabled={bidAmount <= 0 || (playerData?.money ?? 0) < bidAmount}
                  onClick={handleSubmitBid}
                >
                  Submit
                </button>
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-600">
              <p>Players who have bid: {bidSubmitted?.length || 0} / {participants?.length || 0}</p>
            </div>
          </>
        ) : (
          // Revealed phase - show all bids
          <>
            <p className="mb-2 font-bold">Results Revealed!</p>
            
            <div className="mt-4 space-y-2">
              {allBids.map((bid, index) => (
                <div 
                  key={bid.playerId} 
                  className={`p-2 rounded ${index === 0 ? "bg-green-100 font-bold" : "bg-gray-100"}`}
                >
                  {index + 1}. {bid.name}: ${bid.bid}
                </div>
              ))}
            </div>
            
            {highestBid > 0 ? (
              <div className="mt-4 p-3 bg-blue-100 rounded text-center">
                <p className="font-bold">{didWin ? "🎉 You Won!" : `Winner: ${winner}`}</p>
                <p>Winning bid: ${highestBid}</p>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-gray-100 rounded text-center">
                <p>No one bid on this property.</p>
              </div>
            )}
            
            <button
              className="mt-4 p-2 w-full bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 hover:cursor-pointer"
              onClick={() => dismissAuction(sessionId)}
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}
