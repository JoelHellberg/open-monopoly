"use client";
import ActionsDisplay from "../board/actionsDisplay";
import GameBoard from "../board/gameboard";
import GameChat from "../chat/gameChat";
import PropertiesDisplay from "../propertiesDisplay";
import TurnDisplay from "../turnDisplay";
import { useGameData } from "../_lib/data/gameData";
import Settings from "../settings";
import { useSessionSubscriptions } from "../_lib/client/database";

import { useState } from "react";
import TileInfoPanel from "../board/tileInfoPanel";
import { PropertyTile, RailroadTile, UtilityTile } from "@/types/board";
import TradeButton from "../tradeButton";
import { useParams } from "next/navigation";
import { bankrupt } from "../_lib/server/actions";

type OwnableTile = PropertyTile | RailroadTile | UtilityTile;

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  useSessionSubscriptions();
  const gameData = useGameData((state) => state.data);
  const [selectedTile, setSelectedTile] = useState<OwnableTile | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {selectedTile && (
        <TileInfoPanel tile={selectedTile} onClose={() => setSelectedTile(null)} />
      )}
      <main className="flex h-screen w-screen gap-3 p-2 [&>div]:rounded-lg">
        <div className="bg-blue-400 flex flex-1">
          <div className="flex flex-col flex-1 gap-5">
            <div className="bg-green-400 flex items-center justify-between p-2 rounded-t-lg">
              <span className="text-sm font-semibold truncate mr-2">
                Game ID: {sessionId}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded transition-colors"
                title="Copy Game ID"
              >
                {copied ? (<><span>✅ Copied!</span></>) : (<><span>📋 Copy</span></>)}
              </button>
            </div>
            <TradeButton />
            <GameChat />
          </div>
        </div>
        <div className="relative h-full aspect-square bg-pink-400">
          <ActionsDisplay />
          <GameBoard onSelectTile={setSelectedTile} />
        </div>
        <div className="bg-blue-400 flex flex-col flex-1 gap-5">
          <TurnDisplay />
          <div className="bg-red-400 rounded-lg text-center">
            <button
              className="text-sm rounded-md shadow-md 
                text-black bg-white hover:bg-gray-200 hover:cursor-pointer"
              onClick={() => bankrupt(sessionId)}
            >Bankrupt</button>
          </div>
          <div className="flex flex-col flex-2 bg-red-400 rounded-lg">
            {gameData && gameData.gameIsOn ? (
              <PropertiesDisplay onSelectTile={setSelectedTile} />
            ) : (
              <Settings />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
