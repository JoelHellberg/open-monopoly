import { useState } from "react";
import ActionsDisplay from "./board/actionsDisplay";
import GameBoard from "./board/gameboard";
import GameChat from "./chat/gameChat";
import PropertyDisplay from "./propertiesDisplay";
import TurnDisplay from "./turnDisplay";
import TileInfoPanel from "./board/tileInfoPanel";
import { PropertyTile, RailroadTile, UtilityTile } from "@/types/board";

type OwnableTile = PropertyTile | RailroadTile | UtilityTile;

export default function Home() {
  const [selectedTile, setSelectedTile] = useState<OwnableTile | null>(null);

  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {selectedTile && (
        <TileInfoPanel tile={selectedTile} onClose={() => setSelectedTile(null)} />
      )}
      <main className="flex h-screen w-screen gap-3 p-2 [&>div]:rounded-lg">
        <div className="bg-yellow-400 flex flex-1">
          <GameChat />
        </div>
        <div className="relative h-full aspect-square bg-pink-400">
          <ActionsDisplay />
          <GameBoard onSelectTile={setSelectedTile} />
        </div>
        <div className="bg-blue-400 flex flex-col flex-1 gap-5">
          <TurnDisplay />
          <div className="flex flex-col flex-2 bg-red-400 rounded-lg">
            <PropertyDisplay onSelectTile={setSelectedTile} />
          </div>
        </div>
      </main>
    </div>
  );
}
